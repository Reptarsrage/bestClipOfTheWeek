"use strict";
var ImageGrid = ImageGrid || (function ($, w, d) {
    var App = {},
        Utils = {},
        Events = {},
        Public = {};

    //constants
    var TIMER_DELAY = 500;
    var MIN_TIMER_DELAY = 300;
    var RAPID_TIMER_DELAY = 50;
    var TRY_COUNT = 10;
    var MAX_REQS = 108;
    var PLAYLIST_TITLE = "World's Best Clip of the Week";

    // vars
    var BackgroundImgArray;
    var StopTimer = false;
    var BackgroundInit = false;
    var BackgroundComplete = false;
    var BackgroundImgQueue;

    Utils = {
        //+ Jonas Raoni Soares Silva
        //@ http://jsfromhell.com/array/shuffle [v1.0]
        shuffle: function (o) { //v1.0
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        }
    };

    Events = {
        init: function () {
        }
    };

    App = {
        initOnLoad: function () {
            // Events
            Events.init();

            App.backgroundInitialize();
            App.fillBackground();
        },
        fillBackground: function (retryCount) {
            retryCount = retryCount || 0;
            var url = "https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=StoneMountain64&maxResults=1";

            Utility.makeAsyncYouTubeAjaxRequest(url, null, function success(resp) {
                if (resp.items && resp.items.length > 0) {
                    var channelID = resp.items[0].id;
                    App.requestVideoPlaylist(channelID);
                } else {
                    console.log("Error: No channel found.");
                    Utility.delayAfter(function () { App.fillBackground(retryCount); }, 1000);
                }
            }, function error(x, t, m) {
                console.log("Error: " + t + ". " + m + ".");
                if (retryCount <= TRY_COUNT) {
                    retryCount++;
                    Utility.delayAfter(function () { App.fillBackground(retryCount); }, 1000);
                } else {
                    console.log("Retry limit reached. Giving Up!");
                }
            });
        },
        // Retrieve the list of videos in the specified playlist.
        requestVideoPlaylist: function (channelID, pageToken, retryCount) {
            retryCount = retryCount || 0;
            var url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=" + channelID + "&maxResults=20"

            if (pageToken) {
                url += "&pageToken=" + pageToken;
            }

            Utility.makeAsyncYouTubeAjaxRequest(url, null,
                function success(response) {
                    var nextPageToken = response.nextPageToken;
                    var playlistItems = response.items;
                    if (playlistItems) {
                        $.each(playlistItems, function (index, item) {
                            var title = item.snippet.title;
                            var id = item.id;
                            if (title === PLAYLIST_TITLE) {
                                App.requestVideosInPlaylist(id);
                                return;
                            }
                        });
                    }
                    if (nextPageToken) {
                        App.requestVideoPlaylist(channelID, nextPageToken, retryCount);
                    }
                },
                function error(x, t, m) {
                    console.log("Error: " + t + ". " + m + ".");
                    if (retryCount <= TRY_COUNT) {
                        retryCount++;
                        Utility.delayAfter(function () { App.requestVideoPlaylist(channelID, pageToken, retryCount); }, 1000);
                    } else {
                        console.log("Retry limit reached. Giving Up!");
                    }
                });
        },
        // Retrieve the list of videos in the specified playlist.
        requestVideosInPlaylist: function (playlistId, pageToken, retryCount, reqCount) {
            retryCount = retryCount || 0;
            reqCount = reqCount || 0;
            var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistId + "&maxResults=20"

            if (pageToken) {
                url += "&pageToken=" + pageToken;
            }
            Utility.makeAsyncYouTubeAjaxRequest(url, null,
                function success(response) {

                    var nextPageToken = response.nextPageToken;
                    reqCount += 20;

                    var playlistItems = response.items;
                    if (playlistItems) {
                        $.each(playlistItems, function (index, item) {
                            if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("default")) {
                                url = item.snippet.thumbnails.default.url;
                            } else if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("high")) {
                                url = item.snippet.thumbnails.high.url;
                            } else {
                                url = "";
                            }
                            if (url.length > 0) {
                                BackgroundImgArray.push(url);
                            }
                        });
                    }

                    if (nextPageToken && reqCount < MAX_REQS)
                        App.requestVideosInPlaylist(playlistId, nextPageToken, retryCount, reqCount);
                }, function error(x, t, m) {
                    // error
                    console.log("Error: " + x.status + ". " + m);
                    if (retryCount <= TRY_COUNT) {
                        retryCount++;
                        Utility.delayAfter(function () { App.requestVideosInPlaylist(playlistId, pageToken, retryCount, reqCount); }, 1000);
                    } else {
                        console.log("Retry limit reached. Giving Up!");
                    }
                });
        },
        backgroundUpdate: function () {
            if (StopTimer)
                return;

            App.displayBackgroundImage();

            if (BackgroundComplete) {
                Utility.delayAfter(App.backgroundUpdate, Math.floor(Math.random() * 200) + MIN_TIMER_DELAY);
            } else {
                Utility.delayAfter(App.backgroundUpdate, RAPID_TIMER_DELAY);
            }
        },
        displayBackgroundImage: function () {
            if (!BackgroundInit)
                return;

            var visibleEltIdx = BackgroundImgQueue.findIndex(function (item) {
                return $(item).is(":visible");
            });

            if (visibleEltIdx >= 0 && BackgroundImgArray.length > 0) {
                var $elt = $(BackgroundImgQueue[visibleEltIdx]);
                BackgroundImgQueue.splice(visibleEltIdx, 1);
                if (BackgroundImgQueue.length === 0) {
                    BackgroundComplete = true;
                }
                var $front = $elt.find(".front");
                var $back = $elt.find(".back");
                $front.css('background-image', 'url(' + BackgroundImgArray[Math.floor(Math.random() * BackgroundImgArray.length)] + ')');
                $back.css('background-image', 'url(' + BackgroundImgArray[Math.floor(Math.random() * BackgroundImgArray.length)] + ')');
                if ($(window).width() >= 768) {
                    $elt.flip('toggle');
                }
            } else {
                var $cards = $(".bcotwTile.flipper:visible");
                if ($cards.length > 0) {
                    var rand = Math.floor(Math.random() * $cards.length);
                    var $elt = $cards.eq(rand);
                    if ($(window).width() >= 768) {
                        $elt.flip('toggle');
                    }
                }
            }
        },
        backgroundInitialize: function () {
            if (BackgroundInit) return;

            BackgroundImgArray = new Array();
            BackgroundImgQueue = new Array();
            var overallCount = 0;
            var lastCount = 0;
            var timerCount = 0;

            $.each($(".bcotwTile.flipper"), function (i, val) {
                $(val).flip({
                    trigger: 'manual',
                    axis: 'y',
                    reverse: false
                });
                BackgroundImgQueue.push(val);
            });

            BackgroundInit = true;
            BackgroundImgQueue = Utils.shuffle(BackgroundImgQueue);
            App.backgroundUpdate();
        }
    };

    Public = {
        init: App.initOnLoad
    };

    return Public;
})(window.jQuery, window, document);

jQuery(document).ready(ImageGrid.init);