chrome.runtime.onMessageExternal.addListener(function (msg) {
	if (chrome.app.window.get(msg.server + "_" + msg.profile))
		chrome.app.window.get(msg.server + "_" + msg.profile).focus();
	chrome.app.window.create('window.html', {
		id: msg.server + "_" + msg.profile,
		innerBounds: {
			width: 832,
			height: 468
		},
		frame: {color: '#000000'}
	},
			function (createdWindow) {
				var win = createdWindow.contentWindow;
				switch (msg.server)
				{
					case 'twitch':
						win.onload = function () {
							var webview = win.document.createElement('webview');
							webview.setAttribute("src", 'http://player.twitch.tv/?channel=' + msg.profile);
							win.document.querySelector('#content').appendChild(webview);
							win.document.querySelector('#alwaysOnTopLabel').innerHTML = chrome.i18n.getMessage("alwaysOnTop");
							win.document.querySelector('#alwaysOnTop').addEventListener('change', function () {
								var id = msg.server + "_" + msg.profile;
								chrome.app.window.get(id).setAlwaysOnTop(chrome.app.window.get(id).contentWindow.document.querySelector('#alwaysOnTop').checked);
							});
						};
						break;
					case 'hitbox':
						win.onload = function () {
							webview.setAttribute("src", 'http://www.hitbox.tv/embed/' + msg.profile);
							win.document.querySelector('#content').appendChild(webview);
							win.document.querySelector('#alwaysOnTopLabel').innerHTML = chrome.i18n.getMessage("alwaysOnTop");
							win.document.querySelector('#alwaysOnTop').addEventListener('change', function () {
								var id = msg.server + "_" + msg.profile;
								chrome.app.window.get(id).setAlwaysOnTop(chrome.app.window.get(id).contentWindow.document.querySelector('#alwaysOnTop').checked);
							});
						};
						break;
					default:
						break;
				}
				win.addEventListener('permissionrequest', function (e) {
					if (e.permission == 'fullscreen') {
						e.request.allow();
					}
				});
			}
	);
});