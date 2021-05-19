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

/* global chrome */

function saveOptions() {
    let refreshTime = document.getElementById('refreshTime').value;
    refreshTime = parseInt(refreshTime);
    if (refreshTime < 1) {
        refreshTime = 1;
    }

    chrome.storage.sync.set(
        {
            refreshTime: refreshTime,
        },
        () => {
            restoreOptions();
            const status = document.getElementById('status');
            status.style.display = 'block';
            status.textContent = chrome.i18n.getMessage('optionsSaved');
            setTimeout(() => {
                status.textContent = '';
                status.style.display = 'none';
            }, 750);
        },
    );
}

function restoreOptions() {
    chrome.storage.sync.get(
        {
            refreshTime: 60,
            streams: [],
        },
        function (options) {
            options.streams.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).forEach(displayStream);
            document.getElementById('refreshTime').value = options.refreshTime;
            document.getElementById('form').addEventListener(
                'submit',
                function (e) {
                    e.preventDefault();
                    saveOptions();
                },
                false,
            );
        },
    );
}

function displayStream(stream) {
    const newElement = document.createElement('div');
    newElement.setAttribute('class', 'stream-options');

    const profilePicture = document.createElement('img');
    profilePicture.setAttribute('alt', stream + ' profile picture');
    profilePicture.setAttribute(
        'src',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    );
    modules.twitch.getUserInfo(stream, (data) => profilePicture.setAttribute('src', data.profile_image_url));

    const title = document.createElement('div');
    title.setAttribute('class', 'streamer-name')
    title.innerHTML = '<a href="https://twitch.com/' + stream + '" target="_blank" class="twitch-link">' + stream + '</a>';

    newElement.appendChild(profilePicture);
    newElement.appendChild(title);

    document.getElementById('streamers-list').appendChild(newElement);
}

function displayAuthentication() {
    document.getElementById('authenticate').style.display = 'block';
}

function hideAuthentication() {
    document.getElementById('authenticate').style.display = 'none';
}

function displayUser(user) {
    document.getElementById('user-pp').src = user.profile_image_url;
    document.getElementById('user-username').innerText = user.display_name;
    document.getElementById('user-revoke').innerHTML = chrome.i18n.getMessage('disconnectionAction');
    document.getElementById('user-revoke').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.storage.sync.get(
            {
                token: '',
            },
            (config) => {
                if (config.token) {
                    chrome.storage.sync.set(
                        {
                            token: '',
                            streams: []
                        },
                        () => document.location.reload(true),
                    );
                }
            },
        );
    });
    document.getElementById('user-info').style.display = 'flex';
}

function hideUser() {
    document.getElementById('user-info').style.display = 'none';
}

document.addEventListener(
    'DOMContentLoaded',
    () => {

        restoreOptions();

        document.getElementById('form').addEventListener('submit', (e) => {
            e.preventDefault();
        });

        document.getElementById('authenticate-button').addEventListener(
            'click',
            () => {
                modules.twitch.connect((user) => {
                    hideAuthentication();
                    tools.displayNotification(
                        chrome.i18n.getMessage('twitchConnectionSucceed'),
                        'assets/icon512.png',
                        chrome.i18n.getMessage('welcome') + ' ' + user.display_name,
                    );
                    document.location.reload(true);
                });
            },
            false,
        );

        document.getElementById('checkTwitchStreams').addEventListener('click', async function (e) {
            e.preventDefault();
            await modules.twitch.checkStreams(true)
        })

        modules.twitch.syncUser(async (res) => {
            hideAuthentication();
            displayUser(res);
        }, displayAuthentication);


        const optionsAdvanced = document.getElementById('advancedOptions');
        if (optionsAdvanced) {
            optionsAdvanced.addEventListener(
                'click',
                (e) => {
                    e.preventDefault();
                    chrome.tabs.create({
                        url: chrome.runtime.getURL('options/advanced.html'),
                    });
                },
                false,
            );
        }
    },
    false,
);
