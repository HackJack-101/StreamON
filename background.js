var data = {
	twitch: {},
	hitbox: {},
	dailymotion: {},
	youtube: {}
};

function checkStreams()
{
	chrome.storage.sync.get({
		streams: "",
		notif: true
	}, function (options) {
		if (options.notif)
		{
			var s = options.streams;
			var streams = s.split("\n");
			for (var i = 0; i < streams.length; i++)
			{
				if (streams[i].length > 0)
				{
					var url = streams[i];
					var regexpTwitch = /twitch/gi;
					var regexpHitbox = /hitbox/gi;
					if (url.match(regexpTwitch) != null && url.match(regexpTwitch).length > 0)
						checkTwitch(url);
					else if (url.match(regexpHitbox) != null && url.match(regexpHitbox).length > 0)
						checkHitbox(url);
				}
			}
		}
	});
}

function checkTwitch(url)
{
	var profile = getProfileName(url);
	var XHR = new XMLHttpRequest();

	XHR.onreadystatechange = function () {
		if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0))
		{
			var result = JSON.parse(XHR.responseText);
			resultTwitchStream(result.stream !== null, result, profile);
		}
	};
	XHR.open("GET", "https://api.twitch.tv/kraken/streams/" + profile, true);
	XHR.send(null);

}

function checkHitbox(url)
{
	var profile = getProfileName(url);
	var XHR = new XMLHttpRequest();

	XHR.onreadystatechange = function () {
		if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0))
		{
			var result = JSON.parse(XHR.responseText);
			console.log(result);
			resultHitboxStream(result.livestream[0].media_is_live === "1", result, profile);
		}
	};
	XHR.open("GET", "https://api.hitbox.tv/media/live/" + profile, true);
	XHR.send(null);
}

function getProfileName(url)
{
	var n = url.lastIndexOf("/");
	if (n == (url.length - 1))
		return getProfileName(url.substring(0, url.length - 1));
	else
		return url.substring(n + 1);
}

function resultTwitchStream(online, content, profile)
{
	if (!data.twitch[profile])
	{
		data.twitch[profile] = {
			streamOnline: false,
			notificationOpened: false,
			notificationDelay: false,
			game: "",
			title: "",
			logo: ""
		};
	}
	if (online)
	{
		if (!data.twitch[profile].streamOnline)
		{
			data.twitch[profile].streamOnline = true;
			data.twitch[profile].game = content.stream.channel.game;
			data.twitch[profile].title = content.stream.channel.status;
			data.twitch[profile].logo = content.stream.channel.logo;
			displayNotification(profile, "twitch");
		} else
		{
			chrome.storage.sync.get({
				titleNotif: false
			}, function (options) {
				if (options.refreshTime)
				{
					if (content.stream.channel.game != data.twitch[profile].game || data.twitch[profile].title != content.stream.channel.status)
					{
						data.twitch[profile].game = content.stream.channel.game;
						data.twitch[profile].title = content.stream.channel.status;
						data.twitch[profile].logo = content.stream.channel.logo;
						displayNotification(profile, "twitch");
					}
				}
			});
		}
	}
}

function resultHitboxStream(online, content, profile)
{
	if (!data.hitbox[profile])
	{
		data.hitbox[profile] = {
			streamOnline: false,
			notificationOpened: false,
			notificationDelay: false,
			game: "",
			title: "",
			logo: ""
		};
	}
	if (online)
	{
		if (!data.hitbox[profile].streamOnline)
		{
			data.hitbox[profile].streamOnline = true;
			data.hitbox[profile].game = content.livestream[0].category_name;
			data.hitbox[profile].title = content.livestream[0].media_status;
			data.hitbox[profile].logo = 'http://edge.sf.hitbox.tv/' + content.livestream[0].channel.user_logo;
			console.log(data.hitbox[profile].logo);
			displayNotification(profile, "hitbox");
		} else
		{
			chrome.storage.sync.get({
				titleNotif: false
			}, function (options) {
				if (options.refreshTime)
				{
					if (content.livestream[0].category_name != data.hitox[profile].game || data.hitbox[profile].title != content.livestream[0].media_status)
					{
						data.hitbox[profile].game = content.livestream[0].category_name;
						data.hitbox[profile].title = content.livestream[0].media_status;
						data.hitbox[profile].logo = 'http://edge.sf.hitbox.tv/' + content.livestream[0].channel.user_logo;
						displayNotification(profile, "hitbox");
					}
				}
			});
		}
	}
}

function displayNotification(profile, server)
{
	if (!data[server][profile].notificationOpened && !data[server][profile].notificationDelay)
	{
		data[server][profile].notificationOpened = true;
		data[server][profile].notificationDelay = true;

		var startStream = new Notification(data[server][profile].title,
				{
					icon: data[server][profile].logo,
					lang: "fr-FR",
					body: chrome.i18n.getMessage("game") + ' : ' + data[server][profile].game
				}
		);

		startStream.onclick = function () {
			openServer(profile, server);
			data[server][profile].notificationOpened = false;
		};
		startStream.onclose = function () {
			data[server][profile].notificationOpened = false;
		};
		setTimeout(function () {
			data[server][profile].notificationDelay = false;
		}, 1000 * 5 * 60)
	}
}

function main()
{
	checkStreams();
	chrome.storage.sync.get({
		refreshTime: 60
	}, function (options) {
		setInterval(checkStreams, 1000 * options.refreshTime);
	});
}

function openServer(profile, server)
{
	chrome.tabs.query({url: "*://*." + server + ".tv/" + profile}, function (a) {
		if (a.length < 1) // Si la page n'est pas déjà ouverte, on ouvre un nouvel onglet
			chrome.tabs.create({url: "http://www." + server + ".tv/" + profile});
		else // Sinon on passe le focus sur la premiere page contenant le pattern
			chrome.tabs.highlight({windowId: a[0].windowId, tabs: a[0].index});
	});
}

main();