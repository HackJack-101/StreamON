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
 *  Author : HackJack https://github.com/Jack3113
 */

modules.youtube_short = {
    check: function(url) {
        var regexp = /youtu\.be/gi;
        return url.match(regexp) != null && url.match(regexp).length > 0;
    },
    getEmbedURL: function(url) {
        var params = modules.youtube_short.getVideoID(url);
        return 'https://www.youtube.com/embed/' + params;
    },
    getVideoID: function(url) {
        var n = url.lastIndexOf('/');
        return url.substring(n + 1);
    },
};
