/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Index (home) page
 */


// Constants
const GOOD = 0;
const BAD = 1;
const OKAY = 2
const PLAYLIST_TITLE = "World's Best Clip of the Week"

// Variables
var ConfiguredTermArray;
var ConfiguredColorArray;
var startTime, endTime;
var loaded = false;
var termStats;
var commentHTML = $("<div></div>");
var overallCount = 0;
var fetchID = 0;
var voters = new Array();


window.onerror = function (msg, url, line, col, error) {
    // Note that col & error are new to the HTML 5 spec and may not be 
    // supported in every browser.  It worked for me in Chrome.
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;

    // You can view the information in an alert to see things working like this:
    console.log("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
    displayMessage("An error occured on the page. Please try a hard refresh (CTRL + F5). If you experience any further issues please contact me for support (link in footer).", BAD);
    fetchID++; // stop all events

    // TODO: Report this error via ajax so you can keep track
    //       of what pages have JS issues

    var suppressErrorAlert = true;
    // If you return true, then error alerts (like in older versions of 
    // Internet Explorer) will be suppressed.
    return suppressErrorAlert;
};

$(document).ready(function () {
    // tool-tips
    $(document).on("click", ".tooltip", function () {
        var name = $(this).attr("name");
        $(this).tooltip(
            {
                items: ".tooltip",
                content: function () {
                    return TOOL_TIPS['quick'][name];//$(this).data('description');
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


    // executes when HTML-Document is loaded and DOM is ready
    $("#fetch").click(fetchResults);
    loadTermsAndColors(urlParams['username']);
    $("#collapse").click(function () {
        if ($(this).hasClass("expanded")) {
            $("#userSpace").slideUp("slow", function () {
                $("#userSpace").fadeOut(500);
                $("#collapse").removeClass("expanded");
                $("#collapse").addClass("collapsed");
            });
        } else {
            $("#userSpace").slideDown("slow", function () {
                $("#userSpace").fadeIn(500);
                $("#userSpace .loading").fadeOut(500);
                $("#collapse").removeClass("collapsed");
                $("#collapse").addClass("expanded");
            });
        }
    });

    $("#a_index").prop("href", "index.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_config").prop("href", "config.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_comments").prop("href", "comments.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);

    // clean up
    $("#termResults_list").children().filter(":not(.loading)").remove();
    $("input[type='checkbox']").prop('disabled', false);
    $("#stats_group").children().filter(":not(.error, .loading)").remove();
    $("#comments").children().filter(":not(.error)").remove();
    $("#h2_comments").html('0');
    $("#voters").children().filter(":not(.error)").remove();

    // start off hiding errors, will be shown as they crop up
    $(".error").fadeOut(500);
    $(".loading").fadeIn(500);
    
    // hide all sections (will show one at a time as it completes
    $("#commentSpace").fadeOut(500);
    $("#results").fadeOut(500);

    //reset
    loaded = false;
    termStats = null;
    commentHTML = $("<div></div>");
    overallCount = 0;
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);
    
});

displayMessage("Authorizing...", OKAY);

google.setOnLoadCallback(function () {
    displayMessage("Authorize - Success", GOOD);
});

function onJSClientLoad() {
    gapi.client.setApiKey('AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE');
    gapi.client.load('plus', 'v1');
    gapi.client.load('youtube', 'v3').then(function () {
        populateBestOfTheWeek();
    });
}


////////////////////////////////// FUNCTIONS ////////////////////////////////

function loadTermsAndColors(user) {
    // get terms and colors
    $("#fetch").prop("disabled", true);
    $("#fetch").prop("title", "Please wait for terms to be loaded");
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
            if (resp.hasOwnProperty("status")) {
                // error?
                console.log("Error: " + resp.status);
                $("#list_starting_terms .loading").fadeOut(500);
                $("#list_starting_terms .error").fadeIn(500);
                displayMessage("Unable to load terms for user "+user+".", BAD);
            } else {
                ConfiguredColorArray = new Array();
                ConfiguredTermArray = new Array();
                var rows = resp.split("<br/>");
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
                        ConfiguredTermArray.push(cols[0].replace(/&nbsp;/g, ' '));
                        var list = $("<li class=" + cols[0].replace(/[^\w]/gi, '') + "></li>");
                        list.text(cols[0].replace(/&nbsp;/g, ' '));
                    } else {
                        var list = $("<li class='disabled'></li>");
                        list.text("(disabled): " + cols[0].replace(/&nbsp;/g, ' '));
                    }

                    $("#list_starting_terms .loading").fadeOut(500);
                    $("#list_starting_terms").append(list);
                    $("#fetch").prop("disabled", false);
                    $("#fetch").prop("title", "");
                }
            }
        },
        error: function (x, t, m) {
            console.log("Error: " + t);
            $("#list_starting_terms .loading").fadeOut(500);
            $("#list_starting_terms .error").fadeIn(500);
            displayMessage("Unable to load terms for user " + user + ".", BAD);
        },
    });
}

function executeAsync(func) {
    setTimeout(func, 0);
}

function populateBestOfTheWeek() {
    var select = $("#select_bestOfTheWeek");

    var request = gapi.client.youtube.channels.list({
        forUsername: 'StoneMountain64',
        part: 'id'
    });
    request.execute(function (response) {
        channelID = response.result.items[0].id;
        requestVideoPlaylist(channelID);

    }, function (reason) {
        console.log("Error" + reason);
        $("#select_bestOfTheWeek .loading").fadeOut(500);
        $("#select_bestOfTheWeek .error").fadeIn(500);
    });
}


// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(channelID, pageToken) {
    var requestOptions = {
        channelId: channelID,
        part: 'snippet',
        maxResults: 20
    };
    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }
    var request = gapi.client.youtube.playlists.list(requestOptions);
    request.execute(function (response) {
        // Only show pagination buttons if there is a pagination token for the
        // next or previous page of results.
        nextPageToken = response.result.nextPageToken;
        var playlistItems = response.result.items;
        if (playlistItems) {
            $.each(playlistItems, function (index, item) {
                var title = item.snippet.title;
                var id = item.id;
                if (title == PLAYLIST_TITLE) {
                    requestVideosInPlaylist(id);
                    return;
                }
            });
        }
        if (nextPageToken)
            requestVideoPlaylist(channelID, nextPageToken);

    }, function (reason) {
        console.log("Error " + reason);
        $("#select_bestOfTheWeek .loading").fadeOut(500);
        $("#select_bestOfTheWeek .error").fadeIn(500);
    });
}


