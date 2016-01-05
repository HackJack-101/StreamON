function checkStreams()
{
	chrome.storage.sync.get({
		streams: ""
	}, function (options) {
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

function resultTwitchStream(online, content, profile)
{
	if (online)
	{
		var e = document.createElement("a");
		e.setAttribute("class", "streamOn");
		e.setAttribute("data-profile", profile);
		e.addEventListener("click", clickTwitch, false);
		e.innerHTML = '<img class="preview" src="' + content.stream.preview.medium + '" width="80" height="45" alt="preview"/>\n\
<div class="description">\n\
<span class="title">' + content.stream.channel.status + '</span>\n\
<span class="username">' + content.stream.channel.display_name + '</span> ' + chrome.i18n.getMessage("playingTo") + ' <span>' + content.stream.channel.game + '</span>\n\
</div>';
		document.getElementById("onlineList").appendChild(e);
		var onlineNumber = document.getElementById('online');
		onlineNumber.innerHTML = parseInt(onlineNumber.innerHTML) + 1;
	} else
	{
		var e = document.createElement("div");
		e.setAttribute("class", "streamOff");
		e.innerHTML = profile;
		document.getElementById("offlineList").appendChild(e);
		var offlineNumber = document.getElementById('offline');
		offlineNumber.innerHTML = parseInt(offlineNumber.innerHTML) + 1;
	}
}

function resultHitboxStream(online, content, profile)
{
	if (online)
	{
		var e = document.createElement("a");
		e.setAttribute("class", "streamOn");
		e.setAttribute("data-profile", profile);
		e.addEventListener("click", clickHitbox, false);
		e.innerHTML = '<img class="preview" src="http://edge.sf.hitbox.tv/' + content.livestream[0].media_thumbnail + '" width="80" height="45" alt="preview"/>\n\
<div class="description">\n\
<span class="title">' + content.livestream[0].media_status + '</span>\n\
<span class="username">' + content.livestream[0].media_display_name + '</span> ' + chrome.i18n.getMessage("playingTo") + ' <span>' + content.livestream[0].category_name + '</span>\n\
</div>';
		document.getElementById("onlineList").appendChild(e);
		var onlineNumber = document.getElementById('online');
		onlineNumber.innerHTML = parseInt(onlineNumber.innerHTML) + 1;
	} else
	{
		var e = document.createElement("div");
		e.setAttribute("class", "streamOff");
		e.setAttribute("data-profile", profile);
		e.addEventListener("click", clickHitbox, false);
		e.innerHTML = profile;
		document.getElementById("offlineList").appendChild(e);
		var offlineNumber = document.getElementById('offline');
		offlineNumber.innerHTML = parseInt(offlineNumber.innerHTML) + 1;
	}
}

function openTwitch(profile)
{
	chrome.tabs.query({url: "*://*.twitch.tv/" + profile}, function (a) {
		if (a.length < 1) // Si la page n'est pas déjà ouverte, on ouvre un nouvel onglet
			chrome.tabs.create({url: "http://www.twitch.tv/" + profile});
		else // Sinon on passe le focus sur la premiere page contenant le pattern
			chrome.tabs.highlight({windowId: a[0].windowId, tabs: a[0].index});
	});
}

function clickTwitch(e)
{
	openTwitch(this.getAttribute('data-profile'));
}

function openHitbox(profile)
{
	chrome.tabs.query({url: "*://*.hitbox.tv/" + profile}, function (a) {
		if (a.length < 1) // Si la page n'est pas déjà ouverte, on ouvre un nouvel onglet
			chrome.tabs.create({url: "http://www.hitbox.tv/" + profile});
		else // Sinon on passe le focus sur la premiere page contenant le pattern
			chrome.tabs.highlight({windowId: a[0].windowId, tabs: a[0].index});
	});
}

function clickHitbox(e)
{
	openHitbox(this.getAttribute('data-profile'));
}

function getProfileName(url)
{
	var n = url.lastIndexOf("/");
	if (n == (url.length - 1))
		return getProfileName(url.substring(0, url.length - 1));
	else
		return url.substring(n + 1);
}

function main()
{
	checkStreams();
}

window.addEventListener("DOMContentLoaded", main, false);