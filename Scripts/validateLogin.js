var urlParams;

function validateLogin() {
    var match,
    pl = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);

    //check for token
    if (!urlParams['token'] || !urlParams['username'])
        window.location = "login.html?v=0.4.1.0(beta)";

    // authorize
    var username = urlParams['username'];
    var token = urlParams['token'];

    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        async: false,
        type: "GET",
        cache: false,
        timeout: 5000,
        data: {
            username: username,
            token: token,
            authorize: 'authorize'
        },
        success: function (msg) {
            if (!msg) {
                window.location = "login.html?v=0.4.1.0(beta)";
            }
            // msg.status
            // msg.responseText
            // msg. statusText
            if (msg.hasOwnProperty("status")) {
                if (msg.status != 200)
                    window.location = "login.html?v=0.4.1.0(beta)";
            }
        },
        error: function (reason) {
            window.location = "login.html?v=0.4.1.0(beta)";
        },
    });
}