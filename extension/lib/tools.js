var tools = {
    getProfileName: function (url)
    {
        var n = url.lastIndexOf("/");
        if (n == (url.length - 1))
            return tools.getProfileName(url.substring(0, url.length - 1));
        else
            return url.substring(n + 1);
    },
    openTab: function (pattern, url)
    {
        chrome.tabs.query({url: pattern}, function (a) {
            if (a.length < 1) // Si la page n'est pas déjà ouverte, on ouvre un nouvel onglet
                chrome.tabs.create({url: url});
            else // Sinon on passe le focus sur la premiere page contenant le pattern
                chrome.tabs.highlight({windowId: a[0].windowId, tabs: a[0].index});
        });
    }
};

var modules = {};

