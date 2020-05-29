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

/* global modules, tools, chrome */

modules.dailymotion =
    {
        data: {},
        check: function (url) {
            var regexp = /dailymotion\.com/gi;
            return (url.match(regexp) !== null && url.match(regexp).length > 0);
        },
        display: function (url) {
            modules.dailymotion.getData(url, modules.dailymotion.displayData);
        },
        getData: function (url, callback) {
            var profile = tools.getProfileName(url);
            var XHR = new XMLHttpRequest();

            XHR.onreadystatechange = function () {
                if (XHR.readyState === 4 && (XHR.status === 200 || XHR.status === 0)) {
                    var result = JSON.parse(XHR.responseText);
                    callback(result.broadcasting, result, profile);
                }
            };
            XHR.open("GET", "https://api.dailymotion.com/video/" + profile + "?fields=broadcasting,embed_url,id,owner,title,owner.avatar_240_url,thumbnail_360_url,owner.username", true);
            XHR.send(null);
        },
        displayData: function (online, content, profile) {
            if (online) {
                var thumbnail = content.thumbnail_360_url;
                var title = content.title;
                var name = content['owner.username'];
                var embed = content.embed_url;
                addOnlineElement(profile, "dailymotion", thumbnail, title, name, null, embed);
            } else {
                addOfflineElement(profile, "dailymotion", content['owner.username']);
            }
        },
        notify: function (url) {
            modules.dailymotion.getData(url, modules.dailymotion.notifyData);
        },
        notifyData: function (online, content, profile) {
            if (!modules.dailymotion.data[profile]) {
                modules.dailymotion.data[profile] = {
                    streamOnline: false,
                    name: "",
                    title: "",
                    logo: ""
                };
            }
            if (online) {
                if (!modules.dailymotion.data[profile].streamOnline) {
                    modules.dailymotion.data[profile].streamOnline = true;
                    modules.dailymotion.data[profile].name = content['owner.username'];
                    modules.dailymotion.data[profile].title = content.title;
                    modules.dailymotion.data[profile].logo = content.owner.avatar_240_url;
                    chrome.storage.sync.get({
                        notif: true
                    }, function (options) {
                        if (options.notif) {
                            var title = modules.dailymotion.data[profile].title;
                            var icon = modules.dailymotion.data[profile].logo;
                            var body = modules.dailymotion.data[profile].name;
                            tools.displayNotification(title, icon, body, function () {
                                modules.dailymotion.openStream(profile);
                            });
                        }
                    });
                } else {
                    if (content.title !== modules.dailymotion.data[profile].title) {
                        modules.dailymotion.data[profile].name = content['owner.username'];
                        modules.dailymotion.data[profile].title = content.title;
                        modules.dailymotion.data[profile].logo = content.owner.avatar_240_url;
                        chrome.storage.sync.get({
                            titleNotif: false
                        }, function (options) {
                            if (options.refreshTime) {
                                var title = modules.dailymotion.data[profile].title;
                                var icon = modules.dailymotion.data[profile].logo;
                                var body = modules.dailymotion.data[profile].name;
                                tools.displayNotification(title, icon, body, function () {
                                    modules.dailymotion.openStream(profile);
                                });
                            }
                        });
                    }
                }
            } else {
                if (modules.dailymotion.data[profile].streamOnline) {
                    modules.dailymotion.data[profile].streamOnline = false;
                }
            }

        },
        openStream: function (profile) {
            var pattern = "*://*.dailymotion.com/video/" + profile;
            var url = "http://www.dailymotion.com/video/" + profile;
            tools.openTab(pattern, url);
        }
    };
