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

/* global tools, modules, chrome */
const CLIENT_ID = 'jpzyevuwtdws8n0fz8gp5erx8274r8d';
modules.twitch =
    {
        data: {},
        check: function (url) {
            const regexp = /twitch\.tv/gi;
            return (url.match(regexp) !== null && url.match(regexp).length > 0);
        },
        display: function (url) {
            modules.twitch.getData(url, modules.twitch.displayData);
        },
        fetchData: function (url, callback, errorCallback) {
            const XHR = new XMLHttpRequest();

            XHR.onreadystatechange = function () {
                if (XHR.readyState === 4 && (XHR.status === 200 || XHR.status === 0)) {
                    const result = JSON.parse(XHR.responseText);
                    if (result.data && result.data.length > 0) {
                        callback(result);
                    } else {
                        errorCallback();
                    }
                }
            };
            XHR.open('GET', url, true);
            XHR.setRequestHeader('Client-ID', CLIENT_ID);
            XHR.send(null);
        },
        getUserLogo: function (profile, callback) {
            modules.twitch.fetchData('https://api.twitch.tv/helix/users?user_login=' + profile,
                (res) => callback(res.data[0].profile_image_url),
                () => callback(''));
        },
        getData: function (url, callback) {
            const profile = tools.getProfileName(url);
            modules.twitch.fetchData('https://api.twitch.tv/helix/streams?user_login=' + profile,
                (res) => callback(true, res.data[0], profile),
                () => callback(false, null, profile));
        },
        getGameInfo: function (gameID, callback) {
            modules.twitch.fetchData('https://api.twitch.tv/helix/games?id=' + gameID,
                (res) => callback(res.data[0].name),
                () => callback('jeu inconnu'));
        },
        displayData: function (online, content, profile) {
            if (online) {
                const thumbnail = content.thumbnail_url.replace('{width}', '400').replace('{height}', '225');
                const title = content.title;
                const name = content.user_name;
                const gameID = content.game_id;
                const embed = 'http://player.twitch.tv/?channel=' + profile;
                modules.twitch.getGameInfo(gameID, (game) => {
                    addOnlineElement(profile, 'twitch', thumbnail, title, name, game, embed);
                });
            } else {
                addOfflineElement(profile, 'twitch', null);
            }
        },
        notify: function (url) {
            modules.twitch.getData(url, modules.twitch.notifyData);
        },
        notifyData: function (online, content, profile) {
            if (!modules.twitch.data[profile]) {
                modules.twitch.data[profile] = {
                    streamOnline: false,
                    game: '',
                    title: '',
                    logo: ''
                };
            }
            if (online) {
                if (!modules.twitch.data[profile].streamOnline) {
                    modules.twitch.data[profile].streamOnline = true;
                    modules.twitch.data[profile].game = content.game_id;
                    modules.twitch.data[profile].title = content.title;
                    modules.twitch.getUserLogo(profile, (logo) => {
                        modules.twitch.getGameInfo(content.game_id, (game) => {
                            chrome.storage.sync.get({
                                notif: true
                            }, (options) => {
                                if (options.notif) {
                                    const title = content.title;
                                    const icon = logo;
                                    const body = chrome.i18n.getMessage('game') + ' : ' + game;
                                    displayNotification(title, icon, body, function () {
                                        modules.twitch.openStream(profile);
                                    });
                                }
                            });
                        });
                    });

                } else {
                    if (content.game_id !== modules.twitch.data[profile].game || content.title !== modules.twitch.data[profile].title) {

                        modules.twitch.data[profile].game = content.game_id;
                        modules.twitch.data[profile].title = content.title;
                        modules.twitch.getUserLogo(profile, (logo) => {
                            modules.twitch.getGameInfo(content.game_id, (game) => {
                                chrome.storage.sync.get({
                                    notif: true,
                                    titleNotif: false
                                }, (options) => {
                                    if (options.notif && options.titleNotif) {
                                        const title = content.title;
                                        const icon = logo;
                                        const body = chrome.i18n.getMessage('game') + ' : ' + game;
                                        displayNotification(title, icon, body, function () {
                                            modules.twitch.openStream(profile);
                                        });
                                    }
                                });
                            });
                        });
                    }
                }
            } else {
                if (modules.twitch.data[profile].streamOnline) {
                    modules.twitch.data[profile].streamOnline = false;
                }
            }

        },
        openStream: function (profile) {
            var pattern = '*://*.twitch.tv/' + profile;
            var url = 'http://twitch.tv/' + profile;
            tools.openTab(pattern, url);
        }
    };