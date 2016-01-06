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
		addOnlineElement(profile, "twitch.tv", content.stream.preview.medium, content.stream.channel.status, content.stream.channel.display_name, content.stream.channel.game);
	} else
	{
		addOfflineElement(profile, "twitch.tv");
	}
}

function resultHitboxStream(online, content, profile)
{
	if (online)
	{
		addOnlineElement(profile, "hitbox.tv", "http://edge.sf.hitbox.tv/" + content.livestream[0].media_thumbnail, content.livestream[0].media_status, content.livestream[0].media_display_name, content.livestream[0].category_name);
	} else
	{
		addOfflineElement(profile, "hitbox.tv");
	}
}

function addOfflineElement(profile, server)
{
	var e = document.createElement("div");
	e.setAttribute("class", "streamOff link");
	e.setAttribute("data-profile", profile);
	e.addEventListener("click", function () {
		openServer(this.getAttribute('data-profile'), server);
	}, false);
	e.innerHTML = profile;

	document.getElementById("offlineList").appendChild(e);
	var offlineNumber = document.getElementById('offline');
	offlineNumber.innerHTML = parseInt(offlineNumber.innerHTML) + 1;
}

function addOnlineElement(profile, server, _img, _title, _name, _game)
{
	var e = document.createElement("a");
	e.setAttribute("class", "streamOn");
	e.setAttribute("data-profile", profile);

	var img = document.createElement("img");
	img.setAttribute("class", "preview pointer");
	img.setAttribute("width", "80");
	img.setAttribute("height", "45");
	img.setAttribute("alt", "preview");
	img.setAttribute("src", "play.png");
	img.setAttribute("style", "background-image:url('" + _img + "')");
	img.addEventListener("click", function () {
		openServer(this.parentNode.getAttribute('data-profile'), server);
	}, false);

	var desc = document.createElement("div");
	desc.setAttribute("class", "description");

	var title = document.createElement("span");
	title.setAttribute("class", "link title");
	title.innerHTML = _title;
	title.addEventListener("click", function () {
		openServer(this.parentNode.parentNode.getAttribute('data-profile'), server);
	}, false);

	var name = document.createElement("span");
	name.setAttribute("class", "username");
	name.innerHTML = _name;

	var playing = document.createElement("span");
	playing.setAttribute("class", "playing");
	playing.innerHTML = ' ' + chrome.i18n.getMessage("playingTo") + ' ';

	var game = document.createElement("span");
	game.setAttribute("class", "game");
	game.innerHTML = _game;

	var miniPlayer = document.createElement("div");
	miniPlayer.setAttribute("class", "link");
	miniPlayer.innerHTML = chrome.i18n.getMessage("openMiniPlayer");
	miniPlayer.addEventListener("click", function () {
		openMiniPlayer(profile, server);
	}, false);

	desc.appendChild(title);
	desc.appendChild(name);
	desc.appendChild(playing);
	desc.appendChild(game);
	desc.appendChild(miniPlayer);

	e.appendChild(img);
	e.appendChild(desc);

	document.getElementById("onlineList").appendChild(e);
	var onlineNumber = document.getElementById('online');
	onlineNumber.innerHTML = parseInt(onlineNumber.innerHTML) + 1;
}

function openServer(profile, server)
{
	chrome.tabs.query({url: "*://*." + server + "/" + profile}, function (a) {
		if (a.length < 1) // Si la page n'est pas déjà ouverte, on ouvre un nouvel onglet
			chrome.tabs.create({url: "http://www." + server + "/" + profile});
		else // Sinon on passe le focus sur la premiere page contenant le pattern
			chrome.tabs.highlight({windowId: a[0].windowId, tabs: a[0].index});
	});
}

function openMiniPlayer(profile, server)
{
	chrome.management.get("ocmhnldnkkmebkncidbfangifbabjfdb", function (r) {
		if (r && r.enabled)
			chrome.runtime.sendMessage("ocmhnldnkkmebkncidbfangifbabjfdb", {server: server, profile: profile});
		else
		{
			chrome.management.get("glccgoppknfoonfajicijebeaedpnkfp", function (r) {
				if (r && r.enabled)
					chrome.runtime.sendMessage("glccgoppknfoonfajicijebeaedpnkfp", {server: server, profile: profile});
				else
					chrome.tabs.create({url: "https://chrome.google.com/webstore/detail/glccgoppknfoonfajicijebeaedpnkfp"});
			});
		}
	});
}

function clickServer(e)
{
	openHitbox(this.getAttribute('data-profile'), "hitbox.tv");
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