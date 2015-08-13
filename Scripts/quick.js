/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Index (home) page
 */

// Constants
const TIMER_DELAY = 1500;
const MAX_TIMER_COUNT = 120 / (TIMER_DELAY / 1000);


// Variables
var ConfiguredTermArray;
var ConfiguredColorArray;
var startTime, endTime;
var commentHTML = $("<div></div>");
var overallCount = 0;
var fetchID = 0;
var voters = new Array();
var retryCt = 25;
var lastCount = 0;
var timerCount = 0;


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
    Utility.configureTooltipForPage('quick');

    // get terms and colors
    $("#fetch").prop("disabled", true);
    $("#fetch").prop("title", "Please wait for terms to be loaded");
    $("#fetch").click(fetchResults);


    Utility.loadTermsAndColors(urlParams['username'], function success(ConfiguredColorArray, ConfiguredTermArray, listElt) {
        self.ConfiguredColorArray = ConfiguredColorArray;
        self.ConfiguredTermArray = ConfiguredTermArray;
        $("#list_starting_terms .loading").fadeOut(500, function () {
            listElt.hide();
            $("#list_starting_terms").append(listElt);
            listElt.fadeIn(500, function () {
                $("#fetch").prop("disabled", false);
                $("#fetch").prop("title", "");
            });
        });
    }, function error(resp) {
        $("#list_starting_terms .loading").fadeOut(500, function () {
            $("#list_starting_terms .error").fadeIn(500);
        });
        Utility.displayMessage("Unable to load terms for user " + urlParams['username'] + ".", BAD);
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
                $("#collapse").removeClass("collapsed");
                $("#collapse").addClass("expanded");
            });
        }
    });

    $("#a_index").prop("href", "index.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_config").prop("href", "config.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_comments").prop("href", "comments.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);

    // start off hiding errors, will be shown as they crop up
    $(".error").hide();
    $(".loading").show();
    
    // hide all sections (will show one at a time as it completes
    $("#commentSpace").hide();
    $("#results").hide();

    //reset
    commentHTML = $("<div></div>");
    overallCount = 0;
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);
    retryCt = 25;
    lastCount = 0;
    timerCount = 0;

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

function termsTimeUpdate(currFetchID) {
    if (currFetchID != fetchID || timerCount > MAX_TIMER_COUNT) {
        overallCount = 0;
        lastCount = 0;
        timerCount = 0;
        // TIMEOUT!
        return;
    } else if (lastCount == overallCount) {
        timerCount++;
        // tick
        Utility.delayAfter(function () { termsTimeUpdate(currFetchID) }, TIMER_DELAY);
        return;
    } else {
        lastCount = overallCount;
        timerCount = 0;
        // UPDATE!
        updateTerms();
        Utility.delayAfter(function () { termsTimeUpdate(currFetchID) }, TIMER_DELAY);
    }
}

function updateTerms() {
    // sort
    var mylist = ConfiguredTermArray.slice();
    if (mylist && mylist.length > 1) {
        mylist.sort(function (a, b) {
            anum = a[1]
            bnum = b[1]

            if (anum != bnum)
                return bnum - anum;
            else
                return a[0].toUpperCase().localeCompare(b[0].toUpperCase());
        })

        $("#termResults_list .loading").fadeOut(1000);
        $("#termResults_list").find("li").filter(":not(.loading, .error)").remove();

        $.each(mylist, function (idx, itm) {
            if (itm[1] > 0) {
                $("#termResults_list").append("<li class='" + itm[0] + "'>" + itm[0] + ": " + itm[1] + "</li>");
            }
        });

        $("#termResults_list").append("<li class='remove'>&nbsp;</li>");

        $.each(mylist, function (idx, itm) {
            if (itm[1] == 0) {
                $("#termResults_list").append("<li class='remove'>" + itm[0] + ": " + itm[1] + "</li>");
            }
        });
    }
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
        $("#comments").show("slide", { direction: "left" }, 500);
        $(".commentBody").hover(function () {
            // in
            $(this).find("span.highlight").css("font-size", "24pt");
        }, function () {
            // out
            $(this).find("span.highlight").css("font-size", "12pt");
        });
    } else {
        $("input[type='checkbox']").prop('disabled', true);
        $("#comments").hide("slide", { direction: "left" }, 500, function () {
            $("#comments").find("*").filter(":not(.error, .loading)").remove();
            $("input[type='checkbox']").prop('disabled', false);
        });
    }
}

