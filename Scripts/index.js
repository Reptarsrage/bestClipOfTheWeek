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
const TIMER_DELAY = 2500;
const MAX_TIMER_COUNT = 120 / (TIMER_DELAY / 1000);
const BAR_CHART_MAX_RATIO = 0.5;
const PLAYLIST_TITLE = "World's Best Clip of the Week"

// Variables
var ConfiguredTermArray;
var ConfiguredColorArray;
var startTime, endTime;
var loaded = false;
var termStats;
var data = null;
var commentHTML = $("<div></div>");
var overallCount = 0;
var lastCount = 0;
var timerCount = 0;
var gapiPieChart, gapiBarChart, gapiColumnChart;
var gapiPieChart_options, gapiBarChart_options, gapiColumnChart_options;
var gapiPieChart_data, gapiPieChart_data, gapiPieChart_data;
var maxValue = 500;
var fetchID = 0;
var voters = new Array();
var videoHistoryStats;

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
                    return TOOL_TIPS['index'][name];//$(this).data('description');
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

    $("#a_config").prop("href", "config.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_quick").prop("href", "quick.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_comments").prop("href", "comments.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);

    // clean up
    $("#termResults_list").children().filter(":not(.loading)").remove();
    $("input[type='checkbox']").prop('disabled', false);
    $("#stats_group").children().filter(":not(.error, #columnchart, .loading)").remove();
    $("#comments").children().filter(":not(.error)").remove();
    $("#h2_comments").html('0');
    $("#voters").children().filter(":not(.error)").remove();

    // start off hiding errors, will be shown as they crop up
    $(".error").fadeOut(500);
    $(".loading").fadeIn(500);
    
    // hide all sections (will show one at a time as it completes
    $("#commentSpace").fadeOut(500);
    $("#termSpace").fadeOut(500);
    $("#results").fadeOut(500);
    $("#chartSection").fadeOut(500);
    $("#termResults").fadeOut(500);

    //reset
    loaded = false;
    termStats = null;
    commentHTML = $("<div></div>");
    overallCount = 0;
    lastCount = 0;
    timerCount = 0;
    gapiPieChart, gapiBarChart, gapiColumnChart = null;
    maxValue = 500;
    data = new google.visualization.DataTable();
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);
    
});

displayMessage("Authorizing...", OKAY);

google.load("visualization", "1", {
    packages: ["corechart", 'table', "bar"]
});

google.setOnLoadCallback(function () {
    displayMessage("Authorize - Success", GOOD);
    data = new google.visualization.DataTable();
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
        channelID = response.result.items[0].id;//relatedPlaylists.uploads;
        requestVideoPlaylist(channelID);

    }, function (reason) {
        select.append("<li>Error retrieving videos</li>");
        select.prop('disabled', true);
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
                    videoHistoryStats = new Array();
                    requestVideosInPlaylist(id);
                    return;
                }
            });
        }
        if (nextPageToken)
            requestVideoPlaylist(channelID, nextPageToken);

    }, function (reason) {
        select.append("<option value='Error'>Error retrieving videos</option>");
        select.prop('disabled', true);
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
    
                // add to stored list for column chart usage
                if (!addVideoStatsToArray(item.snippet.resourceId.videoId, item.snippet.title, item.snippet.title.substring(0, 20) + "...", date)) {
                    $("#select_bestOfTheWeek").children().filter(":not(.error, .loading)").remove();
                    $("#select_bestOfTheWeek .loading").fadeOut(500);
                    $("#select_bestOfTheWeek .error").fadeIn(500);
                    return;
                }
            });
        }

        if (nextPageToken)
            requestVideosInPlaylist(playlistId, nextPageToken);
    }, function (reason) {
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
    $("#" + containerID + " .loading").fadeOut(500);
    chart.draw(dataTable, options);
}

