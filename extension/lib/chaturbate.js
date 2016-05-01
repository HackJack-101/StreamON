/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * 
 * Author : HackJack https://github.com/Jack3113
 */

modules.chaturbate =
	{
		data: {},
		check: function (url) {
			var regexp = /chaturbate\.com/gi;
			return (url.match(regexp) != null && url.match(regexp).length > 0);
		},
		display: function (url) {
			modules.chaturbate.getData(url, modules.chaturbate.displayData);
		},
		getData: function (url, callback) {
			var profile = tools.getProfileName(url);
			var XHR = new XMLHttpRequest();

			XHR.onreadystatechange = function () {
				if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0)) {
					var result = JSON.parse(XHR.responseText);
					callback(result.online, result, profile);
				}
			};
			XHR.open("GET", "https://api.streamon.info/chaturbate/?username=" + profile, true);
			XHR.send(null);
		},
		displayData: function (online, content, profile) {
			if (online) {
				var thumbnail = content.image_url_360x270;
				var title = content.room_subject;
				var name = content.display_name;
				var embed = modules.chaturbate.getEmbed(content.iframe_embed);
				addOnlineElement(profile, "chaturbate", thumbnail, title, name, null, embed);
			} else {
				addOfflineElement(profile, "chaturbate");
			}
		},
		getEmbed: function (string) {
			return string.replace(/src='(.*?)'/gi, function (match, pattern, offset, string) {
				console.log(pattern);
			});
		},
		notify: function (url) {
			modules.chaturbate.getData(url, modules.chaturbate.notifyData);
		},
		notifyData: function (online, content, profile) {
			if (!modules.chaturbate.data[profile]) {
				modules.chaturbate.data[profile] = {
					streamOnline: false,
					game: "",
					title: "",
					logo: ""
				};
			}
			if (online) {
				if (!modules.chaturbate.data[profile].streamOnline) {
					modules.chaturbate.data[profile].streamOnline = true;
					modules.chaturbate.data[profile].game = content.stream.channel.game;
					modules.chaturbate.data[profile].title = content.stream.channel.status;
					modules.chaturbate.data[profile].logo = content.stream.channel.logo;
					chrome.storage.sync.get({
						notif: true
					}, function (options) {
						if (options.notif) {
							var title = modules.chaturbate.data[profile].title;
							var icon = modules.chaturbate.data[profile].logo;
							var body = chrome.i18n.getMessage("game") + ' : ' + modules.chaturbate.data[profile].game;
							displayNotification(title, icon, body, function () {
								modules.chaturbate.openStream(profile);
							});
						}
					});
				}
			} else {
				if (modules.chaturbate.data[profile].streamOnline) {
					modules.chaturbate.data[profile].streamOnline = false;
				}
			}

		},
		openStream: function (profile) {
			var pattern = "*://*.chaturbate.com/" + profile;
			var url = "http://www.chaturbate.com/" + profile;
			tools.openTab(pattern, url);
		}
	};