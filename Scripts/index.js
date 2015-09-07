/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Index (home) page
 */

// Constants
const TIMER_DELAY = 2500;
const MAX_TIMER_COUNT = 120 / (TIMER_DELAY / 1000);

// Variables
var ConfiguredTermArray;
var ConfiguredColorArray;
var startTime, endTime;
var loaded = false;
var data = null;
var commentHTML = $("<div></div>");
var overallCount = 0;
var lastCount = 0;
var timerCount = 0;
var gapiPieChart, gapiBarChart, gapiColumnChart;
var gapiPieChart_options, gapiBarChart_options, gapiColumnChart_options;
var gapiPieChart_data, gapiPieChart_data, gapiPieChart_data;
var fetchID = 0;
var voters = new Array();
var videoHistoryStats;
var retryCt = 25;
var totalComments = 0;
var selectedVideoId = "";

window.addEventListener('resize', function (event) {
    // resizing, so redraw charts
    if (gapiPieChart)
        gapiPieChart.draw(gapiPieChart_data, gapiPieChart_options);

    if (gapiBarChart)
        gapiBarChart.draw(gapiBarChart_data, gapiBarChart_options);

    if (gapiColumnChart)
        gapiColumnChart.draw(gapiColumnChart_data, gapiColumnChart_options);
});

