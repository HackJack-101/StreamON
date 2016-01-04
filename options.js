function save_options() {
	// Refresh time
	var refreshTime = document.getElementById('refreshTime').value;
	refreshTime = parseInt(refreshTime);
	if (refreshTime < 1)
		refreshTime = 1;
	// Notifications
	var notif = document.getElementById('notif').checked;
	// Title Notifications
	var titleNotif = document.getElementById('titleNotif').checked;
	// Streams
	var streams = document.getElementById('streams').value;
	chrome.storage.sync.set({
		refreshTime: refreshTime,
		streams: streams,
		notif: notif,
		titleNotif: titleNotif
	}, function () {
		var status = document.getElementById('status');
		status.style.display = 'block';
		status.textContent = 'Options sauvegardées';
		setTimeout(function () {
			status.textContent = '';
			status.style.display = 'none';
		}, 750);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		refreshTime: 60,
		streams: "",
		notif: true,
		titleNotif: false

	}, function (options) {
		// Notifications
		document.getElementById('notif').checked = options.notif;
		// Title Notifications
		document.getElementById('titleNotif').checked = options.titleNotif;
		// Refresh time
		document.getElementById('refreshTime').value = options.refreshTime;
		// Streams
		document.getElementById('streams').value = options.streams;
	});

	var addTwitchButton = document.getElementById('addTwitch');
	addTwitchButton.addEventListener('click', addTwitch);

	document.getElementById('form').addEventListener('submit', function (e) {
		e.preventDefault();
		save_options();
	});
}

function importTwitchFollowing(username, offset)
{
	var XHR = new XMLHttpRequest();
	XHR.onreadystatechange = function () {
		if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0))
		{
			var result = JSON.parse(XHR.responseText);
			var streams = document.getElementById('streams').value;
			for (var i = 0; i < result.follows.length; i++)
			{
				var url = result.follows[i].channel.url;
				if (streams.lastIndexOf(url) < 0)
				{
					if (i === 0 && streams.length > 0)
						document.getElementById('streams').value += "\n"
					document.getElementById('streams').value += url + "\n";
				}
			}
			if (result.follows.length >= 25)
				importTwitchFollowing(username, offset + 25);

		}
	};
	XHR.open("GET", "https://api.twitch.tv/kraken/users/" + username + "/follows/channels?direction=DESC&limit=25&offset=" + offset + "&sortby=created_at", true);
	XHR.send(null);
}

function addTwitch()
{
	document.getElementById('addTwitch').style.display = 'none';
	document.getElementById('addTwitchDialog').style.display = 'block';
	document.getElementById('importTwitch').addEventListener('click', function () {
		var username = document.getElementById('usernameTwitch').value;
		if (username != null && username.length > 0)
		{
			importTwitchFollowing(username, 0);
		}
		document.getElementById('usernameTwitch').value = "";
		document.getElementById('addTwitch').style.display = 'block';
		document.getElementById('addTwitchDialog').style.display = 'none';
	});


}

document.addEventListener('DOMContentLoaded', restore_options);
