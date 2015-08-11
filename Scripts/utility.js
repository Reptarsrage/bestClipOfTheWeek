var Utility = {

    bestClipOfTheWeekPlaylistID : null,

    delayAfter: function executeAsync(func, delay) {
        delay = typeof delay !== 'undefined' ? delay : 0;
        setTimeout(func, delay);
    },

    makeAsyncYouTubeAjaxRequest: function (url, data, success, error) {
        url += "&key=AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE";
        $.ajax({
            url: url,
            type: "GET",
            timeout: 5000,
            cache: false,
            data: data,
            success: function (response) {
                if (response["error"]) {
                    // error
                    error(x, response["error"]["code"], response["error"]["message"]);
                    return;
                }

                success(response);
            },
            error: function (x, t, m) {
                console.log(t + ': ' + x.status + ". " + m + ".");
                error(x, t, m);
            }
        });
    },

    getBestClipOfTheWeekPlaylistID: function (success, error) {
        if (this.bestClipOfTheWeekPlaylistID) {
            success(bestClipOfTheWeekPlaylistID);
        }

        // Retrieve the list of videos in the specified playlist.
        var requestVideoPlaylist = function(channelID, pageToken) {
            var url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=" + channelID + "&maxResults=20"

            if (pageToken) {
                url += "&pageToken=" + pageToken;
            }

            Utility.makeAsyncYouTubeAjaxRequest(url, null,
                function (response) {
                    // Only show pagination buttons if there is a pagination token for the
                    // next or previous page of results.
                    nextPageToken = response.nextPageToken;
                    var playlistItems = response.items;
                    if (playlistItems) {
                        $.each(playlistItems, function (index, item) {
                            var title = item.snippet.title;
                            var id = item.id;
                            if (title == PLAYLIST_TITLE) {
                                videoHistoryStats = new Array();
                                success(id);
                                return;
                            }
                        });
                    }
                    if (nextPageToken)
                        requestVideoPlaylist(channelID, nextPageToken);

                }, function (x,t,m) {
                    console.log(t + ': ' + x.status + ". " + m + ".");
                    error(x, t, m);
                });
        }


        var url = "https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=StoneMountain64&maxResults=1";

        Utility.makeAsyncYouTubeAjaxRequest(url, null, function success(response) {
            if (response["items"] && response.items.length > 0) {
                channelID = response.items[0].id;
                requestVideoPlaylist(channelID);
            } else {
                console.log(t + ': ' + x.status + ". " + m + ".");
                error(x, t, m);
            }
        }, function (x, t, m) {
            console.log(t + ': ' + x.status + ". " + m + ".");
            error(x, t, m);
        });
    }
}