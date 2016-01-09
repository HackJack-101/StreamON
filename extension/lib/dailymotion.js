modules.dailymotion =
		{
			data: {},
			check: function (url)
			{
				var regexp = /dailymotion\.com/gi;
				return (url.match(regexp) != null && url.match(regexp).length > 0);
			},
			display: function (url)
			{
				modules.dailymotion.getData(url, modules.dailymotion.displayData);
			},
			getData: function (url, callback)
			{
				var profile = tools.getProfileName(url);
				var XHR = new XMLHttpRequest();

				XHR.onreadystatechange = function () {
					if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0))
					{
						var result = JSON.parse(XHR.responseText);
						callback(result.broadcasting, result, profile);
					}
				};
				XHR.open("GET", "https://api.dailymotion.com/video/" + profile + "?fields=broadcasting,embed_url,id,owner,title,owner.avatar_240_url,thumbnail_360_url,owner.username", true);
				XHR.send(null);
			},
			displayData: function (online, content, profile)
			{
				if (online)
				{
					var thumbnail = content.thumbnail_360_url;
					var title = content.title;
					var name = content['owner.username'];
					var embed = content.embed_url;
					addOnlineElement(profile, "dailymotion", thumbnail, title, name, null, embed);
				} else
				{
					addOfflineElement(profile, "dailymotion");
				}
			},
			notify: function (url) {
				modules.dailymotion.getData(url, modules.dailymotion.notifyData);
			},
			notifyData: function (online, content, profile)
			{
				if (!modules.dailymotion.data[profile])
				{
					modules.dailymotion.data[profile] = {
						streamOnline: false,
						name: "",
						title: "",
						logo: ""
					};
				}
				if (online)
				{
					if (!modules.dailymotion.data[profile].streamOnline)
					{
						modules.dailymotion.data[profile].streamOnline = true;
						modules.dailymotion.data[profile].name = content['owner.username'];
						modules.dailymotion.data[profile].title = content.title;
						modules.dailymotion.data[profile].logo = content.owner.avatar_240_url;
						chrome.storage.sync.get({
							notif: true
						}, function (options) {
							if (options.notif)
							{
								var title = modules.dailymotion.data[profile].title;
								var icon = modules.dailymotion.data[profile].logo;
								var body = modules.dailymotion.data[profile].name;
								displayNotification(title, icon, body, function () {
									modules.dailymotion.openStream(profile);
								});
							}
						});
					} else
					{
						if (content.title != modules.dailymotion.data[profile].title)
						{
							modules.dailymotion.data[profile].name = content['owner.username'];
							modules.dailymotion.data[profile].title = content.title;
							modules.dailymotion.data[profile].logo = content.owner.avatar_240_url;
							chrome.storage.sync.get({
								titleNotif: false
							}, function (options) {
								if (options.refreshTime)
								{
									var title = modules.dailymotion.data[profile].title;
									var icon = modules.dailymotion.data[profile].logo;
									var body = modules.dailymotion.data[profile].name;
									displayNotification(title, icon, body, function () {
										modules.dailymotion.openStream(profile);
									});
								}
							});
						}
					}
				} else
				{
					if (modules.dailymotion.data[profile].streamOnline)
					{
						modules.dailymotion.data[profile].streamOnline = false;
					}
				}

			},
			openStream: function (profile)
			{
				var pattern = "*://*.dailymotion.com/video/" + profile;
				var url = "http://www.dailymotion.com/video/" + profile;
				tools.openTab(pattern, url);
			}
		};