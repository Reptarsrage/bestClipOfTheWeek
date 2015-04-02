const GOOD = 0;
const BAD = 1;
const OKAY = 2
const TIMER_DELAY = 2500;
const MAX_TIMER_COUNT = 120 / (TIMER_DELAY / 1000);
const BAR_CHART_MAX_RATIO = 0.5;
const PLAYLIST_TITLE = "World's Best Clip of the Week"

const TERMS = Array('Alpha'
	, 'Bravo'
	, 'Charlie'
	, 'Delta'
	, 'Echo'
	, 'Foxtrot'
	, 'Golf'
	, 'Hotel'
	, 'India'
	, 'Juliet'
	, 'Kilo'
	, 'Lima'
	, 'Mike'
	, 'November'
	, 'Oscar'
	, 'Papa'
	, 'Quebec'
	, 'Romeo'
	, 'Sierra'
	, 'Tango'
	, 'Uniform'
	, 'Victor'
	, 'Whiskey'
	, 'X-ray'
	, 'Yankee'
	, 'Zulu');

var startTime, endTime;
var loaded = false;
var colorArray, termStats;
var data = null;
var commentHTML = $("<div></div>");
var overallCount = 0;
var lastCount = 0;
var timerCount = 0;
var gapiPieChart, gapiBarChart;
var maxValue = 500;
var fetchID = 0;
var voters = new Array();

displayMessage("Authorizing...", OKAY);