function chartTimeUpdate(currFetchID) {
    if (currFetchID != fetchID || timerCount > MAX_TIMER_COUNT) {
        overallCount = 0;
        lastCount = 0;
        timerCount = 0;
        //console.log("TIMEOUT!");
        return;
    } else if (lastCount == overallCount) {
        timerCount++;
        //console.log("tick");
        setTimeout(chartTimeUpdate, TIMER_DELAY, currFetchID);
        return;
    } else {
        lastCount = overallCount;
        timerCount = 0;
        //console.log("UPDATE!");
        loadChart();
        setTimeout(chartTimeUpdate, TIMER_DELAY, currFetchID);
    }
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

// Helper method to hide a previously displayed message on the page.
function hideMessage() {
    $('#message').fadeOut(500);
}

function fetchResults() {
    // clean up
    $("#termResults_list").children().filter(":not(.loading)").remove();
    $("input[type='checkbox']").prop('disabled', false);
    $("#stats_group").children().filter(":not(.error, #columnchart, .loading)").remove();
    $("#comments").children().filter(":not(.error)").remove();
    $("#h2_comments").html('0');
    $("#voters").children().filter(":not(.error)").remove();

    // start off hiding errors, will be shown as they crop up
    $(".error").fadeOut(500);

    // starting off showing all loading images, will hide as they load
    $(".loading").fadeIn(500);
    
    // hide all sections (will show one at a time as it completes
    $("#commentSpace").fadeOut(500);
    $("#termSpace").fadeOut(500);
    $("#results").fadeOut(500);
    $("#chartSection").fadeOut(500);
    $("#termResults").fadeOut(500);

    //reset
    loaded = false;
    termStats = null;
    commentHTML = $("<div></div>");
    overallCount = 0;
    lastCount = 0;
    timerCount = 0;
    gapiPieChart, gapiBarChart, gapiColumnChart = null;
    maxValue = 500;
    data = new google.visualization.DataTable();
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);

    // Start
    $("#collapse").click();

    if (!ConfiguredColorArray || !ConfiguredTermArray) {
        displayMessage("Unable to load terms for user " + urlParams['username'] + ".", BAD);
        return false;
    }

    $("#results").slideDown("slow", function () {
        // Animation complete.
        $(this).fadeIn(500);
    });

    fetchID++;
    startTime = new Date().getTime();

    displayMessage('Processing query...please wait', OKAY);
    $("#results").fadeIn(500);
    var id = grabVideoId();
    executeAsync(function () { getVideoStats(id, fetchID) });
    chartTimeUpdate(fetchID);
}

function addVideoStatsToArray(id, title, shorthand, dateadded) {
    if (id.trim() == '')
        return false;

    // See https://developers.google.com/youtube/v3/docs/videos/list
    var request = gapi.client.youtube.videos.list({
        part: 'statistics',
        id: id
    });
    request.execute(function (response) {
        if (response.pageInfo.totalResults > 0) {
            // stats
            viewCount = response.result.items[0].statistics.viewCount;
            likeCount = response.result.items[0].statistics.likeCount;
            commentCount = response.result.items[0].statistics.commentCount;
            videoHistoryStats.push([title, viewCount, commentCount, likeCount, shorthand, dateadded]);
            return true;
        } else {
            return false;
        }
    }, function(reason) {
        return false;
    });
    return true;
}

function getVideoStats(id, currFetchID) {
    /*
    response.result.items[0].snippet
        "publishedAt": datetime,
        "channelId": string,
        "title": string,
        "description": string,
        "thumbnails": {
          (key): {
            "url": string,
            "width": unsigned integer,
            "height": unsigned integer

    response.result.items[0].statistics
        "viewCount": unsigned long,
        "likeCount": unsigned long,
        "dislikeCount": unsigned long,
        "favoriteCount": unsigned long,
        "commentCount": unsigned long
    */

    if (currFetchID != fetchID)
        return;

    $("#statsSpace").slideDown( "slow", function() {
        // Animation complete.
        $(this).fadeIn(500);
        $("#stats_group .loading").hide();
        $("#stats > .error").fadeIn(500);
        $("#columnchart").hide();
    });

    if (!id) {
        // no results
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
            maxValue = commentCount * BAR_CHART_MAX_RATIO;
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
            $("#columnchart").fadeIn(500);
            $("#columnchart .loading").show();
            executeAsync(function () { loadComments(1, "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE&videoId=" + id + "&maxResults=" + 20, currFetchID) });

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
                if (videoHistoryStats[pos][0] == response.result.items[0].snippet.title)
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
            drawChart('columnchart', 'columnchart', nonNullData, google.charts.Bar.convertOptions(options));

        } else {
            // no results
            $("#statsSpace .error").fadeIn(500);
            displayMessage("No results found for video with ID='" + id + "'.", OKAY);
        }
    }, function (reason) {
        //displayMessage('Error loading stats: ' + reason.result.error.message, BAD);
        // $("#statsSpace .error").fadeIn(500);
        console.log('Error loading stats: ' + reason.result.error.message);
        getVideoStats(id, currFetchID)
    });
}