// Retrieve the list of videos in the specified playlist.
function requestVideosInPlaylist(playlistId, pageToken) {
    var requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 20
    };
    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }
    var request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(function (response) {
        if (response.hasOwnProperty("code") && response.code != 200) {
            console.log("Error " + reason);
            $("#select_bestOfTheWeek .loading").fadeOut(500);
            $("#select_bestOfTheWeek .error").fadeIn(500);
            return;
        }

        nextPageToken = response.result.nextPageToken;

        var playlistItems = response.result.items;
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
                $("#select_bestOfTheWeek .loading").fadeOut(500);
                $("#select_bestOfTheWeek").append(content);
            });
        }

        if (nextPageToken)
            requestVideosInPlaylist(playlistId, nextPageToken);
    }, function (reason) {
        console.log("Error " + reason);
        $("#select_bestOfTheWeek .loading").fadeOut(500);
        $("#select_bestOfTheWeek .error").fadeIn(500);
        return;
    });
}

function addUrlToInput(url, elt) {
    if ($(elt).hasClass("selected")) {
        $(elt).removeClass("selected");
        $("#input_video").val("");
        return true;
    }

    $("#select_bestOfTheWeek .selected").removeClass("selected");
    $(elt).addClass("selected");

    $("#input_video").val(url);
}

function toggleComments(cb, manual) {

    if (manual) {
        $("#checkbox_voters").prop('checked', false);
        toggleVoters($("#checkbox_voters"), false);
    }

    if (cb.prop('checked')) {
        $("#comments").append(commentHTML);
        $("#comments").fadeIn(500);
        $(".commentBody").hover(function () {
            // in
            $(this).find("span.highlight").css("font-size", "24pt");
        }, function () {
            // out
            $(this).find("span.highlight").css("font-size", "12pt");
        });
    } else {
        $("#comments").fadeOut(500);
        $("#comments").empty();
    }
}