google.load("visualization", "1", {
    packages: ["corechart", 'table']
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
        select.attr("disabled", 'disabled');
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
        select.append("<option value='Error'>Error retrieving videos</option>");
        select.attr("disabled", 'disabled');
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
        // Only show pagination buttons if there is a pagination token for the
        // next or previous page of results.
        nextPageToken = response.result.nextPageToken;

        var playlistItems = response.result.items;
        if (playlistItems) {
            $.each(playlistItems, function (index, item) {
                date = new Date(item.snippet.publishedAt);
                title = item.snippet.title;
                pos = item.snippet.position;
                url = item.snippet.thumbnails.default.url;
                id = item.snippet.resourceId.videoId;

                if (title.length > 80) {
                    title = title.substring(0, 87) + "...";
                }


                content = $("<li class='option' onclick='addUrlToInput(\"https://www.youtube.com/watch?v=" + id + "\", this)' title='" + item.snippet.title + "'></li>");
                content.append($("<img class='option_thumb' src='" + url + "' alt='" + pos + "' \>"));
                content.append($("<h3 class='option_title' >" + title + "<br><p class='option_date'>Date added: " + date.toLocaleDateString() + "</p></h3>"));

                $("#select_bestOfTheWeek").append(content);
            });
        }

        if (nextPageToken)
            requestVideosInPlaylist(playlistId, nextPageToken);
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


function drawChart(chartType, containerID, dataTablo, options) {
    var containerDiv = document.getElementById(containerID);
    var chart = false;
    if (chartType.toUpperCase() == 'BARCHART') {
        if (!gapiBarChart)
            gapiBarChart = new google.visualization.BarChart(containerDiv)
        chart = gapiBarChart;
    } else if (chartType.toUpperCase() == 'COLUMNCHART') {
        chart = new google.visualization.ColumnChart(containerDiv);
        columnChart = chart;
    } else if (chartType.toUpperCase() == 'PIECHART') {
        if (!gapiPieChart)
            gapiPieChart = new google.visualization.PieChart(containerDiv)
        chart = gapiPieChart;
    } else if (chartType.toUpperCase() == 'TABLECHART') {
        chart = new google.visualization.Table(containerDiv);
        tableChart = chart;
    }

    if (chart == false) {
        return false;
    }
    chart.draw(dataTablo, options);
}

function chartTimeUpdate(currFetchID) {
    if (currFetchID != fetchID || timerCount > MAX_TIMER_COUNT) {
        overallCount = 0;
        lastCount = 0;
        timerCount = 0;
        console.log("TIMEOUT!");
        return;
    } else if (lastCount == overallCount) {
        timerCount++;
        console.log("tick");
        setTimeout(chartTimeUpdate, TIMER_DELAY, currFetchID);
        return;
    } else {
        lastCount = overallCount;
        timerCount = 0;
        console.log("UPDATE!");
        loadChart();
        setTimeout(chartTimeUpdate, TIMER_DELAY, currFetchID);
    }
}

function toggleComments(cb, manual) {

    if (manual) {
        $("#checkbox_voters").prop('checked', false);
        toggleVoters($("#checkbox_voters"), false);
    }

    if (cb.attr('checked') == 'checked') {
        $("#comments").append(commentHTML);
        $("#comments").show();
    } else {
        $("#comments").hide();
        $("#comments").empty();
    }
}

function toggleVoters(cb, manual) {

    if (manual) {
        $("#checkbox_comments").prop('checked', false);
        toggleComments($("#checkbox_comments"), false);
    }

    if (cb.attr('checked') == 'checked') {
        $("#voters").show();
    } else {
        $("#voters").hide();
    }
}

// Helper method to display a message on the page.
function displayMessage(message, good) {
    $('#message').text(message).show();

    if (good == GOOD)
        $('#message').attr("class", "good");
    else if (good == BAD)
        $('#message').attr("class", "bad");
    else
        $('#message').attr("class", "okay");
}

// Helper method to hide a previously displayed message on the page.
function hideMessage() {
    $('#message').hide();
}

function showErrors() {
    $("#chartSection").hide();
    $("#termResults").hide();
    $("#termSpace > .error").show();
    $("#commentSpace > .error").show();
    $("#stats > .error").show();

   // $("#stats").append("<h3 class='error'>" + "Unable to find stats for your video. Make sure the url you have provided is valid and contains a valid video ID. (For example: https://www.youtube.com/watch?<b>v=1M5vGlvic_o</b>)" + "</h3>");
    //$("#termSpace").append("<h3 class='error'>" + "There are no results to display for your video." + "</h3>");
    //$("#commentSpace").append("<h3 class='error'>" + "Unable to find comments for your video." + "</h3>");
    $("#termSpace").removeClass("hidden");
    $("#commentSpace").removeClass("hidden");
    $("#results").removeClass("hidden");
    $("input[type='checkbox']").attr("disabled", true);
                
}

function fetchResults() {
    // clean up
    $("input[type='checkbox']").removeAttr("disabled");
    $("#commentSpace").addClass("hidden");
    $("#termSpace").addClass("hidden");
    $("#results").addClass("hidden");
    //$(".error").remove();
    $("#termResults_list").empty();
    $("#stats").children().filter(":not(.error)").remove();
    $("#voters .error").show();
    $("#comments").empty();
    $("#chartSection").show();
    $("#termResults").show();
    $("#h2_comments").html('0');
    $("#chartSection").hide();
    $("#termResults").hide();
    $("#termSpace").removeClass("hidden");
    $("#voters").children().filter(":not(.error)").remove();

    //reset
    loaded = false;
    colorArray, termStats = null;
    commentHTML = $("<div></div>");
    overallCount = 0;
    lastCount = 0;
    timerCount = 0;
    gapiPieChart, gapiBarChart = null;
    maxValue = 500;
    data = new google.visualization.DataTable();
    voters = new Array();
    toggleVoters($("#checkbox_voters"), false);
    toggleComments($("#checkbox_comments"), false);

    // Start
    fetchID++;
    startTime = new Date().getTime();

    displayMessage('Processing query...please wait', OKAY);
    var id = grabVideoId();
    executeAsync(getVideoStats(id, fetchID));
    chartTimeUpdate(fetchID);
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

    if (!id) {
        // no results
        showErrors();
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
            var image = $("<img id='img_thumb' src='" + thumbUrl + "' alt='" + title + "' style='width:" + thumbW + "px;height:" + thumbH + "px'>");

            title = $("<h3><a href='https://www.youtube.com/watch?v=" + id + "'>" + title + "</a></h3>");
            description = $("<h3 class='hidden'>" + description + "</h3>");

            viewCount = $("<p>Views: " + viewCount + "</p>");
            likeCount = $("<p>Likes: " + likeCount + "</p>");
            dislikeCount = $("<p>Dislikes: " + dislikeCount + "</p>");
            favoriteCount = $("<p>Favorites: " + favoriteCount + "</p>");
            commentCount = $("<p>Comments: " + commentCount + "</p>");
            var videoStats = $("<div id='div_video_stats' style='left:" + thumbW + "px'></div>");
            videoStats.append(viewCount).append(dislikeCount).append(favoriteCount).append(commentCount);

            // add to DOM
            $("#stats > .error").hide();
            $("#stats").append(title).append(description).append(image)
            $("#stats").append(videoStats);
            $("#results").removeClass("hidden");
            executeAsync(loadComments(1, "http://gdata.youtube.com/feeds/api/videos/" + id + "/comments?v=2&alt=json&max-results=" + 20, currFetchID));



        } else {
            // no results
            showErrors();
            displayMessage("No results found for video with ID='" + id + "'.", OKAY);
        }
    }, function (reason) {
        displayMessage('Error loading stats: ' + reason.result.error.message, BAD);
        showErrors();
    });
}

