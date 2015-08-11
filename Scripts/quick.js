/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Index (home) page
 */

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
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;
    console.log("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
    displayMessage("An error occured on the page. Please try releoading the page. If you experience any further issues you can contact me for support.", BAD);
    fetchID++;
    var suppressErrorAlert = true;
    return suppressErrorAlert;
};

$(document).ready(function () {
    // tool-tips
    Utility.configureTooltipForPage('quick');


    // executes when HTML-Document is loaded and DOM is ready
    $("#fetch").click(fetchResults);

    // get terms and colors
    $("#fetch").prop("disabled", true);
    $("#fetch").prop("title", "Please wait for terms to be loaded");
    Utility.loadTermsAndColors(urlParams['username'], $("#list_starting_terms"), function success(ConfiguredColorArray, ConfiguredTermArray) {
        self.ConfiguredColorArray = ConfiguredColorArray;
        self.ConfiguredTermArray = ConfiguredTermArray;
        $("#list_starting_terms .loading").fadeOut(500);
        $("#fetch").prop("disabled", false);
        $("#fetch").prop("title", "");
    }, function error(resp) {
        $("#list_starting_terms .loading").fadeOut(500);
        $("#list_starting_terms .error").fadeIn(500);
        Utility.displayMessage("Unable to load terms for user " + user + ".", BAD);
    });

    // bind actions
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

    //  populate list
    Utility.populateBestOfTheWeek($("#select_bestOfTheWeek"),
    function success(videoHistoryStats) {
        $("#select_bestOfTheWeek .loading").fadeOut(500);
    },
    function error(x, t, m) {
        $("#select_bestOfTheWeek").children().filter(":not(.error, .loading)").remove();
        $("#select_bestOfTheWeek .loading").fadeOut(500);
        $("#select_bestOfTheWeek .error").fadeIn(500);
    });
});


////////////////////////////////// FUNCTIONS ////////////////////////////////

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

function fetchResults() {
    // clean up
    $("#termResults_list").children().filter(":not(.loading)").remove();
    $("input[type='checkbox']").prop('disabled', false);
    $("#stats_group").children().filter(":not(.error, .loading)").remove();
    $("#comments").children().filter(":not(.error)").remove();
    $("#h2_comments").html('0');
    $("#voters").children().filter(":not(.error)").remove();

    // start off hiding errors, will be shown as they crop up
    $(".error :not(#userSpace .error)").fadeOut(500);

    // starting off showing all loading images, will hide as they load
    $(".loading :not(#userSpace .loading)").fadeIn(500);
    
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
        Utility.displayMessage("Unable to load terms for user " + urlParams['username'] + ".", BAD);
        return false;
    }

    $("#results").slideDown("slow");

    fetchID++;
    startTime = new Date().getTime();

    Utility.displayMessage('Processing query...please wait', OKAY);
    var id = Utility.grabVideoId();
    Utility.delayAfter(function () { getVideoStats(id, fetchID); }, 500);
}

function getVideoStats(id, currFetchID) {
    if (currFetchID != fetchID)
        return;

    $("#statsSpace").slideDown( "slow");

    if (!id) {
        // no results
        $("#statsSpace .loading").fadeOut(500);
        $("#statsSpace .error").fadeIn(500);
        Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
        return;
    }


    var title, description, thumbUrl, thumbW, thumbH, viewCount, likeCount, dislikeCount, favoriteCount, commentCount;

    var url = "https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=" + id + "&maxResults=1"

    Utility.makeAsyncYouTubeAjaxRequest(url, null,
       function success(response) {
        if (response.pageInfo.totalResults > 0) {
            // snippet
            title = response.items[0].snippet.title;
            description = response.items[0].snippet.description;
            thumbUrl = response.items[0].snippet.thumbnails.high.url;
            thumbW = response.items[0].snippet.thumbnails.high.width;
            thumbH = response.items[0].snippet.thumbnails.high.height;


            // stats
            viewCount = response.items[0].statistics.viewCount;
            likeCount = response.items[0].statistics.likeCount;
            dislikeCount = response.items[0].statistics.dislikeCount;
            favoriteCount = response.items[0].statistics.favoriteCount;
            commentCount = response.items[0].statistics.commentCount;

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
            Utility.delayAfter(function () { loadComments(1, "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=" + id + "&maxResults=" + 20, currFetchID) });

        } else {
            // no results
            $("#statsSpace .loading").fadeOut(500);
            $("#statsSpace .error").fadeIn(500);
            Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
            return;
        }
    }, function error(x,t,m) {
        console.log('Error loading stats');
        getVideoStats(id, currFetchID)
    });
}

function loadComments(count, url, currFetchID) {
    if (currFetchID != fetchID)
        return;

    $("#commentSpace").slideDown("slow");

    Utility.makeAsyncYouTubeAjaxRequest(url, null, 
          function success(data) {
            if (currFetchID != fetchID)
                return;

            $("#commentSpace > .loading").fadeOut(500);
  
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
                Utility.delayAfter(function () { loadComments(count + data.pageInfo.resultsPerPage, nextUrl, currFetchID) });

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
                    loadCommentReplies(comment, commentID, 1, "", currFetchID);
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
                Utility.displayMessage('Completed query.', GOOD);
                endTime = new Date().getTime();
                var time = (endTime - startTime) / 1000.00;
                console.log('Execution time: ' + time + " seconds");


                if ($("#termResults_list .loading").is(":visible")) {
                    $("#termResults_list .loading").fadeOut(500);
                    $("#termResults_list .error").fadeIn(500);
                }
            }
          }, function error(x,t,m) {
              if (currFetchID != fetchID)
                  return;

              console.log('Error retrieving comments');
              // try again
              loadComments(count, url, currFetchID);
          });
}

function loadCommentReplies(commentParent, id, count, pageToken, currFetchID) {
    if (currFetchID != fetchID)
        return;

    if (pageToken == "")
        url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&id=" + id;
    else
        url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&id=" + id + "&pageToken=" + pageToken;

    Utility.makeAsyncYouTubeAjaxRequest(url, null, 
         function success(data) {
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
                Utility.delayAfter(function () { loadCommentReplies(commentParent, id, count + data.pageInfo.resultsPerPage, nextPageToken, currFetchID) });
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
         }, function error(x, t, m) {
             if (currFetchID != fetchID)
                 return;

             console.log('Error loading replies.');
             loadCommentReplies(commentParent, id, count, pageToken, currFetchID);
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
                Utility.addToSortedList("voters", author);
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