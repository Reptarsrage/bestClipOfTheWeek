/*
Justin Robb
8/20/15
bestClipOfTheWeek
Utility functions (shared)
*/


// Constants
const GOOD = 0;
const BAD = 1;
const OKAY = 2
const VERSION_NUMBER = "0.5.1.1(beta)"
const PLAYLIST_TITLE = "World's Best Clip of the Week"


var Utility = {

    bestClipOfTheWeekPlaylistID: null,

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
                if (!response) {
                    error({ status: "Error" }, 500, "No response from server.");
                    return;
                }

                if (response["error"]) {
                    // error
                    error(x, response["error"]["code"], response["error"]["message"]);
                    return;
                }

                success(response);
            },
            error: function (x, t, m) {
                console.log(t + ': ' + x.status + ". " + m);
                error(x, t, m);
            }
        });
    },

    getGooglePlusComments: function (videoId, success, error, final) {
        var url = "https://www.googleapis.com/plus/v1/people?query=%22Stonemountain64%22";
        Utility.makeAsyncYouTubeAjaxRequest(url, null,
            function (response) {
                var id = null;
                $(response.items).each(function (idx, itm) {
                    if (id) {
                        return;
                    }

                    if (itm.displayName == "StoneMountain64" && itm.url.indexOf("StoneMountain64") > -1) {
                        id = itm.id;
                    }
                });

                if (!id) {
                    error(x, t, m);
                    return;
                }

                url = "https://www.googleapis.com/plus/v1/people/" + id + "/activities/public?";

                var getPost = function (url, page) {
                    var req = url;
                    if (page) {
                        req += "&pageToken=" + page;
                    }

                    Utility.makeAsyncYouTubeAjaxRequest(req, null,
                        function (response) {
                            var postId = null;
                            $(response.items).each(function (idx, itm) {
                                if (postId) {
                                    return;
                                }
                                if (itm.object && itm.object.attachments) {
                                    $(itm.object.attachments).each(function (attidx, attitm) {
                                        if (postId) {
                                            return;
                                        }
                                        if (attitm.objectType == "video" && attitm.url.indexOf(videoId) >= 0) {
                                            postId = itm.id;
                                            success(itm.object.content, "StoneMountain64");
                                        }
                                    });
                                }
                            });

                            if (!postId && response.nextPageToken) {
                                getPost(url, response.nextPageToken);
                                return;
                            } else if (!postId) {
                                error(null, 404, "Error: Post not found.");
                                return;
                            }

                            url = "https://www.googleapis.com/plus/v1/activities/" + postId + "/comments?"

                            var getCommentPage = function (url, page) {
                                var req = url;
                                if (page) {
                                    req += "&pageToken=" + page;
                                }

                                Utility.makeAsyncYouTubeAjaxRequest(req, null,
                                function (response) {
                                    $(response.items).each(function (idx, itm) {
                                        success(itm.object.content, itm.actor.displayName);

                                    });
                                    if (response.nextPageToken) {
                                        getCommentPage(url, response.nextPageToken);
                                    } else {
                                        final();
                                    }
                                }, error);
                            }
                            getCommentPage(url, null);
                        },
                        error);
                }
                getPost(url, null);
            }, error);
    },

    getBestClipOfTheWeekPlaylistID: function (success, error) {
        if (this.bestClipOfTheWeekPlaylistID) {
            success(bestClipOfTheWeekPlaylistID);
        }

        // Retrieve the list of videos in the specified playlist.
        var requestVideoPlaylist = function (channelID, pageToken) {
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

                }, function (x, t, m) {
                    console.log(t + ': ' + x.status + ". " + m);
                    error(x, t, m);
                });
        }


        var url = "https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=StoneMountain64&maxResults=1";

        Utility.makeAsyncYouTubeAjaxRequest(url, null, function success(response) {
            if (response["items"] && response.items.length > 0) {
                channelID = response.items[0].id;
                requestVideoPlaylist(channelID);
            } else {
                console.log(t + ': ' + x.status + ". " + m);
                error(x, t, m);
            }
        }, function (x, t, m) {
            console.log(t + ': ' + x.status + ". " + m);
            error(x, t, m);
        });
    },

    loadTermsAndColors: function (user, success, error) {
        if (!user) {
            console.log("Internal Error at loadTermsAndColors.");
            error("Internal Error");
            return;
        }

        var listElt = $("<ul></ul>");

        // get terms and colors
        $.ajax({
            url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
            type: "GET",
            timeout: 5000,
            cache: false,
            data: {
                username: user,
                token: urlParams['token']
            },
            success: function (resp) {
                if (resp["error"]) {
                    // error?
                    console.log("Error: " + resp.error.message);
                    error(resp);
                    return;
                } else {
                    ConfiguredColorArray = new Array();
                    ConfiguredTermArray = new Array();
                    var rows = resp.split("<br/>");
                    var diabledQueue = [];
                    for (i = 0; i < rows.length; i++) {
                        cols = rows[i].split(" ");
                        if (cols[0].trim() == '')
                            continue;

                        //enabled
                        var enabled = false;
                        if (cols[2] > 0)
                            enabled = true;


                        if (enabled) {
                            // color
                            if (cols[1].indexOf('#') < 0)
                                cols[1] = '#' + cols[1];
                            ConfiguredColorArray.push(cols[1]);
                            $("<style>")
                                .prop("type", "text/css")
                                .html("\
                            ." + cols[0].replace(/[^\w]/gi, '') + " {\
                                font-weight: bold; \
                                color: " + cols[1] + ";\
                            }")
                                .appendTo("head");
                        }

                        // term
                        if (enabled) {
                            ConfiguredTermArray.push([cols[0].replace(/&nbsp;/g, ' '), 0]);
                            var list = $("<li class=" + cols[0].replace(/[^\w]/gi, '') + "></li>");
                            list.text(cols[0].replace(/&nbsp;/g, ' '));
                            listElt.append(list);
                        } else {
                            var list = $("<li class='disabled'></li>");
                            list.text("(disabled): " + cols[0].replace(/&nbsp;/g, ' '));
                            diabledQueue.push(list);
                        }                   
                    }

                    while (diabledQueue.length > 0) {
                        listElt.append(diabledQueue.shift());
                    }
                }
                success(ConfiguredColorArray, ConfiguredTermArray, listElt);
            },
            error: function (x, t, m) {
                console.log(t + ': ' + x.status + ". " + m);
                error()
            },
        });
    },

    populateBestOfTheWeek: function (success, error) {
        var videoHistoryStats = new Array();
        var listElt = $("<ol></ol>");

        var addVideoStatsToArray = function (id, title, shorthand, dateadded) {
            if (id.trim() == '')
                return false;

            var url = "https://www.googleapis.com/youtube/v3/videos?part=statistics&id=" + id + "&maxResults=1"

            Utility.makeAsyncYouTubeAjaxRequest(url, null,
               function (response) {
                   if (response.pageInfo.totalResults > 0 && response.items.length > 0) {
                       // stats
                       viewCount = response.items[0].statistics.viewCount;
                       likeCount = response.items[0].statistics.likeCount;
                       commentCount = response.items[0].statistics.commentCount;
                       videoHistoryStats.push([title, viewCount, commentCount, likeCount, shorthand, dateadded]);
                       return true;
                   } else {
                       return false;
                   }
               }, function (x, t, m) {
                   return false;
               });
            return true;
        }


        var requestVideosInPlaylist = function (playlistId, pageToken) {

            var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistId + "&maxResults=20"

            if (pageToken) {
                url += "&pageToken=" + pageToken;
            }
            Utility.makeAsyncYouTubeAjaxRequest(url, null,
               function (response) {

                   nextPageToken = response.nextPageToken;

                   var playlistItems = response.items;
                   if (playlistItems) {
                       $.each(playlistItems, function (index, item) {
                           date = new Date(item.snippet.publishedAt);
                           title = item.snippet.title;
                           pos = item.snippet.position;

                           if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("default")) {
                               url = item.snippet.thumbnails.default.url;
                           } else if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("high")) {
                               url = item.snippet.thumbnails.high.url;
                           } else {
                               url = "";
                           }
                           id = item.snippet.resourceId.videoId;

                           if (title.length > 80) {
                               title = title.substring(0, 77) + "...";
                           }

                           content = $("<li class='option' onclick='addUrlToInput(\"https://www.youtube.com/watch?v=" + id + "\", this)' title='" + item.snippet.title + "'></li>");
                           content.append($("<img class='option_thumb' src='" + url + "' alt='" + pos + "' \>"));
                           content.append($("<h3 class='option_title' >" + title + "<br><p class='option_date'>Date added: " + date.toLocaleDateString() + "</p></h3>"));
                           listElt.append(content);

                           // add to stored list for column chart usage
                           if (!addVideoStatsToArray(item.snippet.resourceId.videoId, item.snippet.title, item.snippet.title.substring(0, 20) + "...", date)) {
                               error({ status: null }, "500", "Internal Error");
                               return;
                           }
                       });
                       if (!pageToken) {
                           success(videoHistoryStats, listElt);
                       }
                   }

                   if (nextPageToken)
                       requestVideosInPlaylist(playlistId, nextPageToken);
               }, function (x, t, m) {
                   error(x, t, m);
               });
        }

        Utility.getBestClipOfTheWeekPlaylistID(function (id) {
            requestVideosInPlaylist(id);
        }, function (x, t, m) {
            error(x, t, m);
        });
    },

    // Helper method to display a message on the page.
    displayMessage: function (message, good) {
        $('#message h1').text(message);
        $('#message .loadBar').remove();

        if (good == GOOD) {
            $('#message').attr("class", "good");
            $('#message').fadeIn(500, function () {
                $('#message').fadeOut(2000);
            });
        } else if (good == BAD) {
            $('#message').attr("class", "bad");
            $('#message').fadeIn(500);
        } else {
            $('#message').attr("class", "okay");
            $('#message').fadeIn(500);
        }
    },

    // Helper method to display a message on the page.
    displayLoading: function (message, percentage) {
        if ($('#message').attr("class") == "bad") {
            return;
        }

        $('#message').fadeIn(500);
        $('#message h1').text(message);
        if ($('#message .loadBar').length <= 0) {
            $('#message').attr("class", "");
            $('#message').append($("<div class='loadBar'></div>"));
        }
        if (percentage >= 0.95) {
            percentage = 0.95;
        }

        $('#message .loadBar').css("width", (percentage * 100.00) + "%");
    },

    addToSortedList: function (listID, elt) {
        var name = elt;
        if (name != '') {
            var toinsert = true;
            $("#" + listID + " > li").each(function () {
                var item = $(this).html();
                if (name.toUpperCase() < item.toUpperCase()) {
                    if (toinsert) {
                        $(this).before('<li>' + name + '</li>');
                        toinsert = false;
                    }
                }
            });
            if (toinsert) {
                $("#" + listID).append('<li>' + name + '</li>');
            }
        }
    },

    grabVideoId: function () {
        //https://www.youtube.com/watch?v=zPQZ8psBwO4
        var url = $("#input_video").val();
        var i = -1;
        var res;
        if ((i = url.indexOf("v=")) > -1) {
            // looks promising
            var nextParamIndex = url.indexOf("&");
            if (nextParamIndex > -1) {
                res = url.substring(i + 2, nextParamIndex);
            } else {
                res = url.substring(i + 2, url.length);
            }
        }
        return res;
    },

    getRandomColor: function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    configureTooltipForPage: function (page) {
        $(document).on("click", ".tooltip", function () {
            var name = $(this).attr("name");
            $(this).tooltip(
                {
                    items: ".tooltip",
                    content: function () {
                        return TOOL_TIPS[page][name];
                    },
                    close: function (event, ui) {
                        var me = this;
                        ui.tooltip.hover(
                            function () {
                                $(this).stop(true).fadeTo(400, 1);
                            },
                            function () {
                                $(this).fadeOut("400", function () {
                                    $(this).remove();
                                });
                            }
                        );
                        ui.tooltip.on("remove", function () {
                            $(me).tooltip("destroy");
                        });
                    },
                }
            );
            $(this).tooltip("open");
        });
    }
}