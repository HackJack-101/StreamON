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
const CLIENT_ID = 'jpzyevuwtdws8n0fz8gp5erx8274r8d';

function save_options() {
    let refreshTime = document.getElementById('refreshTime').value;
    refreshTime = parseInt(refreshTime);
    if (refreshTime < 1) {
        refreshTime = 1;
    }
    const notif = document.getElementById('notif').checked;
    const titleNotif = document.getElementById('titleNotif').checked;
    const contextMenu = document.getElementById('contextMenu').checked;
    const streams = document.getElementById('streams').value;
    const notificationTimeout = parseInt(document.getElementById('notificationTimeout').value);
    const cleanedStreams = [];
    const streamArray = streams.split('\n');
    for (const i in streamArray) {
        let s = streamArray[i];
        s = s.trim();
        if (s.length > 0) {
            cleanedStreams.push(s);
        }
    }
    chrome.storage.sync.set(
        {
            refreshTime: refreshTime,
            streams: cleanedStreams.join('\n'),
            notif: notif,
            titleNotif: titleNotif,
            contextMenu: contextMenu,
            notificationTimeout: notificationTimeout,
        },
        function() {
            restore_options();
            const status = document.getElementById('status');
            status.style.display = 'block';
            status.textContent = chrome.i18n.getMessage('optionsSaved');
            setTimeout(function() {
                status.textContent = '';
                status.style.display = 'none';
            }, 750);
        },
    );
}

function restore_options() {
    chrome.storage.sync.get(
        {
            refreshTime: 60,
            streams: '',
            notif: true,
            titleNotif: false,
            contextMenu: true,
            notificationTimeout: 4000,
        },
        function(options) {
            document.getElementById('notif').checked = options.notif;
            document.getElementById('titleNotif').checked = options.titleNotif;
            document.getElementById('contextMenu').checked = options.contextMenu;
            document.getElementById('refreshTime').value = options.refreshTime;
            document.getElementById('streams').value = options.streams;
            document.getElementById('notificationTimeout').value = options.notificationTimeout;
            setListener();
        },
    );
}

function importTwitchFollowingFromUsername(username) {
    const XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function() {
        if (XHR.readyState === 4 && (XHR.status === 200 || XHR.status === 0)) {
            const result = JSON.parse(XHR.responseText);
            if (result.data && result.data.length > 0) {
                importTwitchFollowing(result.data[0].id, 0);
            }
        }
    };
    XHR.open('GET', 'https://api.twitch.tv/helix/users?login=' + username, true);
    XHR.setRequestHeader('Client-ID', CLIENT_ID);
    XHR.send(null);
}

function importTwitchFollowing(userID, pagination) {
    const XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function() {
        if (XHR.readyState === 4 && (XHR.status === 200 || XHR.status === 0)) {
            const result = JSON.parse(XHR.responseText);
            const streams = document.getElementById('streams').value;
            for (let i = 0; i < result.data.length; i++) {
                const url = 'https://twitch.tv/' + result.data[i].to_name;
                if (streams.lastIndexOf(url) < 0) {
                    if (i === 0 && streams.length > 0) {
                        document.getElementById('streams').value += '\n';
                    }
                    document.getElementById('streams').value += url + '\n';
                }
            }
            if (result.total > 100) {
                importTwitchFollowing(userID, result.pagination.cursor);
            }
        }
    };
    let url = 'https://api.twitch.tv/helix/users/follows?from_id=' + userID + '&first=100';
    if (pagination) {
        url += '&after=' + pagination;
    }
    XHR.open('GET', url, true);
    XHR.setRequestHeader('Client-ID', CLIENT_ID);
    XHR.send(null);
}

function addTwitch() {
    document.getElementById('addTwitch').style.display = 'none';
    document.getElementById('addTwitchDialog').style.display = 'flex';
    document.getElementById('importTwitch').addEventListener('click', function() {
        const username = document.getElementById('usernameTwitch').value;
        if (username !== null && username.length > 0) {
            importTwitchFollowingFromUsername(username);
        }
        document.getElementById('usernameTwitch').value = '';
        document.getElementById('addTwitch').style.display = 'block';
        document.getElementById('addTwitchDialog').style.display = 'none';
    });
}

function setListener() {
    const addTwitchButton = document.getElementById('addTwitch');
    addTwitchButton.addEventListener('click', addTwitch);

    document.getElementById('form').addEventListener(
        'submit',
        function(e) {
            e.preventDefault();
            save_options();
        },
        false,
    );
}

document.addEventListener(
    'DOMContentLoaded',
    function() {
        document.getElementById('form').addEventListener(
            'submit',
            function(e) {
                e.preventDefault();
            },
            false,
        );

        restore_options();

        const optionsAdvanced = document.getElementById('advancedOptions');
        if (optionsAdvanced) {
            optionsAdvanced.addEventListener(
                'click',
                function(e) {
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