function toggleVoters(cb, manual) {

    if (manual) {
        $("#checkbox_comments").prop('checked', false);
        toggleComments($("#checkbox_comments"), false);
    }

    if (cb.prop('checked')) {
        $("#voters").show("slide", { direction: "left" }, 500);
    } else {
        $("#voters").hide("slide", { direction: "left" }, 500);
    }
}

function fetchResults() {
    // clean up
    $("#termResults_list").find("*").filter(":not(.loading, .error, .svgContainer)").remove();
    $("input[type='checkbox']").prop('disabled', false);
    $("#stats_group").find("*").filter(":not(.error, #columnchart, .loading, .svgContainer)").remove();
    $("#columnchart").find("*").filter(":not(.error, .loading, .svgContainer)").remove();
    $("#comments").find("*").filter(":not(.error, .svgContainer)").remove();
    $("#voters").find("*").filter(":not(.error, .svgContainer)").remove();
    $("#h2_comments").html('0');
    $("#stats_group").css("background-image", "url()");

    // start off hiding errors, will be shown as they crop up
    $(".error").filter(":not(#userSpace .error)").hide();

    // starting off showing all loading images, will hide as they load
    $(".loading").filter(":not(#userSpace .loading)").show();

    // hide all sections (will show one at a time as it completes
    $("#commentSpace").slideUp(500);
    $("#termSpace").slideUp(500);
    $("#statSpace").slideUp(500);

    //reset
    commentHTML = $("<div></div>");
    overallCount = 0;
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);
    retryCt = 25;
    lastCount = 0;
    timerCount = 0;

    // Start
    $("#collapse").click();

    if (!ConfiguredColorArray || !ConfiguredTermArray) {
        // TODO: load a default set of terms
        Utility.displayMessage("Unable to load terms for user " + urlParams['username'] + ".", BAD);
        return false;
    }

    $("#results").slideDown(500, function () {
        // Animation complete.
    });

    fetchID++;
    startTime = new Date().getTime();

    Utility.displayMessage('Processing query...please wait', OKAY);
    var id = Utility.grabVideoId();
    Utility.delayAfter(function () { getVideoStats(id, fetchID); }, 1000);
    Utility.delayAfter(function () { termsTimeUpdate(fetchID); }, 1000);
}

function getVideoStats(id, currFetchID) {
    if (currFetchID != fetchID)
        return;

    $("#statsSpace").slideDown("slow", function () {
        // Animation complete.
    });


    if (!id) {
        // no results
        Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
        $("#statsSpace .loading").fadeOut(1000);
        $("#stats_group").hide();
        $("#termResults").hide();
        $("#statsSpace .error").fadeIn(1000);
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
            Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
            $("#statsSpace .loading").fadeOut(1000);
            $("#stats_group").hide();
            $("#termResults").hide();
            $("#statsSpace .error").fadeIn(1000);
            return;
        }
       }, function error(x, t, m) {
           $("#statsSpace .loading").fadeOut(1000);
           $("#stats_group").hide();
           $("#termResults").hide();
           $("#statsSpace .error").fadeIn(1000);
           Utility.displayMessage('Error loading stats: ' + x.status + ". " + m, BAD);
       });
}

