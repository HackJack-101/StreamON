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

function save_options() {
    var refreshTime = document.getElementById('refreshTime').value;
    refreshTime = parseInt(refreshTime);
    if (refreshTime < 1)
        refreshTime = 1;
    var notif = document.getElementById('notif').checked;
    var titleNotif = document.getElementById('titleNotif').checked;
    var contextMenu = document.getElementById('contextMenu').checked;
    var streams = document.getElementById('streams').value;
    var cleanedStreams = [];
    var streamArray = streams.split("\n");
    for (var i in streamArray)
    {
        var s = streamArray[i];
        s = s.trim();
        if (s.length > 0)
            cleanedStreams.push(s);
    }
    chrome.storage.sync.set({
        refreshTime: refreshTime,
        streams: cleanedStreams.join("\n"),
        notif: notif,
        titleNotif: titleNotif,
        contextMenu: contextMenu
    }, function () {
        restore_options();
        var status = document.getElementById('status');
        status.style.display = 'block';
        status.textContent = chrome.i18n.getMessage("optionsSaved");
        setTimeout(function () {
            status.textContent = '';
            status.style.display = 'none';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        refreshTime: 60,
        streams: "",
        notif: true,
        titleNotif: false,
        contextMenu: true
    }, function (options) {
        document.getElementById('notif').checked = options.notif;
        document.getElementById('titleNotif').checked = options.titleNotif;
        document.getElementById('contextMenu').checked = options.contextMenu;
        document.getElementById('refreshTime').value = options.refreshTime;
        document.getElementById('streams').value = options.streams;
        setListener();
    });
}

function importTwitchFollowing(username, offset)
{
    var XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function () {
        if (XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 0))
        {
            var result = JSON.parse(XHR.responseText);
            var streams = document.getElementById('streams').value;
            for (var i = 0; i < result.follows.length; i++)
            {
                var url = result.follows[i].channel.url;
                if (streams.lastIndexOf(url) < 0)
                {
                    if (i === 0 && streams.length > 0)
                        document.getElementById('streams').value += "\n"
                    document.getElementById('streams').value += url + "\n";
                }
            }
            if (result.follows.length >= 25)
                importTwitchFollowing(username, offset + 25);

        }
    };
    XHR.open("GET", "https://api.twitch.tv/kraken/users/" + username + "/follows/channels?direction=DESC&limit=25&offset=" + offset + "&sortby=created_at", true);
    XHR.send(null);
}

function addTwitch()
{
    document.getElementById('addTwitch').style.display = 'none';
    document.getElementById('addTwitchDialog').style.display = 'flex';
    document.getElementById('importTwitch').addEventListener('click', function () {
        var username = document.getElementById('usernameTwitch').value;
        if (username != null && username.length > 0)
        {
            importTwitchFollowing(username, 0);
        }
        document.getElementById('usernameTwitch').value = "";
        document.getElementById('addTwitch').style.display = 'block';
        document.getElementById('addTwitchDialog').style.display = 'none';
    });


}

function setListener()
{
    var addTwitchButton = document.getElementById('addTwitch');
    addTwitchButton.addEventListener('click', addTwitch);

    document.getElementById('form').addEventListener('submit', function (e) {
        e.preventDefault();
        save_options();
    }, false);
}

document.addEventListener('DOMContentLoaded', function ()
{
    document.getElementById('form').addEventListener('submit', function (e) {
        e.preventDefault();
    }, false);

    restore_options();

    var optionsAdvanced = document.getElementById('advancedOptions');
    if (optionsAdvanced)
        optionsAdvanced.addEventListener('click', function (e) {
            e.preventDefault();
            chrome.tabs.create({
                url: chrome.extension.getURL('options/advanced.html')
            });
        }, false);
}, false);
