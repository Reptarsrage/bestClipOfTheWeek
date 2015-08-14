/*
Justin Robb
8/20/15
bestClipOfTheWeek
Twitter function for getting video replies
*/


var TwitterPlugIn = {
    /* Example Call
    getTwitterCommentsForVideo("yEXuG2IRL2k", function (com, auth) {
        $("#test").append("<p>" + auth + " - " + com + "</p>");
    }, function (err) {
        $("#test").append("<p>" + err + "</p>");
    });

    */
    getTwitterCommentsForVideo: function (videoId, successCallback, errorCallback) {
        ////////////////// PRIVATE VARS AND METHODS /////////////
        var url = "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=StoneMountain64"
        var loginUrl = "https://api.twitter.com/oauth2/token";
        var tweetUrl = "https://api.twitter.com/1.1/statuses/lookup.json";
        var invalidate = "https://api.twitter.com/oauth2/invalidate_token"
        var replyUrl = "https://api.twitter.com/1.1/search/tweets.json";

        var searchTweetsForVideoId = function (max, videoId, token, callback, successCallback) {
            var req = url + "&count=200&exclude_replies=true";
            if (max) {
                req = req + "&max_id=" + max;
            }

            $.ajax({
                url: req,
                type: "GET",
                timeout: 20000,
                cache: true,
                data: {
                },
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (response) {
                    var lastId = "";
                    var min, max = null;
                    for (var i = 0; i < response.length; i++) {
                        var itm = response[i];
                        lastId = itm.id;
                        var text = itm.text;
                        $(itm.entities.urls).each(function (urlidx, urlitm) {
                            text = text.replace(urlitm.url, urlitm.expanded_url);
                        });

                        if (text.indexOf(videoId) >= 0) {
                            successCallback(text, itm.user.screen_name);
                            callback(itm.id, null);
                            return;
                        }
                    }
                    if (response.length > 1) {
                        searchTweetsForVideoId(lastId, videoId, token, callback);
                    } else {
                        callback(null, "No matching tweet found.");
                    }
                },
                error: function (x, t, m) {
                    if (x.responseText) {
                        callback(null, x.status + x.responseText);
                    } else {
                        callback(null, t + m);
                    }
                }
            });
        }

        var getTweetReplies = function (id, videoId, max, token, callback, successCallback) {
            req = replyUrl + "?count=100&q=" + encodeURIComponent("@StoneMountain64");
            if (max) {
                req = req + "&max_id=" + max;
            }

            $.ajax({
                url: req,
                type: "GET",
                timeout: 5000,
                cache: true,
                data: {
                },
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (response) {
                    var lastId = "";
                    for (var i = 0; i < response.statuses.length; i++) {
                        var itm = response.statuses[i];
                        var text = itm.text;
                        $(itm.entities.urls).each(function (urlidx, urlitm) {
                            text = text.replace(urlitm.url, urlitm.expanded_url);
                        });

                        if (itm.in_reply_to_status_id == id || text.indexOf(videoId) >= 0) {
                            successCallback(text, itm.user.screen_name);
                        }
                        lastId = itm.id;
                    }

                    if ($(response.statuses).length > 1) {
                        getTweetReplies(id, videoId, lastId, token, callback, successCallback)
                    } else {
                        callback(null);
                    }
                },
                error: function (x, t, m) {
                    if (x.responseText) {
                        callback(x.status + x.responseText);
                    } else {
                        callback(t + m);
                    }
                }
            });
        }

        var login = function (callback) {
            var key = encodeURIComponent("5sBmUfKa7AW4uUM57fBGiovAQ");
            var secret = encodeURIComponent("dcqeF03wT8OG3PxUxK1WNA3OHcASBne0dQvRmFKgZukbSelxzr");
            $.ajax({
                url: loginUrl,
                type: "POST",
                timeout: 5000,
                async: false,
                data: {
                    grant_type: "client_credentials"
                },
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                headers: {
                    "Authorization": "Basic " + btoa(key + ":" + secret)
                },
                success: function (response) {
                    if (response.token_type != "bearer") {
                        callback(null, "Failure bad tokenType " + response.token_type + ".");
                    } else {
                        callback(response.access_token, null);
                    }
                },
                error: function (x, t, m) {
                    if (x.responseText) {
                        callback(null, x.status + x.responseText);
                    } else {
                        callback(null, t + m);
                    }
                }
            });
        }

        var logout = function () {
            var key = encodeURIComponent("5sBmUfKa7AW4uUM57fBGiovAQ");
            var secret = encodeURIComponent("dcqeF03wT8OG3PxUxK1WNA3OHcASBne0dQvRmFKgZukbSelxzr");
            $.ajax({
                url: loginUrl,
                type: "POST",
                timeout: 5000,
                cache: false,
                data: {
                    grant_type: "client_credentials"
                },
                contentType: "application/x-www-form-urlencoded",
                headers: {
                    "Authorization": "Basic " + btoa(key + ":" + secret)
                },
                success: function (response) {
                },
                error: function (x, t, m) {
                    console.log("Error logging out of twitter API. " + m);
                }
            });
        }

        ////////////////// PUBLIC //////////////////////////////
        login(function (accessToken, error) {
            if (!accessToken || error) {
                console.log("Unable to log into twitter API.");
                errorCallback(error);
                return;
            }

            searchTweetsForVideoId(null, videoId, accessToken, function (tweetID, error) {
                if (!tweetID || error) {
                    logout();
                    errorCallback(error);
                    console.log("Unable to find any comments on Twitter.");
                    return;
                }

                getTweetReplies(tweetID, videoId, null, accessToken, function (error) {
                    if (error) {
                        errorCallback(error);
                    }

                    logout();
                    console.log("Done searching Twitter.");
                }, successCallback);
            }, successCallback);
        });
    }
}


//code to get individual tweet
/*tweetIds = tweetIds.substring(0, tweetIds.length - 1);
$.ajax({
    url: tweetUrl + "?map=true&id=" + tweetIds,
    type: "POST",
    timeout: 5000,
    async: false,
    cache: false,
    data: {
    },
    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
    headers: {
        "Authorization": "Bearer " + token
    },
    success: function (response) {
        var dict = response.id;
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                $('#test').append($("<p>" + key + " : "+dict[key]+"</p>"));
            }
        }
    },
    error: function (x, t, m) {
        $('#test').append($("<p>Failure " + x.status + x.responseText + "</p>"));
    }
});*/