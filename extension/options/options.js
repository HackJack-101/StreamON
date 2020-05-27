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

/* global chrome */

function save_options() {
    let refreshTime = document.getElementById('refreshTime').value;
    refreshTime = parseInt(refreshTime);
    if (refreshTime < 1) {
        refreshTime = 1;
    }

    const streams = document.getElementById('streams').value;
    const cleanedStreams = [];
    const streamArray = streams.split('\n');
    for (const i in streamArray) {
        let s = streamArray[i];
        s = s.trim();
        if (s.length > 0)
            cleanedStreams.push(s);
    }
    chrome.storage.sync.set({
        refreshTime: refreshTime,
        streams: cleanedStreams.join("\n")
    }, function () {
        restore_options();
        const status = document.getElementById('status');
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
        streams: ""
    }, function (options) {
        document.getElementById('refreshTime').value = options.refreshTime;
        document.getElementById('streams').value = options.streams;
        document.getElementById('form').addEventListener('submit', function (e) {
            e.preventDefault();
            save_options();
        }, false);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form').addEventListener('submit', function (e) {
        e.preventDefault();
    });

    restore_options();

    const optionsAdvanced = document.getElementById('advancedOptions');
    if (optionsAdvanced) {
        optionsAdvanced.addEventListener('click', function (e) {
            e.preventDefault();
            chrome.tabs.create({
                url: chrome.runtime.getURL('options/advanced.html')
            });
        }, false);
    }
}, false);
