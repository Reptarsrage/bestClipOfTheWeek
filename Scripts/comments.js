/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Index (home) page
 */

// Variables
var startTime, endTime;
var overallCount = 0;
var fetchID = 0;
var voters = new Array();
var retryCt = 25;
var voteCount = 0;


window.onerror = function (msg, url, line, col, error) {
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;
    console.log("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
    Utility.displayMessage("An error occured on the page. Please try releoading the page. If you experience any further issues you can contact me for support.", BAD);
    fetchID++;
    var suppressErrorAlert = true;
    return suppressErrorAlert;
};

$(document).ready(function () {
    // tool-tips
    Utility.configureTooltipForPage('comments');


    // executes when HTML-Document is loaded and DOM is ready
    $("#fetch").click(fetchResults);
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
                $("#collapse").removeClass("collapsed");
                $("#collapse").addClass("expanded");
            });
        }
    });

    $("#a_index").prop("href", "index.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_config").prop("href", "config.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_quick").prop("href", "quick.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);

    // start off hiding errors, will be shown as they crop up
    $(".error").hide();
    $(".loading").show();
    $("#voters .error").show();

    // hide all sections (will show one at a time as it completes
    $("#results").hide();
    $("#commentSpace").hide();

    //reset
    overallCount = 0;
    voters = new Array();
    toggleVoters($("#checkbox_voters"));
    retryCt = 25;
    voteCount = 0;

    //  populate list
    Utility.populateBestOfTheWeek(
    function success(videoHistoryStats, listElt) {
        self.videoHistoryStats = videoHistoryStats;
        $("#select_bestOfTheWeek .loading").fadeOut(1000);
        listElt.hide();
        $("#select_bestOfTheWeek").append(listElt);
        listElt.fadeIn(1000);
    },
    function error(x, t, m) {
        $("#select_bestOfTheWeek").find(":not(.error, .loading)").remove();
        $("#select_bestOfTheWeek .loading").fadeOut(1000);
        $("#select_bestOfTheWeek .error").fadeIn(1000);
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

function toggleVoters(cb) {
    if (cb.prop('checked')) {
        $("#voters").show("slide", { direction: "left" }, 500);
    } else {
        $("#voters").hide("slide", { direction: "left" }, 500);
    }
}

function fetchResults() {
    // clean up
    $("input[type='checkbox']").prop('disabled', false);
    $("#stats_group").find("*").filter(":not(.error, #columnchart, .loading, .svgContainer)").remove();
    $("#voters").find("*").filter(":not(.error, .svgContainer)").remove();
    $("#h2_comments").html('0');
    $("#stats_group").css("background-image", "url()");

    // start off hiding errors, will be shown as they crop up
    $(".error").filter(":not(#userSpace .error)").hide();

    // starting off showing all loading images, will hide as they load
    $(".loading").filter(":not(#userSpace .loading)").show();

    // hide all sections (will show one at a time as it completes
    $("#commentSpace").slideUp(1000);

    //reset
    overallCount = 0;
    voters = new Array();
    toggleVoters($("#checkbox_voters"));
    voteCount = 0;

    // Start
    $("#collapse").click();

    $("#results").slideDown(500);

    fetchID++;
    startTime = new Date().getTime();

    Utility.displayMessage('Processing query...please wait', OKAY);
    var id = Utility.grabVideoId();
    Utility.delayAfter(function () { getVideoStats(id, fetchID); }, 1000);
}

function getVideoStats(id, currFetchID) {
    if (currFetchID != fetchID)
        return;

    if (!id) {
        // no results
        Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
        $("#stats .loading").fadeOut(1000);
        $("#stats_group").hide();
        $("#stats .error").fadeIn(1000);
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
               var image = $("<div id='img_overlay'></div>");

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
               $("#stats_group .loading").fadeOut(1000);
               image.append(title);
               image.append(videoStats);
               image.hide();
               $("#stats_group").append(image);
               $("#stats_group").css('background-image', "url(" + thumbUrl + ")");
               image.fadeIn(1000);

               Utility.delayAfter(function () { loadComments(1, "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=" + id + "&maxResults=" + 20, currFetchID) });
           } else {
               // no results
               $("#stats .loading").fadeOut(1000);
               $("#stats_group").hide();
               $("#stats .error").fadeIn(1000);
               Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
               return;
           }
       }, function (x, t, m) {
           $("#stats .loading").fadeOut(1000);
           $("#stats_group").hide();
           $("#stats .error").fadeIn(1000);
           fetchID++;
           Utility.displayMessage('Error loading stats', BAD);
       });
}

function loadComments(count, url, currFetchID) {
    if (currFetchID != fetchID)
        return;

    if (!$("#commentSpace").is(":visible")) {
        $("#commentSpace").slideDown(1000, function () {
            $("#commentSpace .error").filter(":not(#commentSpace > .error)").show();
        });
    } 

    Utility.makeAsyncYouTubeAjaxRequest(url, null,
           function success(data) {
               if (currFetchID != fetchID)
                   return;

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
                   var replyCt = val.snippet.totalReplyCount;
                   var commentID = val.id;

                   parseComment(val.snippet.topLevelComment.snippet.textDisplay, currFetchID, val.snippet.topLevelComment.snippet.authorDisplayName);

                   // find replies
                   if (replyCt > 0) {
                       loadCommentReplies(commentID, 1, "", currFetchID);
                   }
                   count++;
               });

               if (!nextUrl) {
                   // get google+ comments if any exist
                   Utility.getGooglePlusComments(function (comment, author) {
                       parseComment(comment, currFetchID, author);
                       count++;
                   }, function (x, t, m) {
                       console.log("Error loading google+ comments." + x + t + m);
                       Utility.displayMessage('Completed query.', GOOD);
                       endTime = new Date().getTime();
                       var time = (endTime - startTime) / 1000.00;
                       console.log('Execution time: ' + time + " seconds");
                   }, function () {
                       Utility.displayMessage('Completed query.', GOOD);
                       endTime = new Date().getTime();
                       var time = (endTime - startTime) / 1000.00;
                       console.log('Execution time: ' + time + " seconds");
                   });
               }
           }, function error(x, t, m) {
               if (currFetchID != fetchID)
                   return;

               Utility.displayMessage('Issue retrieving comments.', BAD);

               // try again
               retryCt--;
               if (retryCt > 0) {
                   loadComments(count, url, currFetchID);
               } else {
                   // give up
                   $(" #commentSpace .error").fadeOut(500);
                   $("#commentSpace > .error").fadeIn(500, function () {
                       $("#h2_comments").html('Error');
                   });
                   $("input[type='checkbox']").prop('checked', false);
                   $("input[type='checkbox']").prop('disabled', true);
                   $("#voters").find(":not(.error)").remove();
                   fetchID++;
                   Utility.displayMessage('Error loading comments: ' + x.status + ". " + m, BAD);
               }
           });
}

