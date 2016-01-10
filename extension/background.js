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
 */

function checkStreams()
{
    chrome.storage.sync.get({
        streams: "",
        background: true
    }, function (options) {
        if (options.background)
        {
            var s = options.streams;
            var streams = s.split("\n");
            for (var i = 0; i < streams.length; i++)
            {
                if (streams[i].length > 0)
                {
                    var url = streams[i];
                    for (var k in modules)
                    {
                        if (modules[k].check(url))
                        {
                            modules[k].notify(url);
                            break;
                        }
                    }
                }
            }
        }
    });
}

function displayNotification(title, icon, body, callback)
{
    var startStream = new Notification(title,
            {
                icon: icon,
                lang: chrome.i18n.getMessage("locale"),
                body: body
            }
    );

    startStream.onclick = function () {
        callback();
        this.close();
    };
}

function main()
{
    checkStreams();
    chrome.storage.sync.get({
        refreshTime: 60
    }, function (options) {
        setInterval(checkStreams, 1000 * options.refreshTime);
    });
}

main();