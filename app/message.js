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


/* global modules, chrome */

String.prototype.hash = function() {
    let hash = 0;
    if (this.length === 0) {
        return hash;
    }
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return "hash" + hash;
};

chrome.runtime.onMessageExternal.addListener(function(msg) {
    const windowID = msg.url.hash();
    if (chrome.app.window.get(windowID)) {
        chrome.app.window.get(windowID).focus();
    }
    chrome.app.window.create('window.html', {
        id: windowID,
        innerBounds: {
            width: 832,
            height: 468
        },
        frame: {color: '#000000'}
    }, function(createdWindow) {
        const win = createdWindow.contentWindow;
        win.addEventListener("load", function() {
            win.document.querySelector('#home').style.display = "none";
            const webview = win.document.createElement('webview');

            let url = substitute(msg.url);
            if (msg.resolution) {
                for (const i in modules) {
                    if (modules.hasOwnProperty(i)) {
                        if (modules[i].check(url)) {
                            url = modules[i].getEmbedURL(url);
                            break;
                        }
                    }
                }
            }
            webview.setAttribute("src", url);

            win.document.querySelector('#content').appendChild(webview);
            win.document.querySelector('#alwaysOnTopLabel').innerHTML = chrome.i18n.getMessage("alwaysOnTop");
            win.document.querySelector('#alwaysOnTop').addEventListener('change', function() {
                const current = chrome.app.window.get(windowID);
                current.setAlwaysOnTop(current.contentWindow.document.querySelector('#alwaysOnTop').checked);
                current.drawAttention();
            });

            win.document.querySelector('#visibleOnAllWorkspacesLabel').innerHTML = chrome.i18n.getMessage("visibleOnAllWorkspaces");
            win.document.querySelector('#visibleOnAllWorkspaces').addEventListener('change', function() {
                const current = chrome.app.window.get(windowID);
                current.setVisibleOnAllWorkspaces(current.contentWindow.document.querySelector('#visibleOnAllWorkspaces').checked);
                current.drawAttention();
            });

            if (!chrome.app.window.canSetVisibleOnAllWorkspaces()) {
                win.document.querySelector('label[for="visibleOnAllWorkspaces"]').style.display = "none";
            }
        });
    });
});
