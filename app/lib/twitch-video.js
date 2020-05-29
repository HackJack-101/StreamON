/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 * Authors :
 * - HackJack https://github.com/Jack3113
 * - AamuLumi https://github.com/AamuLumi
 */

modules.twitch_video = {
    check: function(url) {
        var regexp = /twitch\.tv\/.*\/v\//gi;
        return url.match(regexp) != null && url.match(regexp).length > 0;
    },
    getEmbedURL: function(url) {
        var params = modules.twitch_video.getVideoID(url);
        return 'https://player.twitch.tv/?video=v' + params;
    },
    getVideoID: function(url) {
        var n = url.lastIndexOf('/');
        if (n === url.length - 1) {
            return modules.twitch_video.getVideoID(url.substring(0, url.length - 1));
        } else {
            return url.substring(n + 1);
        }
    },
};