function getNextPageUrl(data) {
    //data.feed.link[5].rel == 'next'
    //data.feed.link[5].href

    var url = ""

    $.each(data.feed.link, function (key, val) {
        if (val.hasOwnProperty("rel") && val.rel == "next")
            url = val.href;
    });

    return url;

}

function loadComments(count, url, currFetchID) {
    if (currFetchID != fetchID)
        return;

    $.ajax({
        url: url,
        dataType: "jsonp",
        async: true,
        error: function(jqXHR, textStatus, errorThrown) {
            if (currFetchID != fetchID)
                return;

            console.log('error');
            console.log(errorThrown);
            console.log(jqXHR);
            displayMessage("Woops! Error retrieving comments. (" + errorThrown + ")", BAD);
            $("#commentSpace > .error").show();
            $("input[type='checkbox']").attr("disabled", true);
        },
        success: function (data) {
            if (currFetchID != fetchID)
                return;

            nextUrl = getNextPageUrl(data);
            console.log(nextUrl);
            $.each(data.feed.entry, function (key, val) {
                $("#commentSpace > .error").hide();
                $("#commentSpace").removeClass("hidden");
                var comment = $("<li class='comment'></li>");
                var body = $("<div class='commentBody'></div>");

                var author = $("<h2 class='author'></h2>");
                author.html(val.author[0].name.$t);

                // comment id used for google + reply retrieval: val.id.$t.split("comment:")[1]
                // google+ id: val.yt$googlePlusUserId.$t
                // reply count: val.yt$replyCount.$t


                var googleID;
                if (val.hasOwnProperty('yt$googlePlusUserId'))
                    googleID = val.yt$googlePlusUserId.$t;

                var replyCt = 0;
                var commentID = "N/A";

                if (googleID)
                    replyCt = val.yt$replyCount.$t;

                if (replyCt > 0)
                    commentID = val.id.$t.split("comment:")[1];


                var userData = $("<div class='commentData'></div>");
                userData.html("<p> reply number: " + count + "</p>" +
                            "<p> googleID: " + googleID + "</p>" +
                            "<p> replyCt: " + replyCt + "</p>" +
                            "<p> commentID: " + commentID + "</p>");

                var content = $("<div class='content'></div>");
                content.html(parseComment(val.content.$t, currFetchID, val.author[0].name.$t));

                // find replies
                if (commentID != "N/A") {
                    appendComments(comment, commentID, 1, "", currFetchID);
                }

                body.append(author).append(content).append(userData);
                comment.append(body);
                $("#comments .error").remove();
                commentHTML.append(comment);
                $("#h2_comments").html(count);
                count++;

            });

            if (nextUrl != "")// && count < 100)
                executeAsync(loadComments(count, nextUrl, currFetchID));
            else {
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
        url = "https://www.googleapis.com/plus/v1/activities/" + id + "/comments";
    else
        url = "https://www.googleapis.com/plus/v1/activities/" + id + "/comments?" + "pageToken=" + pageToken;

    gapi.client.request({ 'path': url }).then(function (resp) {
        if (currFetchID != fetchID)
            return;

        var page = JSON.parse(resp.body).nextPageToken;

        if (JSON.parse(resp.body).hasOwnProperty("items")) {
            var items = JSON.parse(resp.body).items
            $.each(items, function (key, val) {
                var comment = $("<li class='comment'></li>");
                var body = $("<div class='commentBody'></div>");

                var author = $("<h2 class='author'></h2>");
                author.html(val.actor.displayName);

                //item.actor.displayname
                //json.parse(resp.body).items[0].object.content
                //json.parse(resp.body).items[0].object.originalcontent

                var content = $("<div class='content'></div>");
                content.html(parseComment(val.object.content, currFetchID, val.actor.displayName));

                var userdata = $("<div class='commentData'></div>");
                userdata.html("<p> reply number: " + count + "</p>" +
                            "<p> published: " + val.published + "</p>" +
                            "<p> id: " + val.id + "</p>" +
                            "<p> page token: " + page + "</p>");


                body.append(author).append(content).append(userdata);
                comment.append(body);
                commentParent.append(comment);
                count++;
            });

            if (typeof page !== 'undefined' && page != pageToken)
                executeAsync(appendComments(commentParent, id, count, page, currFetchID));
        }
    }, function (reason) {
        commentParent.append('<li>Error loading reply: ' + reason.result.error.message + '</li>');
        displayMessage('Issue retrieving replies.', BAD);
    });
}

function parseComment(comment, currFetchID, author) {
    if (currFetchID != fetchID)
        return;

    if (!loaded) {
        colorArray = Array(TERMS.length);
        termStats = Array(TERMS.length);

        data.addColumn('string', 'Video');
        data.addColumn('number', 'Votes');

        // Add rows
        data.addRows(TERMS.length);
        for (i = 0; i < TERMS.length; i++) {
            // terms
            termStats[i] = 0


            // data
            data.setCell(i, 0, TERMS[i]);
            data.setCell(i, 1, null);

            // color
            colorArray[i] = getRandomColor();
            $("<style>")
                .prop("type", "text/css")
                .html("\
                ."+ TERMS[i] + " {\
                    font-weight: bold; \
                    color: " + colorArray[i] + ";\
                }")
                .appendTo("head");
        }
        loaded = true;
    }

    var res = comment;
    var index = -1;
    var s, t, v;

    comment = comment.toLowerCase();

    for (i = 0; i < TERMS.length; i++) {
        if ((index = comment.indexOf(TERMS[i].toLowerCase())) > -1) {
            data.setCell(i, 1, data.getValue(i, 1) + 1);
            termStats[i]++;

            s = res.substring(0, index);
            t = res.substring(index, index + TERMS[i].length);
            v = res.substring(index + TERMS[i].length, res.length + 1);

            res = s + "<span class='" + TERMS[i] + " highlight'>" + t + "</span>" + v;    
            comment = res.toLowerCase();
            $("#termResults_list ." + TERMS[i]).remove();
            $("#termResults_list").append("<li class='" + TERMS[i] + "'>" + TERMS[i] + ": " + data.getValue(i, 1) + "</li>");
            $("#termSpace > .error").hide();
            $("#chartSection").show();
            $("#termResults").show();


            if (voters.indexOf(author) < 0) {
                voters.push(author);
                $("#voters .error").hide();
                addToSortedList("voters", author);
            }
        }
    }

    $("#termResults .remove").remove();
    // sort
    var mylist = $('#termResults_list');
    var listitems = mylist.children('li').get();
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
    for (i = 0; i < TERMS.length; i++) {
        if (termStats[i] == 0) {
            $("#termResults_list").append("<li class='remove' style='color: gray'>" + TERMS[i] + ": 0</li>");
        }
    }

    $("#termSpace").removeClass("hidden");
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
    var pieColors = Array(TERMS.length);

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
            nonNullData.setCell(x, 2, 'color: ' + colorArray[i]);
            pieColors[x] = colorArray[i];
            x++;
        }
    }

    console.log("chart update");

    // PIE

    var options = {
        title: 'Vote results',
        colors: pieColors,
        fontName: 'Segoe UI'
    };


    drawChart('piechart', 'piechart', nonNullData, options);

    // BAR
    var options = {
        title: 'Vote results',
        hAxis: {
            title: 'Votes',
            minValue: 0,
            maxValue: maxValue
        },
        vAxis: { title: 'Video' },
        animation: {
            duration: TIMER_DELAY,
            easing: 'out'
        },
        fontName: 'Segoe UI',
        legend: {
            position: 'none',
        },
    };

    drawChart('barchart', 'barchart', nonNullData, options);
                
}