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

var subtitutionList = [
    {
        "pattern": /zerator\.com/gi,
        "url": "http://www.twitch.tv/zerator"
    },
    {
        "pattern": /corobizar\.com/gi,
        "url": "http://games.dailymotion.com/live/x162xu2"
    },
    {
        "pattern": /domingo\.tv/gi,
        "url": "http://www.twitch.tv/domingo"
    },
    {
        "pattern": /jiraya\.tv/gi,
        "url": "http://games.dailymotion.com/live/x2lzj0a"
    },
    {
        "pattern": /skyyart\.fr/gi,
        "url": "http://games.dailymotion.com/live/x2m6m14"
    },
    {
        "pattern": /furiie\.tv/gi,
        "url": "http://www.twitch.tv/furiie"
    }
];

var substitute = function (url)
{
    for (var i = 0; i < subtitutionList.length; i++)
    {
        var regexp = subtitutionList[i].pattern;
        if (url.match(regexp) != null && url.match(regexp).length > 0)
        {
            return subtitutionList[i].url;
        }
    }
    return url;
};