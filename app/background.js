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

chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('window.html', {
        id: "miniplayer",
        innerBounds: {
            width: 832,
            height: 468
        }
    },
            function (createdWindow) {
                var win = createdWindow.contentWindow;
                win.onload = function () {

                    win.document.querySelector('#alwaysOnTopLabel').innerHTML = chrome.i18n.getMessage("alwaysOnTop");
                    win.document.querySelector('#alwaysOnTop').addEventListener('change', function () {
                        var current = chrome.app.window.get("miniplayer");
                        current.setAlwaysOnTop(current.contentWindow.document.querySelector('#alwaysOnTop').checked);
                    });

                    var form = win.document.createElement('form');
                    var title = win.document.createElement('h2');
                    title.setAttribute("id", "title");
                    title.innerHTML = chrome.i18n.getMessage("inputURL");
                    var input = win.document.createElement('input');
                    input.setAttribute("type", "text");
                    input.setAttribute("id", "url");
                    form.addEventListener('submit', function ()
                    {
                        var url = win.document.querySelector('#url').value;
                        form.style.display = "none";
                        var webview = win.document.createElement('webview');
                        webview.setAttribute("src", url);
                        win.document.querySelector('#content').appendChild(webview);
                    });
                    form.appendChild(title);
                    form.appendChild(input);
                    win.document.querySelector('#content').appendChild(form);

                };
                win.addEventListener("mouseover", function () {
                    win.document.querySelector('#options').style.display = "block";
                });
                win.addEventListener("mouseout", function () {
                    win.document.querySelector('#options').style.display = "none";
                });
                win.addEventListener('permissionrequest', function (e) {
                    if (e.permission == 'fullscreen') {
                        e.request.allow();
                    }
                });
            }
    );
});

String.prototype.hash = function () {
    var hash = 0;
    if (this.length == 0)
        return hash;
    for (i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        var hash = ((hash << 5) - hash) + char;
        var hash = hash & hash;
    }
    return "hash" + hash;
}


chrome.runtime.onMessageExternal.addListener(function (msg) {
    var windowID = msg.url.hash();
    if (chrome.app.window.get(windowID))
        chrome.app.window.get(windowID).focus();
    chrome.app.window.create('window.html', {
        id: windowID,
        innerBounds: {
            width: 832,
            height: 468
        },
        frame: {color: '#000000'}
    },
            function (createdWindow) {
                var win = createdWindow.contentWindow;
                win.addEventListener("load", function () {
                    var webview = win.document.createElement('webview');
                    webview.setAttribute("src", msg.url);
                    win.document.querySelector('#content').appendChild(webview);
                    win.document.querySelector('#alwaysOnTopLabel').innerHTML = chrome.i18n.getMessage("alwaysOnTop");
                    win.document.querySelector('#alwaysOnTop').addEventListener('change', function () {
                        var id = windowID;
                        var current = chrome.app.window.get(id);
                        current.setAlwaysOnTop(current.contentWindow.document.querySelector('#alwaysOnTop').checked);
                        current.drawAttention();
                    });
                });
                win.addEventListener("mouseover", function () {
                    win.document.querySelector('#options').style.display = "block";
                });
                win.addEventListener("mouseout", function () {
                    win.document.querySelector('#options').style.display = "none";
                });
                win.addEventListener('permissionrequest', function (e) {
                    if (e.permission == 'fullscreen') {
                        e.request.allow();
                    }
                });
            }
    );
});