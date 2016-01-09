modules.hitbox =
		{
			data: {},
			check: function (url)
			{
				var regexp = /hitbox\.tv/gi;
				return (url.match(regexp) != null && url.match(regexp).length > 0);
			},
			display: function (url)
			{
				modules.hitbox.getData(url, modules.hitbox.displayData);
			},
			getData: function (url, callback)
			{
				var profile = tools.getProfileName(url);
				var XHR = new XMLHttpRequest();

				XHR.onreadystatechange = function () {
					if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0))
					{
						var result = JSON.parse(XHR.responseText);
						callback(result.livestream[0].media_is_live === "1", result, profile);
					}
				};
				XHR.open("GET", "https://api.hitbox.tv/media/live/" + profile, true);
				XHR.send(null);
			},
			displayData: function (online, content, profile)
			{
				if (online)
				{
					var thumbnail = "http://edge.sf.hitbox.tv/" + content.livestream[0].media_thumbnail;
					var title = content.livestream[0].media_status;
					var name = content.livestream[0].media_display_name;
					var game = content.livestream[0].category_name;
					var embed = "http://www.hitbox.tv/embed/" + profile;
					addOnlineElement(profile, "hitbox", thumbnail, title, name, game, embed);
				} else
				{
					addOfflineElement(profile, "hitbox");
				}
			},
			notify: function (url) {
				modules.hitbox.getData(url, modules.hitbox.notifyData);
			},
			notifyData: function (online, content, profile)
			{
				if (!modules.hitbox.data[profile])
				{
					modules.hitbox.data[profile] = {
						streamOnline: false,
						game: "",
						title: "",
						logo: ""
					};
				}
				if (online)
				{
					if (!modules.hitbox.data[profile].streamOnline)
					{
						modules.hitbox.data[profile].streamOnline = true;
						modules.hitbox.data[profile].game = content.livestream[0].category_name;
						modules.hitbox.data[profile].title = content.livestream[0].media_status;
						modules.hitbox.data[profile].logo = 'http://edge.sf.hitbox.tv/' + content.livestream[0].channel.user_logo;
						chrome.storage.sync.get({
							notif: true
						}, function (options) {
							if (options.notif)
							{
								var title = modules.hitbox.data[profile].title;
								var icon = modules.hitbox.data[profile].logo;
								var body = chrome.i18n.getMessage("game") + ' : ' + modules.hitbox.data[profile].game;
								displayNotification(title, icon, body, function () {
									modules.hitbox.openStream(profile);
								});
							}
						});
					} else
					{
						if (content.livestream[0].category_name != modules.hitbox.data[profile].game || content.livestream[0].media_status != modules.hitbox.data[profile].title)
						{
							modules.hitbox.data[profile].game = content.livestream[0].category_name;
							modules.hitbox.data[profile].title = content.livestream[0].media_status;
							modules.hitbox.data[profile].logo = 'http://edge.sf.hitbox.tv/' + content.livestream[0].channel.user_logo;
							chrome.storage.sync.get({
								titleNotif: false
							}, function (options) {
								if (options.refreshTime)
								{
									var title = modules.hitbox.data[profile].title;
									var icon = modules.hitbox.data[profile].logo;
									var body = chrome.i18n.getMessage("game") + ' : ' + modules.hitbox.data[profile].game;
									displayNotification(title, icon, body, function () {
										modules.hitbox.openStream(profile);
									});
								}
							});
						}
					}
				} else
				{
					if (modules.hitbox.data[profile].streamOnline)
					{
						modules.hitbox.data[profile].streamOnline = false;
					}
				}

			},
			openStream: function (profile)
			{
				var pattern = "*://*.hitbox.tv/" + profile;
				var url = "http://www.hitbox.tv/" + profile;
				tools.openTab(pattern, url);
			}
		};


