function checkStreams()
{
	chrome.storage.sync.get({
		streams: "",
		background: true
	}, function (options) {
		if (options.background)
		{
			var s = options.streams;
			var streams = s.split("\n");
			for (var i = 0; i < streams.length; i++)
			{
				if (streams[i].length > 0)
				{
					var url = streams[i];
					for (var k in modules)
					{
						if (modules[k].check(url))
						{
							modules[k].notify(url);
							break;
						}
					}
				}
			}
		}
	});
}

function displayNotification(title, icon, body, callback)
{
	var startStream = new Notification(title,
			{
				icon: icon,
				lang: chrome.i18n.getMessage("locale"),
				body: body
			}
	);

	startStream.onclick = function () {
		callback();
		this.close();
	};
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

main();