function loadComments(count, url, currFetchID) {
    if (currFetchID != fetchID)
        return;

    if (!$("#commentSpace").is(":visible")) {
        $("#commentSpace").slideDown(500, function () {
            // Animation complete.
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
                var comment = $("<li class='comment'></li>");
                var body = $("<div class='commentBody'></div>");

                var author = $("<h2 class='author'></h2>");
                var authorName = val.snippet.topLevelComment.snippet.authorDisplayName;
                author.html(authorName);

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

                $("#comments > .error").fadeOut(500);

                comment.append(body);
                commentHTML.append(comment);
                $("#h2_comments").html(count);
                count++;

            });

            if (!nextUrl) {
                // get google+ comments if any exist
                Utility.getGooglePlusComments(function (comment, author) {
                    var commentElt = $("<li class='comment googlePlus'></li>");
                    var body = $("<div class='commentBody'></div>");
                    var authorElt = $("<h2 class='author'>" + author + "</h2>");
                    var userData = $("<div class='commentData'></div>");
                    userData.html("<p>Retrieved from Google+</p>");

                    var content = $("<div class='content'>" + parseComment(comment, currFetchID, author) + "</div>");
                    body.append(authorElt).append(content).append(userData);
                    body.hover(function () {
                        // in
                        $(this).find("span.highlight").css("font-size", "24pt");
                    }, function () {
                        // out
                        $(this).find("span.highlight").css("font-size", "12pt");
                    });


                    if (author == "StoneMountain64") {
                        commentElt.prop("id", "googlePlusMasterComment");
                        commentElt.append(body);
                        commentHTML.prepend(commentElt);

                    } else {
                        commentElt.append(body);
                        commentHTML.find("#googlePlusMasterComment").append(commentElt);
                    }
                    $("#h2_comments").html(count);
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
          }, function error(x,t,m) {
              if (currFetchID != fetchID)
                  return;

              console.log('Error retrieving comments');

              retryCt--;
              if (retryCt > 0) {
                  Utility.delayAfter(function () { loadComments(count, url, currFetchID) }, 500);
              } else {
                  // give up
                  $("#termSpace .loading, #commentSpace .loading, #commentSpace .error, #termResults .loading").fadeOut(1000);
                  $("#termSpace .error, #commentSpace > .error, #termResults .error").fadeIn(1000, function () {
                      $("#h2_comments").html('Error');
                      $("#termResults_list").find(":not(.error, .loading)").remove();
                  });
                  $("input[type='checkbox']").prop('checked', false);
                  $("input[type='checkbox']").prop('disabled', true);
                  fetchID++;
                  Utility.displayMessage('Error loading comments: ' + x.status + ". " + m, BAD);
              }
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
                return

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

             console.log('Error loading comment replies.');
             retryCt--;
             if (retryCt > 0) {
                 loadCommentReplies(commentParent, id, count, pageToken, currFetchID);
             } else {
                 // give up
                 $("#termSpace .loading, #commentSpace .loading, #commentSpace .error, #termResults .loading").fadeOut(1000);
                 $("#termSpace .error, #commentSpace > .error, #termResults .error").fadeIn(1000, function () {
                     $("#h2_comments").html('Error');
                     $("#termResults_list").find(":not(.error, .loading)").remove();
                 });
                 $("input[type='checkbox']").prop('checked', false);
                 $("input[type='checkbox']").prop('disabled', true);
                 fetchID++;
                 Utility.displayMessage('Error loading comments: ' + x.status + ". " + m, BAD);
             }
             
        });
}

function parseComment(comment, currFetchID, author) {
    if (currFetchID != fetchID)
        return;

    var res = comment;
    var index = -1;
    var s, t, v;

    comment = comment.toLowerCase();

    for (i = 0; i < ConfiguredTermArray.length; i++) {
        key = ConfiguredTermArray[i][0];

        if ((index = comment.indexOf(key.toLowerCase())) > -1) {
            ConfiguredTermArray[i][1]++;

            s = res.substring(0, index);
            t = res.substring(index, index + key.length);
            v = res.substring(index + key.length, res.length + 1);

            res = s + "<span class='" + key + " highlight'>" + t + "</span>" + v;
            comment = res.toLowerCase();

            if (voters.indexOf(author) < 0) {
                voters.push(author);
                $("#voters .error").fadeOut(500);
                Utility.addToSortedList("voters", author);
            }
        }
    }

    overallCount++;
    return res;
}