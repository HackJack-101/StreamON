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

                    win.document.querySelector('#submit').value = chrome.i18n.getMessage("submit");
                    win.document.querySelector('#alwaysOnTopLabel').innerHTML = chrome.i18n.getMessage("alwaysOnTop");
                    win.document.querySelector('#alwaysOnTop').addEventListener('change', function () {
                        var current = chrome.app.window.get("miniplayer");
                        current.setAlwaysOnTop(current.contentWindow.document.querySelector('#alwaysOnTop').checked);
                    });

                    var title = win.document.querySelector('#title');
                    title.innerHTML = chrome.i18n.getMessage("inputURL");

                    var form = win.document.querySelector('#formURL');
                    form.addEventListener('submit', function (e)
                    {
                        e.preventDefault();
                        var url = win.document.querySelector('#url').value;
                        for (var i in modules)
                        {
                            if (modules[i].check(url))
                            {
                                url = modules[i].getEmbedURL(url);
                                break;
                            }
                        }
                        win.document.querySelector('#home').style.display = "none";
                        var webview = win.document.createElement('webview');
                        webview.setAttribute("src", url);
                        win.document.querySelector('#content').appendChild(webview);
                    });
                };
            }
    );
});