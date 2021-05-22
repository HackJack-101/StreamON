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
 * Authors :
 * - HackJack https://github.com/Jack3113
 * - AamuLumi https://github.com/AamuLumi
 */

/* global tools, modules, chrome */
// const CLIENT_ID = 'j8iz9c0ve7u9rnhmt9pmfqdpfmqfx6'; // Windows ID
/* @devKey */ const CLIENT_ID = 'jpzyevuwtdws8n0fz8gp5erx8274r8d'; // Mac ID
// @publishedKey const CLIENT_ID = 'b27gkzerwiclt6yhbpw6yuai6ffx3b'; // Published extension
const tokenRegex = new RegExp('#access_token=([^&]+)', 'i');
const TWITCH_API = 'https://api.twitch.tv/helix';

modules.twitch = {
    data: {}, // Store channel key if online
    cache: [],
    fetchData: function(url, callback, errorCallback) {
        chrome.storage.sync.get(
            {
                token: '',
            },
            (config) => {
                console.log('fetchData', url, config.token);
                const XHR = new XMLHttpRequest();

                XHR.onreadystatechange = function() {
                    if (XHR.readyState === 4) {
                        if (XHR.status === 200 || XHR.status === 0) {
                            const result = JSON.parse(XHR.responseText);
                            if (result.data && result.data.length > 0) {
                                callback(result);
                            }
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
    connect: (callback) => {
        chrome.identity.launchWebAuthFlow(
            {
                url:
                    'https://id.twitch.tv/oauth2/authorize?client_id=' +
                    CLIENT_ID +
                    '&redirect_uri=https://' +
                    chrome.runtime.id +
                    '.chromiumapp.org/oauth&response_type=token&scope=user:read:follows',
                interactive: true,
            },
            function(redirect_url) {
                const res = tokenRegex.exec(redirect_url);
                console.log(res);
                if (res[1]) {
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
                modules.twitch.fetchData(TWITCH_API + '/users', success, error);
            },
        );
    },
    getFollows: (twitchID, callback, list = [], after = null) => {
        let url = TWITCH_API + '/users/follows?from_id=' + twitchID + '&first=100';
        if (after) {
            url += '&after=' + after;
        }
        modules.twitch.fetchData(url, (following) => {
            const streams = following.data
                .filter(({ to_name }) => to_name.toLowerCase() !== 'sardoche') // C'ÉTAIT SÛR !!!!
                .map((user) => user.to_name);

            if (following.pagination && following.pagination.cursor) {
                return modules.twitch.getFollows(twitchID, callback, list.concat(streams), following.pagination.cursor);
            } else {
                return chrome.storage.sync.set({ streams: list.concat(streams) }, () => callback());
            }
        });
    },
    syncUser: (callback, error) => {
        modules.twitch.isConnected((result) => {
            const id = result.data[0].id;
            if (id) {
                chrome.storage.sync.set({ twitchID: id }, () =>
                    modules.twitch.getFollows(id, () => callback(result.data[0])),
                );
            }
        }, error);
    },
    getAsyncBulkData: () =>
        new Promise((resolve, reject) => {
            chrome.storage.sync.get({ twitchID: '' }, (config) => {
                if (!config.twitchID) {
                    console.error('no twitchID');
                    return;
                }
                modules.twitch.fetchData(
                    TWITCH_API + '/streams/followed?user_id=' + config.twitchID,
                    (resStreams) => {
                        const connectedStreamers = resStreams.data;
                        console.log({ connectedStreamers });
                        const games = [];
                        connectedStreamers.forEach(({ game_id }) => {
                            if (!games.includes(game_id)) {
                                games.push(game_id);
                            }
                        });

                        const streams = connectedStreamers.map((stream) => {
                            return {
                                name: stream.user_name ? stream.user_name : stream.user_login,
                                login: stream.user_login,
                                title: stream.title,
                                game: stream.game_name,
                                thumbnail: stream.thumbnail_url.replace('{width}', '400').replace('{height}', '225'),
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
            });
        }),
    getUserLogo: (profile) =>
        new Promise((resolve, reject) => {
            modules.twitch.fetchData(
                TWITCH_API + '/users?login=' + profile,
                (res) => {
                    console.log(res, res.data[0].profile_image_url);
                    if (res.data && res.data[0] && res.data[0].profile_image_url) {
                        return resolve(res.data[0].profile_image_url);
                    }
                    return reject('User data not found');
                },
                () => reject('User not found'),
            );
        }),
    /**
     * @deprecated
     * @param url
     * @param callback
     */
    getData: function(url, callback) {
        const profile = tools.getProfileName(url);
        modules.twitch.fetchData(
            TWITCH_API + '/streams?user_login=' + profile,
            (res) => callback(true, res.data[0], profile),
            () => callback(false, null, profile),
        );
    },
    /**
     * @deprecated
     * @param gameID
     * @param callback
     */
    getGameInfo: function(gameID, callback) {
        modules.twitch.fetchData(
            TWITCH_API + '/games?id=' + gameID,
            (res) => callback(res.data[0].name),
            () => callback('Game not found'),
        );
    },
    getUserInfo: (login, callback) => {
        modules.twitch.fetchData(
            TWITCH_API + '/users?login=' + login,
            (res) => callback(res.data[0]),
            () => callback(null),
        );
    },
    isNewOnline: ({ name }) => {
        return !modules.twitch.data.hasOwnProperty(name);
    },
    notify: function(name, logo, title, game) {
        chrome.storage.sync.get(
            {
                notif: true,
            },
            (options) => {
                if (options.notif) {
                    const body = [chrome.i18n.getMessage('game') + ' : ' + game, title];
                    tools.displayNotification(
                        name + ' ' + chrome.i18n.getMessage('isOnline'),
                        logo,
                        body.join('\n'),
                        () => {
                            modules.twitch.openStream(name);
                        },
                    );
                }
            },
        );
    },
    openStream: function(profile) {
        const pattern = '*://*.twitch.tv/' + profile;
        const url = 'http://twitch.tv/' + profile;
        tools.openTab(pattern, url);
    },
    checkStreams: async function(force = false, silent = false) {
        const twitch = await modules.twitch.getAsyncBulkData();

        await Promise.all(
            twitch
                .filter((data) => force || modules.twitch.isNewOnline(data))
                .map(async (stream, index) => {
                    const { game, name, title, login } = stream;
                    const profileImage = await modules.twitch.getUserLogo(login);
                    if (silent) {
                        return Promise.resolve(true);
                    }
                    return setTimeout(() => modules.twitch.notify(name, profileImage, title, game), index * 2500);
                }),
        );
        modules.twitch.data = twitch.reduce((acc, stream) => {
            acc[stream.name] = stream;
            return acc;
        }, {});
    },
};
