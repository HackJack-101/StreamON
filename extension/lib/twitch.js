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
const tokenRegex = new RegExp('#access_token=([^&]+)', 'i');

modules.twitch = {
    data: {},
    cache: [],
    check: function(url) {
        const regexp = /twitch\.tv/gi;
        return url.match(regexp) !== null && url.match(regexp).length > 0;
    },
    display: function(url) {
        modules.twitch.getData(url, modules.twitch.displayData);
    },
    fetchData: function(url, callback, errorCallback) {
        chrome.storage.sync.get(
            {
                token: '',
            },
            (config) => {
                console.log({ config });
                const XHR = new XMLHttpRequest();

                XHR.onreadystatechange = function() {
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
                XHR.setRequestHeader('Authorization', 'Bearer ' + config.token);
                XHR.send(null);
            },
        );
    },
    connect: (callback, notify) => {
        chrome.identity.launchWebAuthFlow(
            {
                url:
                    'https://id.twitch.tv/oauth2/authorize?client_id=' +
                    CLIENT_ID +
                    '&redirect_uri=https://' +
                    chrome.runtime.id +
                    '.chromiumapp.org/oauth&response_type=token&scopes=user_follows_edit',
                interactive: true,
            },
            function(redirect_url) {
                const res = tokenRegex.exec(redirect_url);
                if (res[1]) {
                    notify();
                    const token = res[1];
                    chrome.storage.sync.set({ token }, () => {
                        modules.twitch.syncUser(callback);
                    });
                }
            },
        );
    },
    isConnected: (success, error) => {
        chrome.storage.sync.get(
            {
                token: '',
            },
            (config) => {
                if (!config.token) {
                    return error();
                }
                modules.twitch.fetchData('https://api.twitch.tv/helix/users', success, error);
            },
        );
    },
    syncUser: (callback, error) => {
        modules.twitch.isConnected((result) => {
            const id = result.data[0].id;
            if (id) {
                chrome.storage.sync.set({ twitchID: result.data[0].id }, () => {
                    modules.twitch.fetchData(
                        'https://api.twitch.tv/helix/users/follows?from_id=' + id + '&first=100',
                        (following) => {
                            const streams = following.data
                                .map((user) => 'https://twitch.tv/' + user.to_name)
                                .join('\n');
                            chrome.storage.sync.set({ streams }, callback);
                        },
                    );
                });
            }
        }, error);
    },
    getAsyncBulkData: (streamers) =>
        new Promise((resolve, reject) => {
            const logins = streamers.map((streamer) => tools.getProfileName(streamer));
            modules.twitch.fetchData(
                'https://api.twitch.tv/helix/streams?user_login=' + logins.join('&user_login='),
                (resStreams) => {
                    const connectedStreamers = resStreams.data;
                    const games = [];
                    connectedStreamers.forEach(({ game_id }) => {
                        if (!games.includes(game_id)) {
                            games.push(game_id);
                        }
                    });
                    modules.twitch.fetchData(
                        'https://api.twitch.tv/helix/games?id=' + games.join('&id='),
                        (fetchedGames) => {
                            const gamesData = fetchedGames.data.reduce((acc, game) => {
                                acc[game.id] = game;
                                return acc;
                            }, {});

                            const streams = connectedStreamers.map((stream) => {
                                return {
                                    name: stream.user_name,
                                    title: stream.title,
                                    game: gamesData[stream.game_id] ? gamesData[stream.game_id].name : '',
                                    thumbnail: stream.thumbnail_url
                                        .replace('{width}', '400')
                                        .replace('{height}', '225'),
                                    startedAt: stream.started_at,
                                    viewers: stream.viewer_count,
                                    embed: 'http://player.twitch.tv/?channel=' + stream.user_name,
                                };
                            });

                            modules.twitch.cache = streams;

                            resolve(streams);
                        },
                        () => resolve(modules.twitch.cache),
                    );
                },
                () => resolve(modules.twitch.cache),
            );
        }),
    getUserLogo: function(profile, callback) {
        modules.twitch.fetchData(
            'https://api.twitch.tv/helix/users?user_login=' + profile,
            (res) => callback(res.data[0].profile_image_url),
            () => callback(''),
        );
    },
    getData: function(url, callback) {
        const profile = tools.getProfileName(url);
        modules.twitch.fetchData(
            'https://api.twitch.tv/helix/streams?user_login=' + profile,
            (res) => callback(true, res.data[0], profile),
            () => callback(false, null, profile),
        );
    },
    getGameInfo: function(gameID, callback) {
        modules.twitch.fetchData(
            'https://api.twitch.tv/helix/games?id=' + gameID,
            (res) => callback(res.data[0].name),
            () => callback('jeu inconnu'),
        );
    },
    displayData: function(online, content, profile) {
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
    isOffline: ({ name }) => {
        console.log(modules.twitch.data);
        return !modules.twitch.data.hasOwnProperty(name);
    },
    notify: function(name, logo, title, game) {
        chrome.storage.sync.get(
            {
                notif: true,
            },
            (options) => {
                if (options.notif) {
                    const body = chrome.i18n.getMessage('game') + ' : ' + game;
                    displayNotification(title, logo, body, () => {
                        modules.twitch.openStream(name);
                    });
                }
            },
        );
    },
    notifyData: function(online, content, profile) {
        if (!modules.twitch.data[profile]) {
            modules.twitch.data[profile] = {
                streamOnline: false,
                game: '',
                title: '',
                logo: '',
            };
        }
        if (online) {
            if (!modules.twitch.data[profile].streamOnline) {
                modules.twitch.data[profile].streamOnline = true;
                modules.twitch.data[profile].game = content.game_id;
                modules.twitch.data[profile].title = content.title;
                modules.twitch.getUserLogo(profile, (logo) => {
                    modules.twitch.getGameInfo(content.game_id, (game) => {
                        chrome.storage.sync.get(
                            {
                                notif: true,
                            },
                            (options) => {
                                if (options.notif) {
                                    const title = content.title;
                                    const icon = logo;
                                    const body = chrome.i18n.getMessage('game') + ' : ' + game;
                                    displayNotification(title, icon, body, function() {
                                        modules.twitch.openStream(profile);
                                    });
                                }
                            },
                        );
                    });
                });
            } else {
                if (
                    content.game_id !== modules.twitch.data[profile].game ||
                    content.title !== modules.twitch.data[profile].title
                ) {
                    modules.twitch.data[profile].game = content.game_id;
                    modules.twitch.data[profile].title = content.title;
                    modules.twitch.getUserLogo(profile, (logo) => {
                        modules.twitch.getGameInfo(content.game_id, (game) => {
                            chrome.storage.sync.get(
                                {
                                    notif: true,
                                    titleNotif: false,
                                },
                                (options) => {
                                    if (options.notif && options.titleNotif) {
                                        const title = content.title;
                                        const icon = logo;
                                        const body = chrome.i18n.getMessage('game') + ' : ' + game;
                                        displayNotification(title, icon, body, function() {
                                            modules.twitch.openStream(profile);
                                        });
                                    }
                                },
                            );
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
    openStream: function(profile) {
        var pattern = '*://*.twitch.tv/' + profile;
        var url = 'http://twitch.tv/' + profile;
        tools.openTab(pattern, url);
    },
};