function toggleVoters(cb, manual) {

    if (manual) {
        $("#checkbox_comments").prop('checked', false);
        toggleComments($("#checkbox_comments"), false);
    }

    if (cb.prop('checked')) {
        $("#voters").fadeIn(500);
    } else {
        $("#voters").fadeOut(500);
    }
}

// Helper method to display a message on the page.
function displayMessage(message, good) {
    $('#message').text(message);

    if (good == GOOD) {
        $('#message').attr("class", "good");
        $('#message').fadeOut(500);
    } else if (good == BAD) {
        $('#message').attr("class", "bad");
        $('#message').fadeIn(500);
    } else {
        $('#message').attr("class", "okay");
        $('#message').fadeIn(500);
    }
}

function fetchResults() {
    // clean up
    $("#termResults_list").children().filter(":not(.loading)").remove();
    $("input[type='checkbox']").prop('disabled', false);
    $("#stats_group").children().filter(":not(.error, .loading)").remove();
    $("#comments").children().filter(":not(.error)").remove();
    $("#h2_comments").html('0');
    $("#voters").children().filter(":not(.error)").remove();

    // start off hiding errors, will be shown as they crop up
    $(".error").fadeOut(500);

    // starting off showing all loading images, will hide as they load
    $(".loading").fadeIn(500);
    
    // hide all sections (will show one at a time as it completes
    $("#commentSpace").fadeOut(500);
    $("#results").fadeOut(500);

    //reset
    loaded = false;
    termStats = null;
    commentHTML = $("<div></div>");
    overallCount = 0;
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);

    // Start
    $("#collapse").click();

    if (!ConfiguredColorArray || !ConfiguredTermArray) {
        // TODO: load a default set of terms
        displayMessage("Unable to load terms for user " + urlParams['username'] + ".", BAD);
        return false;
    }

    $("#results").slideDown("slow");

    fetchID++;
    startTime = new Date().getTime();

    displayMessage('Processing query...please wait', OKAY);
    var id = grabVideoId();
    executeAsync(function () { getVideoStats(id, fetchID) });
}

function getVideoStats(id, currFetchID) {
    if (currFetchID != fetchID)
        return;

    $("#statsSpace").slideDown( "slow");

    if (!id) {
        // no results
        $("#statsSpace .loading").fadeOut(500);
        $("#statsSpace .error").fadeIn(500);
        displayMessage("No results found for video with ID='" + id + "'.", OKAY);
        return;
    }


    var title, description, thumbUrl, thumbW, thumbH, viewCount, likeCount, dislikeCount, favoriteCount, commentCount;

    // See https://developers.google.com/youtube/v3/docs/videos/list
    var request = gapi.client.youtube.videos.list({
        part: 'statistics, snippet',
        id: id
    });
    request.execute(function (response) {
        if (response.pageInfo.totalResults > 0) {
            // snippet
            title = response.result.items[0].snippet.title;
            description = response.result.items[0].snippet.description;
            thumbUrl = response.result.items[0].snippet.thumbnails.high.url;
            thumbW = response.result.items[0].snippet.thumbnails.high.width;
            thumbH = response.result.items[0].snippet.thumbnails.high.height;


            // stats
            viewCount = response.result.items[0].statistics.viewCount;
            likeCount = response.result.items[0].statistics.likeCount;
            dislikeCount = response.result.items[0].statistics.dislikeCount;
            favoriteCount = response.result.items[0].statistics.favoriteCount;
            commentCount = response.result.items[0].statistics.commentCount;

            // construct html
            var image = $("<img id='img_thumb' src='" + thumbUrl + "' alt='" + title + "'>");

            title = $("<h3><a href='https://www.youtube.com/watch?v=" + id + "'>" + title + "</a></h3>");
            description = $("<h3 class='hidden'>" + description + "</h3>");

            viewCount = $("<p>Views: " + viewCount + "</p>");
            likeCount = $("<p>Likes: " + likeCount + "</p>");
            dislikeCount = $("<p>Dislikes: " + dislikeCount + "</p>");
            favoriteCount = $("<p>Favorites: " + favoriteCount + "</p>");
            commentCount = $("<p>Comments: " + commentCount + "</p>");
            var videoStats = $("<div id='div_video_stats'></div>");
            videoStats.append(viewCount).append(likeCount).append(dislikeCount).append(favoriteCount).append(commentCount);

            // add to DOM
            $("#stats > .error").fadeOut(500);
            $("#stats_group").append(title).append(description).append(image)
            $("#stats_group").append(videoStats);
            $("#stats_group .loading").fadeOut(500);
            executeAsync(function () { loadComments(1, "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE&videoId=" + id + "&maxResults=" + 20, currFetchID) });

        } else {
            // no results
            $("#statsSpace .loading").fadeOut(500);
            $("#statsSpace .error").fadeIn(500);
            displayMessage("No results found for video with ID='" + id + "'.", OKAY);
            return;
        }
    }, function (reason) {
        //$("#statsSpace .loading").fadeOut(500);
        //$("#statsSpace .error").fadeIn(500);
        // displayMessage('Error loading stats: ' + reason.result.error.message, BAD);
        console.log('Error loading stats: ' + reason.result.error.message);
        getVideoStats(id, currFetchID)
    });
}

