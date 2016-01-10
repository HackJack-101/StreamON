modules.twitch =
        {
            data: {},
            check: function (url)
            {
                var regexp = /twitch\.tv/gi;
                return (url.match(regexp) != null && url.match(regexp).length > 0);
            },
            display: function (url)
            {
                modules.twitch.getData(url, modules.twitch.displayData);
            },
            getData: function (url, callback)
            {
                var profile = tools.getProfileName(url);
                var XHR = new XMLHttpRequest();

                XHR.onreadystatechange = function () {
                    if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0))
                    {
                        var result = JSON.parse(XHR.responseText);
                        callback(result.stream !== null, result, profile);
                    }
                };
                XHR.open("GET", "https://api.twitch.tv/kraken/streams/" + profile, true);
                XHR.send(null);
            },
            displayData: function (online, content, profile)
            {
                if (online)
                {
                    var thumbnail = content.stream.preview.medium;
                    var title = content.stream.channel.status;
                    var name = content.stream.channel.display_name;
                    var game = content.stream.channel.game;
                    var embed = "http://player.twitch.tv/?channel=" + profile;
                    addOnlineElement(profile, "twitch", thumbnail, title, name, game, embed);
                } else
                {
                    addOfflineElement(profile, "twitch");
                }
            },
            notify: function (url) {
                modules.twitch.getData(url, modules.twitch.notifyData);
            },
            notifyData: function (online, content, profile)
            {
                if (!modules.twitch.data[profile])
                {
                    modules.twitch.data[profile] = {
                        streamOnline: false,
                        game: "",
                        title: "",
                        logo: ""
                    };
                }
                if (online)
                {
                    if (!modules.twitch.data[profile].streamOnline)
                    {
                        modules.twitch.data[profile].streamOnline = true;
                        modules.twitch.data[profile].game = content.stream.channel.game;
                        modules.twitch.data[profile].title = content.stream.channel.status;
                        modules.twitch.data[profile].logo = content.stream.channel.logo;
                        chrome.storage.sync.get({
                            notif: true
                        }, function (options) {
                            if (options.notif)
                            {
                                var title = modules.twitch.data[profile].title;
                                var icon = modules.twitch.data[profile].logo;
                                var body = chrome.i18n.getMessage("game") + ' : ' + modules.twitch.data[profile].game;
                                displayNotification(title, icon, body, function () {
                                    modules.twitch.openStream(profile);
                                });
                            }
                        });
                    } else
                    {
                        if (content.stream.channel.game != modules.twitch.data[profile].game || content.stream.channel.status != modules.twitch.data[profile].title)
                        {
                            modules.twitch.data[profile].game = content.stream.channel.game;
                            modules.twitch.data[profile].title = content.stream.channel.status;
                            modules.twitch.data[profile].logo = content.stream.channel.logo;
                            chrome.storage.sync.get({
                                titleNotif: false
                            }, function (options) {
                                if (options.refreshTime)
                                {
                                    var title = modules.twitch.data[profile].title;
                                    var icon = modules.twitch.data[profile].logo;
                                    var body = chrome.i18n.getMessage("game") + ' : ' + modules.twitch.data[profile].game;
                                    displayNotification(title, icon, body, function () {
                                        modules.twitch.openStream(profile);
                                    });
                                }
                            });
                        }
                    }
                } else
                {
                    if (modules.twitch.data[profile].streamOnline)
                    {
                        modules.twitch.data[profile].streamOnline = false;
                    }
                }

            },
            openStream: function (profile)
            {
                var pattern = "*://*.twitch.tv/" + profile;
                var url = "http://www.twitch.tv/" + profile;
                tools.openTab(pattern, url);
            }
        };