var ids = [
	"title",
	"onlineTitle",
	"offlineTitle",
	"streamsLabel",
	"message",
	"streamsHelp",
	"addTwitch",
	"username",
	"importTwitch",
	"notifLabel",
	"titleNotifLabel",
	"refreshTimeLabel"
];
function fill(id)
{
	if (document.getElementById(id))
		document.getElementById(id).innerHTML = chrome.i18n.getMessage(id);
}

window.addEventListener("DOMContentLoaded", function () {
	for (var i in ids)
		fill(ids[i]);
}, false);
