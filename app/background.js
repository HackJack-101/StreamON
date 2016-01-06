chrome.app.runtime.onLaunched.addListener(function () {
	chrome.app.window.create('window.html', {
		id: "miniplayer",
		bounds: {
			width: 832,
			height: 468
		},
		innerBounds: {
			width: 832,
			height: 468
		}
	});
});

chrome.runtime.onMessageExternal.addListener(function (msg) {
	if (chrome.app.window.get("miniplayer"))
		chrome.app.window.get("miniplayer").close();
	chrome.app.window.create('window.html', {
		id: "miniplayer",
		innerBounds: {
			width: 832,
			height: 468
		},
		frame: {color: '#000000'},
		alwaysOnTop: true
	},
			function (createdWindow) {
				var win = createdWindow.contentWindow;
				switch (msg.server)
				{
					case 'twitch.tv':
						win.onload = function () {
							win.document.querySelector('#content').innerHTML =
									'<webview src="http://player.twitch.tv/?channel=' + msg.profile + '" style="width:100vw;height:100vh"></webview>';
						};
						break;
					case 'hitbox.tv':
						win.onload = function () {
							win.document.querySelector('#content').innerHTML =
									'<webview src="http://www.hitbox.tv/embed/' + msg.profile + '" style="width:100vw;height:100vh"></webview>';
						};
						break;
					default:
						break;
				}
			}
	);
});