function loadComments(count, url, currFetchID) {
    if (currFetchID != fetchID)
        return;

    if (!$("#commentSpace").is(":visible")) {
        $("#commentSpace").slideDown("slow", function () {
            // Animation complete.
            $(this).fadeIn(500);
            $("#commentSpace .error").fadeIn(500);
        });
    }

    $.ajax({
        url: url,
        dataType: "jsonp",
        error: function(jqXHR, textStatus, errorThrown) {
            if (currFetchID != fetchID)
                return;

            console.log('Error loading comments');
            console.log(errorThrown);
            console.log(jqXHR);
            // try again
            loadComments(count, url, currFetchID)
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
                executeAsync(function () { loadComments(count + data.pageInfo.resultsPerPage, nextUrl, currFetchID) });
            }

            $("#commentSpace > .error").fadeOut(500);
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
                    appendComments(comment, commentID, 1, "", currFetchID);
                }

                body.append(author).append(content).append(userData);
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

            console.log('Error loading comment replies');
            console.log(errorThrown);
            console.log(jqXHR);
            // try again
            appendComments(commentParent, id, count, pageToken, currFetchID)
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
        }
    });
}

function parseComment(comment, currFetchID, author) {
    if (currFetchID != fetchID)
        return;
    
    if (!$("#termSpace").is(":visible")) {
        $("#termSpace").slideDown("slow", function () {
            // Animation complete.
            $(this).fadeIn(500);
            $("#termSpace > .error").fadeIn(500);
        });
    }

    if (!loaded) {
        termStats = Array(ConfiguredTermArray.length);

        data.addColumn('string', 'Video');
        data.addColumn('number', 'Votes');

        // Add rows
        data.addRows(ConfiguredTermArray.length);
        for (i = 0; i < ConfiguredTermArray.length; i++) {
            // terms
            termStats[i] = 0

            // data
            data.setCell(i, 0, ConfiguredTermArray[i]);
            data.setCell(i, 1, null);
        }
        loaded = true;
    }

    var res = comment;
    var index = -1;
    var s, t, v;

    comment = comment.toLowerCase();

    for (i = 0; i < ConfiguredTermArray.length; i++) {
        if ((index = comment.indexOf(ConfiguredTermArray[i].toLowerCase())) > -1) {
            data.setCell(i, 1, data.getValue(i, 1) + 1);
            termStats[i]++;

            s = res.substring(0, index);
            t = res.substring(index, index + ConfiguredTermArray[i].length);
            v = res.substring(index + ConfiguredTermArray[i].length, res.length + 1);

            res = s + "<span class='" + ConfiguredTermArray[i] + " highlight'>" + t + "</span>" + v;    
            comment = res.toLowerCase();
            $("#termResults_list ." + ConfiguredTermArray[i]).remove();
            $("#termResults_list").append("<li class='" + ConfiguredTermArray[i] + "'>" + ConfiguredTermArray[i] + ": " + data.getValue(i, 1) + "</li>");
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

function loadChart() {
    // get only non zero vals
    var nonNullData = new google.visualization.DataTable();
    var pieColors = Array(ConfiguredTermArray.length);

    nonNullData.addColumn('string', 'Video');
    nonNullData.addColumn('number', 'Votes');
    nonNullData.addColumn({ type: 'string', role: 'style' });

    var x = 0;
    for (i = 0; i < data.getNumberOfRows() ; i++) {
        pieColors[i] = "#FFFFFF";
        if (data.getValue(i, 1) > 0) {
            nonNullData.addRows(1);
            nonNullData.setCell(x, 0, data.getValue(i, 0));
            nonNullData.setCell(x, 1, data.getValue(i, 1));
            nonNullData.setCell(x, 2, 'color: ' + ConfiguredColorArray[i]);
            pieColors[x] = ConfiguredColorArray[i];
            x++;
        }
    }

    if (nonNullData.getNumberOfRows() > 0) {
        $("#termSpace > .error").fadeOut(500);
        $("#chartSection").fadeIn(500);
        $("#termResults").fadeIn(500);
    }


    //console.log("chart update");

    // PIE

    var options = {
        colors: pieColors,
        theme: 'maximized',
        backgroundColor: '#ECECEC',
        pieSliceText: 'label',
        pieSliceTextStyle: {
            color: 'black',
            fontSize: '24pt',
        },
    };


    drawChart('piechart', 'piechart', nonNullData, options);

    // BAR
    var options = {
        theme: 'maximized',
        chartArea: {
            backgroundColor: '#ECECEC',
        },
        hAxis: {
            title: 'Votes',
            minValue: 0,
            //maxValue: maxValue,
        },
        vAxis: {
            title: 'Video',
            position: 'in',
        },
        animation: {
            duration: TIMER_DELAY,
            easing: 'out'
        },
        legend: {
            position: 'none',
        },
        annotations: {
            highContrast: false,
            textStyle: {
                color: 'black',
                fontSize: '24pt',
            }
        }
    };

    drawChart('barchart', 'barchart', nonNullData, options);
                
}