window.onerror = function (msg, url, line, col, error) {
    // Note that col & error are new to the HTML 5 spec and may not be 
    // supported in every browser.  It worked for me in Chrome.
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;

    // You can view the information in an alert to see things working like this:
    console.log("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
    Utility.displayMessage("An error occured on the page. Please try a hard refresh (CTRL + F5). If you experience any further issues please contact me for support (link in footer).", BAD);
    fetchID++; // stop all events

    // TODO: Report this error via ajax so you can keep track
    //       of what pages have JS issues

    var suppressErrorAlert = true;
    // If you return true, then error alerts (like in older versions of 
    // Internet Explorer) will be suppressed.
    return suppressErrorAlert;
};

$(document).ready(function () {
    // get terms and colors
    $("#fetch").prop("disabled", true);
    $("#downloadPieChart").prop("disabled", true);
    $("#fetch").prop("title", "Please wait for terms to be loaded");
    $("#fetch").click(fetchResults);

    // tool-tips
    Utility.configureTooltipForPage('index');

    // load user terms
    Utility.loadTermsAndColors(urlParams['username'], function success(ConfiguredColorArray, ConfiguredTermArray, listElt) {
        self.ConfiguredColorArray = ConfiguredColorArray;
        self.ConfiguredTermArray = ConfiguredTermArray;
        $("#list_starting_terms .loading").fadeOut(1000);
        listElt.hide();
        $("#list_starting_terms").append(listElt);
        listElt.fadeIn(1000);
        $("#fetch").prop("disabled", false);
        $("#fetch").prop("title", "");
    }, function error(resp) {
        $("#list_starting_terms .loading").fadeOut(1000);
        $("#list_starting_terms .error").fadeIn(1000);
        Utility.displayMessage("Unable to load terms for user " + urlParams['username'] + ".", BAD);
    });

    // bind actions
    $("#collapse").click(function () {
        if ($(this).hasClass("expanded")) {
            $("#userSpace").slideUp("slow", function () {
                $("#userSpace").fadeOut(1000);
                $("#collapse").removeClass("expanded");
                $("#collapse").addClass("collapsed");
            });
        } else {
            $("#userSpace").slideDown("slow", function () {
                $("#userSpace").fadeIn(1000);
                $("#collapse").removeClass("collapsed");
                $("#collapse").addClass("expanded");
            });
        }
    });

    $("#downloadPieChart").click(function () {
        $("#downloadPieChart").prop("disabled", true);
        var data = gapiPieChart.getImageURI();
        $.ajax({
            url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
            type: "POST",
            timeout: 5000,
            cache: false,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            data: {
                username: urlParams['username'],
                token: urlParams['token'],
                download: data,
                filename: 'piechart.png'
            },
            success: function (resp) {
                if (resp["error"]) {
                    // error?
                    console.log("Error with image response: " + resp.error.message);
                    //alert("Error getting image: " + resp.error.message);
                    return;
                } else {
                    window.location = "https://bestclipoftheweek-1xxoi1ew.rhcloud.com/?file=" + resp;
                    $("#downloadPieChart").prop("disabled", false);
                }
            },
            error: function (x, t, m) {
                console.log("Error getting image: " + t + ': ' + x.status + ". " + x.message + t + m);
                //alert("Error getting image: " + t + ': ' + x.status + ". " + m);
            }
        });
    });

    $("#a_config").prop("href", "config.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" +VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" +VERSION);
    $("#a_quick").prop("href", "quick.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" +VERSION);
    $("#a_comments").prop("href", "comments.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" +VERSION);
    $("#a_thumbnail").prop("href", "thumbnail.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);

        // start off hiding errors, will be shown as they crop up
    $(".error").hide();
    $(".loading").show();

        // hide all sections (will show one at a time as it completes
    $("#commentSpace").hide();
    $("#termSpace").hide();
    $("#results").hide();
    $("#chartSection").hide();
    $("#termResults").hide();

        //reset
    loaded = false;
    commentHTML = $("<div></div>");
    overallCount = 0;
    lastCount = 0;
    timerCount = 0;
    gapiPieChart, gapiBarChart, gapiColumnChart = null;
    data = new google.visualization.DataTable();
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);
    retryCt = 25;
    totalComments = 0;
    selectedVideoId = "";
});

google.load("visualization", "1", {
    packages: ["corechart", 'table', "bar"]
});

google.setOnLoadCallback(function () {
    data = new google.visualization.DataTable();

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


function drawChart(chartType, containerID, dataTable, options) {
    var containerDiv = document.getElementById(containerID);
    var chart = false;
    if (chartType.toUpperCase() == 'BARCHART') {
        if (!gapiBarChart)
            gapiBarChart = new google.visualization.BarChart(containerDiv)

        chart = gapiBarChart;
        gapiBarChart_options = options;
        gapiBarChart_data = dataTable;
    } else if (chartType.toUpperCase() == 'COLUMNCHART') {
        if (!gapiColumnChart)
            gapiColumnChart = new google.charts.Bar(containerDiv);

        chart = gapiColumnChart
        gapiColumnChart_options = options;
        gapiColumnChart_data = dataTable;
    } else if (chartType.toUpperCase() == 'PIECHART') {
        if (!gapiPieChart)
            gapiPieChart = new google.visualization.PieChart(containerDiv)

        chart = gapiPieChart;
        gapiPieChart_options = options;
        gapiPieChart_data = dataTable;
    }

    if (chart == false) {
        return false;
    }

    $("#" + containerID).parent().find(".loading").fadeOut(1000);
    chart.draw(dataTable, options);


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

function chartTimeUpdate(currFetchID) {
    if (currFetchID != fetchID || timerCount > MAX_TIMER_COUNT) {
        overallCount = 0;
        lastCount = 0;
        timerCount = 0;
        // TIMEOUT!
        return;
    } else if (lastCount == overallCount) {
        timerCount++;
        // tick
        Utility.delayAfter(function () { chartTimeUpdate(currFetchID) }, TIMER_DELAY);
        return;
    } else {
        lastCount = overallCount;
        timerCount = 0;
        // UPDATE!
        loadChart();
        Utility.delayAfter(function () { chartTimeUpdate(currFetchID) }, TIMER_DELAY);
    }
}

function toggleComments(cb, manual) {

    if (manual) {
        $("#checkbox_voters").prop('checked', false);
        toggleVoters($("#checkbox_voters"), false);
    }

    if (cb.prop('checked')) {
        $("#comments").append(commentHTML);
        $("#comments").show();
        $(".commentBody").hover(function () {
            // in
            $(this).find("span.highlight").css("font-size", "24pt");
        }, function () {
            // out
            $(this).find("span.highlight").css("font-size", "12pt");
        });
    } else {
        $("#comments").hide();
    }
}

function toggleVoters(cb, manual) {

    if (manual) {
        $("#checkbox_comments").prop('checked', false);
        toggleComments($("#checkbox_comments"), false);
    }

    if (cb.prop('checked')) {
        $("#voters").show();
    } else {
        $("#voters").hide();
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
    $("#downloadPieChart").prop("disabled", true);

    // start off hiding errors, will be shown as they crop up
    $(".error").filter(":not(#userSpace .error)").hide();

    // starting off showing all loading images, will hide as they load
    $(".loading").filter(":not(#userSpace .loading)").show();

    // hide all sections (will show one at a time as it completes
    $("#commentSpace").slideUp(500);
    $("#termSpace").slideUp(500);
    $("#statSpace").slideUp(500);

    //reset
    loaded = false;
    commentHTML = $("<div></div>");
    overallCount = 0;
    lastCount = 0;
    timerCount = 0;
    gapiPieChart, gapiBarChart, gapiColumnChart = null;
    data = new google.visualization.DataTable();
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);
    retryCt = 25;
    totalComments = 0;
    $('#message').attr("class", "");

    // Start
    $("#collapse").click();

    if (!ConfiguredColorArray || !ConfiguredTermArray) {
        Utility.displayMessage("Unable to load terms for user " + urlParams['username'] + ".", BAD);
        return false;
    }

    $("#results").slideDown(500);
    
    fetchID++;
    startTime = new Date().getTime();

    //Utility.displayMessage('Processing query...please wait', OKAY);
    Utility.displayLoading('Processing query...please wait', 0.01);
    var id = Utility.grabVideoId();
    selectedVideoId = id;
    Utility.delayAfter(function () { getVideoStats(id, fetchID); }, 1000);
    Utility.delayAfter(function () { chartTimeUpdate(fetchID); }, 1000);
}

function getVideoStats(id, currFetchID) {
    if (currFetchID != fetchID)
        return;

    $("#statsSpace").slideDown(500, function () {
        // Animation complete.
    });

    if (!id) {
        // no results
        Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
        $("#statsSpace .loading").fadeOut(1000);
        $("#stats_group").hide();
        $("#columnchart").hide();
        $("#statsSpace .error").fadeIn(1000);
        return;
    }


    var title, description, thumbUrl, thumbW, thumbH, viewCount, likeCount, dislikeCount, favoriteCount, commentCount;

    var url = "https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=" + id + "&maxResults=1"

    Utility.makeAsyncYouTubeAjaxRequest(url, null,
       function success(response) {
           if (response.pageInfo.totalResults > 0 && response.items.length > 0) {
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
               totalComments = commentCount;

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

               // draw column chart
               var nonNullData = new google.visualization.DataTable();

               nonNullData.addColumn('string', '');
               nonNullData.addColumn('number', 'Views');
               nonNullData.addColumn('number', 'Comments');
               nonNullData.addColumn('number', 'Likes');

               videoHistoryStats.sort(function (a, b) {
                   var date1 = new Date(a[5]);
                   var date2 = new Date(b[5]);
                   if (date1 > date2)
                       return -1;
                   else if (date1 == date2)
                       return 0;
                   else
                       return 1;
               });


               for (pos = 0; pos < videoHistoryStats.length; pos++) {
                   if (videoHistoryStats[pos][0] == response.items[0].snippet.title)
                       break;
               }
               high = Math.min(pos + 4, videoHistoryStats.length - 1);
               low = Math.max(pos - 4, 0);

               for (i = high; i >= low; i--) {
                   nonNullData.addRows([["BCotW #" + (videoHistoryStats.length - i)
                                       , parseInt(videoHistoryStats[i][1])
                                       , parseInt(videoHistoryStats[i][2])
                                       , parseInt(videoHistoryStats[i][3])]]);
               }

               var options = {
                   backgroundColor: '#ECECEC',
                   animation: {
                       startup: true,
                       easing: 'out',
                       duration: 'slow',
                   },
                   haxis: {
                       slantedText: true,
                   },
                   chart: {
                       title: 'Video Statistics',
                       subtitle: 'With comparison to similar videos',
                   },
                   series: {
                       0: {
                           color: '#3D3D3D',
                           axis: 'views'
                       },
                       1: {
                           color: '#3078DB',
                           axis: 'likes'
                       },
                       2: {
                           color: '#CC4158',
                           axis: 'likes'
                       }
                   },
                   axes: {
                       y: {
                           views: { label: 'Views' }, // Left y-axis.
                           likes: { side: 'right', label: 'Likes / Comments' }, // Right y-axis.
                       },
                   },
                   legend: {
                       position: 'none',
                   },
               };
               drawChart('columnchart', 'columnchartSVGContainer', nonNullData, google.charts.Bar.convertOptions(options));

           } else {
               // no results
               Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
               $("#statsSpace .loading").fadeOut(1000);
               $("#stats_group").hide();
               $("#columnchart").hide();
               $("#statsSpace .error").fadeIn(1000);
               return;
           }
       }, function error(x, t, m) {
           $("#statsSpace .loading").fadeOut(1000);
           $("#stats_group").hide();
           $("#columnchart").hide();
           $("#statsSpace .error").fadeIn(1000);
           fetchID++;
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

             if (nextUrl) {
                 Utility.delayAfter(function () { loadComments(count + data.pageInfo.resultsPerPage, nextUrl, currFetchID) });
             }

             $.each(data["items"], function (key, val) {
                 var comment = $("<li class='comment'></li>");
                 var body = $("<div class='commentBody'></div>");

                 var author = $("<h2 class='author'></h2>");
                 var authorName = val.snippet.topLevelComment.snippet.authorDisplayName;
                 author.html(authorName);

                 // comment id used for google + reply retrieval: val.id.$t.split("comment:")[1]
                 // google+ id: val.yt$googlePlusUserId.$t
                 // reply count: val.yt$replyCount.$t


                 var googleID = val.snippet.topLevelComment.snippet.authorGoogleplusProfileUrl;
                 var replyCt = val.snippet.totalReplyCount;
                 var commentID = val.id;


                 var userData = $("<div class='commentData'></div>");
                 userData.html("<p> reply number: " + count + "</p>" +
                             "<p> Google+:<a href='" + googleID + "'></a></p>" +
                             "<p> replyCt: " + replyCt + "</p>" +
                             "<p> commentID: " + commentID + "</p>");

                 var content = $("<div class='content'></div>");
                 content.html(parseComment(val.snippet.topLevelComment.snippet.textDisplay, currFetchID, authorName));

                 // find replies
                 if (replyCt > 0) {
                     loadCommentReplies(comment, commentID, 1, "", currFetchID);
                 }

                 body.append(author).append(content).append(userData);
                 body.hover(function () {
                     // in
                     $(this).find("span.highlight").css("font-size", "24pt");
                 }, function () {
                     // out
                     $(this).find("span.highlight").css("font-size", "12pt");
                 });


                 $("#comments > .error").fadeOut(1000);
                 comment.append(body);
                 commentHTML.append(comment);
                 if ($('#message h1').text().indexOf("Processing") >= 0) {
                     Utility.displayLoading('Processing query...please wait', count / totalComments);
                 }
                 $("#h2_comments").html(count);
                 count++;
             });

             if (!nextUrl) {
                 // get google+ comments if any exist
                 Utility.displayLoading('Getting commenters from Google+...please wait', count / totalComments);
                 Utility.getGooglePlusComments(selectedVideoId, function (comment, author) {
                     var commentElt = $("<li class='comment googlePlus'></li>");
                     var body = $("<div class='commentBody'></div>");
                     var authorElt = $("<h2 class='author'>"+author+"</h2>");
                     var userData = $("<div class='commentData'></div>");
                     userData.html("<p> reply number: " + count + "</p>" +
                                 "<p>Retrieved from Google+</p>" +
                                 "<p>No further information loaded</p>");

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
                     Utility.displayLoading('Getting comments from Google+...please wait', count / totalComments);
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

             console.log('Error loading comments');
             // try again
             retryCt--;
             if (retryCt > 0) {
                 Utility.delayAfter(function () { loadComments(count, url, currFetchID) }, 500);
             } else {
                 // give up
                 $("#termSpace .loading, #commentSpace .loading, #commentSpace .error, #chartSection, #termResults").fadeOut(1000);
                 $("#termSpace .error, #commentSpace > .error").fadeIn(1000, function () {
                     $("#h2_comments").html('Error');
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
        url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=" + id;
    else
        url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=" + id + "&pageToken=" + pageToken;

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
                 var comment = $("<li class='comment'></li>");
                 var body = $("<div class='commentBody'></div>");

                 var author = $("<h2 class='author'></h2>");
                 var authorName = val.snippet.authorDisplayName;
                 author.html(authorName);

                 var content = $("<div class='content'></div>");
                 content.html(parseComment(val.snippet.textDisplay, currFetchID, authorName));

                 var userdata = $("<div class='commentData'></div>");
                 userdata.html("<p> reply number: " + count + "</p>" +
                             "<p> published: " + val.snippet.publishedAt + "</p>" +
                             "<p> id: " + val.id + "</p>" +
                             "<p> Next page token: " + nextPageToken + "</p>");


                 body.append(author).append(content).append(userdata);
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

             console.log('Error loading comment replies');
             // try again
             retryCt--;
             if (retryCt > 0) {
                 loadCommentReplies(commentParent, id, count, pageToken, currFetchID);
             } else {
                 $("#termSpace .loading, #commentSpace .loading, #commentSpace .error, #chartSection, #termResults, #voters, #comments").fadeOut(1000);
                 $("#termSpace .error, #commentSpace > .error").fadeIn(1000, function() {
                    $("#h2_comments").html('Error');
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

    if (!$("#termSpace").is(":visible")) {
        $("#termSpace").slideDown(500, function () {
            // Animation complete.
            $(this).fadeIn(1000);
            $("#chartSection").show();
            $("#piechart").fadeIn(1000, function () {
                $("#downloadPieChart").prop("disabled", false);
            });
            $("#barchart").fadeIn(1000);
            $("#termResults").fadeIn(1000);
        });
    }

    if (!loaded) {
        data.addColumn('string', 'Video');
        data.addColumn('number', 'Votes');

        // Add rows
        data.addRows(ConfiguredTermArray.length);
        for (i = 0; i < ConfiguredTermArray.length; i++) {

            // data
            data.setCell(i, 0, ConfiguredTermArray[i][0]);
            data.setCell(i, 1, ConfiguredTermArray[i][1]);
        }
        loaded = true;
    }

    var res = comment;
    var index = -1;
    var s, t, v;

    comment = comment.toLowerCase();

    for (i = 0; i < ConfiguredTermArray.length; i++) {
        var key = ConfiguredTermArray[i][0];
        if ((index = comment.indexOf(key.toLowerCase())) >= 0) {
            ConfiguredTermArray[i][1]++;
            data.setCell(i, 1, ConfiguredTermArray[i][1]);

            s = res.substring(0, index);
            t = res.substring(index, index + key.length);
            v = res.substring(index + key.length, res.length + 1);

            res = s + "<span class='" + key + " highlight'>" + t + "</span>" + v;
            comment = res.toLowerCase();

            if (voters.indexOf(author) < 0) {
                voters.push(author);
                $("#voters .error").fadeOut(1000);
                Utility.addToSortedList("voters", author);
            }
        }
    }

    overallCount++;
    return res;
}

function loadChart() {
    // get only non zero vals
    var nonNullData = new google.visualization.DataTable();
    var pieColors = Array(ConfiguredTermArray.length);

    nonNullData.addColumn('string', 'Video');
    nonNullData.addColumn('number', 'Votes');
    nonNullData.addColumn({ type: 'string', role: 'style' });
    nonNullData.addColumn({ type: 'string', role: 'annotation' });
    var total = 0;
    for (i = 0; i < data.getNumberOfRows() ; i++) {
        total += data.getValue(i, 1);
    }

    var x = 0;
    for (i = 0; i < data.getNumberOfRows() ; i++) {
        pieColors[i] = "#FFFFFF";
        if (data.getValue(i, 1) > 0) {
            nonNullData.addRows(1);
            nonNullData.setCell(x, 0, data.getValue(i, 0));
            nonNullData.setCell(x, 1, data.getValue(i, 1));
            nonNullData.setCell(x, 2, 'color: ' + ConfiguredColorArray[i]);
            nonNullData.setCell(x, 3, ((data.getValue(i, 1) / total) * 100).toFixed(2) + "%");
            pieColors[x] = ConfiguredColorArray[i];
            x++;
        }
    }

    // PIE
    var options = {
        colors: pieColors,
        theme: 'maximized',
        backgroundColor: 'transparent',
        pieSliceText: 'label',
        pieSliceTextStyle: {
            color: 'black',
            fontSize: '24pt',
        },
    };


    Utility.delayAfter(function () { drawChart('piechart', 'piechart', nonNullData, options); }, 1000);

    // BAR
    var baroptions = {
        backgroundColor: { fill: 'transparent' },
        theme: 'maximized',
        chartArea: {
            backgroundColor: 'transparent',
        },
        hAxis: {
            title: 'Votes',
            position: 'none',
        },
        vAxis: {
            title: 'Video',
            position: 'none',
        },
        animation: {
            duration: 500,
            easing: 'linear'
        },
        legend: {
            position: 'none',
        },
        axisTitlesPosition: 'none',
        annotations: {
            highContrast: true,
            textStyle: {
                color: 'black',
                fontSize: '24pt',
            }
        }
    };

    drawChart('barchart', 'barchart', nonNullData, baroptions);
}