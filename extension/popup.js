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

/* global chrome, modules, tools */

async function checkStreams() {
    chrome.storage.sync.get({
        streams: ''
    }, async (options) => {
        let streams = options.streams;
        streams = streams.split('\n');
        let twitchStreams = streams.filter((stream) => {
            return modules.twitch.check(substitute(stream));
        });
        const twitch = await modules.twitch.getAsyncBulkData(twitchStreams);
        twitch.forEach(({game, name, startedAt, thumbnail, title, viewers, embed}) => addOnlineElement(name, 'twitch', thumbnail, title, name, game, viewers, embed));
        console.log(twitch);

    });
}

function addOfflineElement(profile, server, name) {
    const e = document.createElement('div');
    e.setAttribute('class', 'streamOff link');
    e.setAttribute('data-profile', profile);
    e.addEventListener('click', function () {
        modules[server].openStream(this.getAttribute('data-profile'));
    }, false);
    if (name)
        e.innerHTML = name;
    else
        e.innerHTML = profile;

    document.getElementById('offlineList').appendChild(e);
    const offlineNumber = document.getElementById('offline');
    offlineNumber.innerHTML = parseInt(offlineNumber.innerHTML) + 1;
}

function addOnlineElement(profile, server, _img, _title, _name, _game, _viewers, embed) {
    const e = document.createElement('a');
    e.setAttribute('class', 'streamOn');
    e.setAttribute('data-profile', profile);

    const img = document.createElement('img');
    img.setAttribute('class', 'preview pointer');
    img.setAttribute('width', '80');
    img.setAttribute('height', '45');
    img.setAttribute('alt', 'preview');
    img.setAttribute('src', 'assets/play.png');
    img.setAttribute('style', 'background-image:url(\'' + _img + '\')');
    img.addEventListener('click', function () {
        modules[server].openStream(this.parentNode.getAttribute('data-profile'));
    }, false);
    e.appendChild(img);

    const desc = document.createElement('div');
    desc.setAttribute('class', 'description');

    const title = document.createElement('span');
    title.setAttribute('class', 'link title');
    title.innerHTML = _title;
    title.addEventListener('click', function () {
        modules[server].openStream(this.parentNode.parentNode.getAttribute('data-profile'));
    }, false);
    desc.appendChild(title);

    const name = document.createElement('span');
    name.setAttribute('class', 'username');
    name.innerHTML = _name;
    desc.appendChild(name);

    if (_game) {
        const playing = document.createElement('span');
        playing.setAttribute('class', 'playing');
        playing.innerHTML = ' ' + chrome.i18n.getMessage('playingTo') + ' ';

        const game = document.createElement('span');
        game.setAttribute('class', 'game');
        game.innerHTML = _game;
        desc.appendChild(playing);
        desc.appendChild(game);
    }

    const viewers = document.createElement('div');
    viewers.innerHTML = '' + _viewers + ' viewers';
    desc.appendChild(viewers);

    const miniPlayer = document.createElement('div');
    miniPlayer.setAttribute('class', 'link');
    miniPlayer.innerHTML = chrome.i18n.getMessage('openMiniPlayer');
    miniPlayer.addEventListener('click', function () {
        tools.openMiniPlayer(embed);
    }, false);
    desc.appendChild(miniPlayer);

    e.appendChild(desc);

    document.getElementById('onlineList').appendChild(e);
    const onlineNumber = document.getElementById('online');
    onlineNumber.innerHTML = parseInt(onlineNumber.innerHTML) + 1;
}

async function main() {
    await checkStreams();
}

window.addEventListener('DOMContentLoaded', main, false);