function loadComments(count, url, currFetchID) {
    if (currFetchID != fetchID)
        return;

    $("#commentSpace").slideDown("slow");

    $.ajax({
        url: url,
        dataType: "jsonp",
        timeout: 5000,
        error: function(jqXHR, textStatus, errorThrown) {
            if (currFetchID != fetchID)
                return;

            console.log('Error retrieving comments');
            console.log(errorThrown);
            console.log(jqXHR);
            // try again
            loadComments(count, url, currFetchID);
        },
        success: function (data) {
            if (currFetchID != fetchID)
                return;

            $("#commentSpace > .loading").fadeOut(500);

            if (data["error"]) {
                console.log('Error loading comments');
                console.log(data.error.code);
                console.log(data.error.message);
                $("#commentSpace > .error").fadeIn(500);
                return;
            }

  
            nextUrl = "";
            if (data["nextPageToken"] && data["nextPageToken"].length > 0) {
                nextUrl = url;
                if (nextUrl.indexOf("pageToken") > 0) {
                    nextUrl = nextUrl.replace(/pageToken=.*$/, "pageToken=" + data["nextPageToken"]);
                } else {
                    nextUrl += "&pageToken=" + data["nextPageToken"];
                }
            }

            if (nextUrl != "")
                executeAsync(function () { loadComments(count + data.pageInfo.resultsPerPage, nextUrl, currFetchID) });

            $.each(data["items"], function (key, val) {
                var comment = $("<li class='comment'></li>");
                var body = $("<div class='commentBody'></div>");

                var author = $("<h2 class='author'></h2>");
                var authorName = val.snippet.topLevelComment.snippet.authorDisplayName;
                author.html(authorName);

                var googleID = val.snippet.topLevelComment.snippet.authorGoogleplusProfileUrl;
                var replyCt = val.snippet.totalReplyCount;
                var commentID = val.id;

                var content = $("<div class='content'></div>");
                content.html(parseComment(val.snippet.topLevelComment.snippet.textDisplay, currFetchID, authorName));

                // find replies
                if (replyCt > 0) {
                    appendComments(comment, commentID, 1, "", currFetchID);
                }

                body.append(author).append(content);
                body.hover(function () {
                    // in
                    $(this).find("span.highlight").css("font-size", "24pt");
                }, function () {
                    // out
                    $(this).find("span.highlight").css("font-size", "12pt");
                });

                comment.append(body);
                $("#comments > .error").fadeOut(500);
                commentHTML.append(comment);
                $("#h2_comments").html(count);
                count++;

            });

            if (!nextUrl) {
                displayMessage('Completed query.', GOOD);
                endTime = new Date().getTime();
                var time = (endTime - startTime) / 1000.00;
                console.log('Execution time: ' + time + " seconds");


                if ($("#termResults_list .loading").is(":visible")) {
                    $("#termResults_list .loading").fadeOut(500);
                    $("#termResults_list .error").fadeIn(500);
                }
            }
        }
    });
}