function loadCommentReplies(id, count, pageToken, currFetchID) {
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

            var nextPageToken = "";

            if (data["nextPageToken"]) {
                nextPageToken = data["nextPageToken"];
                Utility.delayAfter(function () { loadCommentReplies(commentParent, id, count + data.pageInfo.resultsPerPage, nextPageToken, currFetchID) });
            }

            $.each(data["items"], function (key, val) {
                parseComment(val.snippet.textDisplay, currFetchID, val.snippet.authorDisplayName);
                count++;
            });
        }, function error(x, t, m) {
            if (currFetchID != fetchID)
                return;

            retryCt--;
            if (retryCt > 0) {
                loadCommentReplies(id, count, pageToken, currFetchID);
            } else {
                // give up
                $(" #commentSpace .error").fadeOut(500);
                $("#commentSpace > .error").fadeIn(500, function () {
                    $("#h2_comments").html('Error');
                });
                $("input[type='checkbox']").prop('checked', false);
                $("input[type='checkbox']").prop('disabled', true);
                $("#voters").find(":not(.error)").remove();
                fetchID++;
                Utility.displayMessage('Error loading comments: ' + x.status + ". " + m, BAD);
            }
        });
}

function parseComment(comment, currFetchID, author) {
    if (currFetchID != fetchID)
        return;

    if (voters.indexOf(author) < 0) {
        voters.push(author);
        $("#voters .error").fadeOut(500);
        Utility.addToSortedList("voters", author);
        voteCount++;
        $("#h2_comments").html(voteCount);
    }

    overallCount++;
}