function appendComments(commentParent, id, count, pageToken, currFetchID) {
    if (currFetchID != fetchID)
        return;

    if (pageToken == "")
        url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&key=AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE&parentId=" + id;
    else
        url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&key=AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE&parentId=" + id + "&pageToken=" + pageToken;

    $.ajax({
        url: url,
        dataType: "jsonp",
        error: function (jqXHR, textStatus, errorThrown) {
            if (currFetchID != fetchID)
                return;

            console.log('Error loading replies: ' + reason.result.error.message);
            console.log(errorThrown);
            console.log(jqXHR);
            appendComments(commentParent, id, count, pageToken, currFetchID);
        },
        success: function (data) {
            if (currFetchID != fetchID)
                return;

            if (data["error"]) {
                console.log('Error loading comments');
                console.log(data.error.code);
                console.log(data.error.message);
                return;
            }

            var nextPageToken = "";

            if (data["nextPageToken"]) {
                nextPageToken = data["nextPageToken"];
                executeAsync(function () { appendComments(commentParent, id, count + data.pageInfo.resultsPerPage, nextPageToken, currFetchID) });
            }

            $.each(data["items"], function (key, val) {
                var comment = $("<li class='comment'></li>");
                var body = $("<div class='commentBody'></div>");

                var author = $("<h2 class='author'></h2>");
                var authorName = val.snippet.authorDisplayName;
                author.html(authorName);

                var content = $("<div class='content'></div>");
                content.html(parseComment(val.snippet.textDisplay, currFetchID, authorName));

                body.append(author).append(content);
                body.hover(function () {
                    // in
                    $(this).find("span.highlight").css("font-size", "24pt");
                }, function () {
                    // out
                    $(this).find("span.highlight").css("font-size", "12pt");
                });

                comment.append(body);
                commentParent.append(comment);
                count++;
            });
        }
    });
}

function parseComment(comment, currFetchID, author) {
    if (currFetchID != fetchID)
        return;

    if (!loaded) {
        termStats = Array(ConfiguredTermArray.length);

        // Add rows
        for (i = 0; i < ConfiguredTermArray.length; i++) {
            // terms
            termStats[i] = 0
        }
        loaded = true;
    }

    var res = comment;
    var index = -1;
    var s, t, v;

    comment = comment.toLowerCase();

    for (i = 0; i < ConfiguredTermArray.length; i++) {
        if ((index = comment.indexOf(ConfiguredTermArray[i].toLowerCase())) > -1) {
            termStats[i]++;

            s = res.substring(0, index);
            t = res.substring(index, index + ConfiguredTermArray[i].length);
            v = res.substring(index + ConfiguredTermArray[i].length, res.length + 1);

            res = s + "<span class='" + ConfiguredTermArray[i] + " highlight'>" + t + "</span>" + v;    
            comment = res.toLowerCase();
            $("#termResults_list ." + ConfiguredTermArray[i]).remove();
            $("#termResults_list").append("<li class='" + ConfiguredTermArray[i] + "'>" + ConfiguredTermArray[i] + ": " + termStats[i] + "</li>");
            $("#termResults_list .loading").fadeOut(500);


            if (voters.indexOf(author) < 0) {
                voters.push(author);
                $("#voters .error").fadeOut(500);
                addToSortedList("voters", author);
            }
        }
    }

    $("#termResults .remove").remove();
    // sort
    var mylist = $('#termResults_list');
    var listitems = mylist.children('li').filter(":not(.loading, .error)").get();
    var numberPattern = /\d+/g;
    listitems.sort(function (a, b) {
        anum = parseInt($(a).text().match(numberPattern)[0]);
        bnum = parseInt($(b).text().match(numberPattern)[0]);

        if (anum != bnum)
            return bnum - anum;
        else
            return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    })
    $.each(listitems, function (idx, itm) { mylist.append(itm); });

    //// add the rest
    $("#termResults_list").append("<li class='remove' style='color: gray'>&nbsp</li>");
    for (i = 0; i < ConfiguredTermArray.length; i++) {
        if (termStats[i] == 0) {
            var li = $("<li class='remove' style='color: gray'></li>");
            li.text(ConfiguredTermArray[i] + ": 0");
            $("#termResults_list").append(li);
        }
    }

    overallCount++;
    return res;
}


function addToSortedList(listID, elt) {
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
}


function grabVideoId() {
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
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}