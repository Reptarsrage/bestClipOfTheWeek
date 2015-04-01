const GOOD = 0;
const BAD = 1;
const OKAY = 2
const TIMER_DELAY = 500;
const MAX_TIMER_COUNT = 120 / (TIMER_DELAY / 1000);

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

//var termStats;
var loaded = false;
var colorArray;
var data = null;
var commentHTML = $("<div></div>");
var long = 0;
var overallCount = 0;
var lastCount = 0;
var timeCount = 0;

displayMessage("Authorizing...", OKAY);

google.load("visualization", "1", {
    packages: ["corechart", 'table']
});

google.setOnLoadCallback(function () {
    displayMessage("Authorize - Success", GOOD);
    data = new google.visualization.DataTable();
    drawChart('piechart', 'piechart', data, null);
    drawChart('barchart', 'barchart', data, null);
});

function onJSClientLoad() {
    gapi.client.setApiKey('AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE');
    gapi.client.load('plus', 'v1');
    gapi.client.load('youtube', 'v3');
}

function executeAsync(func) {
    setTimeout(func, 0);
}

function drawChart(chartType, containerID, dataTablo, options) {
    var containerDiv = document.getElementById(containerID);
    var chart = false;
    if (chartType.toUpperCase() == 'BARCHART') {
        chart = new google.visualization.BarChart(containerDiv);
    } else if (chartType.toUpperCase() == 'COLUMNCHART') {
        chart = new google.visualization.ColumnChart(containerDiv);
        columnChart = chart;
    } else if (chartType.toUpperCase() == 'PIECHART') {
        chart = new google.visualization.PieChart(containerDiv);
    } else if (chartType.toUpperCase() == 'TABLECHART') {
        chart = new google.visualization.Table(containerDiv);
        tableChart = chart;
    }

    if (chart == false) {
        return false;
    }
    chart.draw(dataTablo, options);
}

function chartTimeUpdate() {
    if (timerCount > MAX_TIMER_COUNT) {
        overallCount = 0;
        lastCount = 0;
        timerCount = 0;
        console.log("TIMEOUT!");
        return;
    } else if (lastCount == overallCount) {
        timerCount++;
        console.log("tick");
        setTimeout(chartTimeUpdate, TIMER_DELAY);
        return;
    } else {
        lastCount = overallCount;
        timerCount = 0;
        console.log("UPDATE!");
        loadChart();
        setTimeout(chartTimeUpdate, TIMER_DELAY);
    }
}

function toggleComments(cb) {
    if (typeof cb.checked == "undefined" || cb.checked) {
        $("#comments").hide();
        $("#comments").empty();
    } else {
        $("#comments").show();
        $("#comments").append(commentHTML);
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
    $("#stats").append("<h3 class='error'>" + "Unable to find stats for your video. Make sure the url you have provided is valid and contains a valid video ID. (For example: https://www.youtube.com/watch?<b>v=1M5vGlvic_o</b>)" + "</h3>");
    $("#termSpace").append("<h3 class='error'>" + "There are no results to display for your video." + "</h3>");
    $("#commentSpace").append("<h3 class='error'>" + "Unable to find comments for your video." + "</h3>");
    $("#termSpace").removeClass("hidden");
    $("#commentSpace").removeClass("hidden");
    $("#results").removeClass("hidden");
                
}

function fetchResults() {
    // clean up
    $("#commentSpace").addClass("hidden");
    $("#termSpace").addClass("hidden");
    $("#results").addClass("hidden");
    $(".error").remove();
    $("#termResults").empty();
    $("#stats").empty();
    overallCount = 0;
    lastCount = 0;
    timerCount = 0;


    toggleComments($("#checkbox_comments"));

    displayMessage('Processing query...please wait', OKAY);
    var id = grabVideoId();
    $("#termSpace").append("<h3 class='error'>" + "There are no results to display for your video." + "</h3>");
    executeAsync(getVideoStats(id));
    chartTimeUpdate();
}


function getVideoStats(id) {
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
            $("#stats").append(title).append(description).append(image)
            $("#stats").append(videoStats);
            $("#results").removeClass("hidden");
            executeAsync(loadComments(1, "http://gdata.youtube.com/feeds/api/videos/" + id + "/comments?v=2&alt=json&max-results=" + 20));
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

function loadComments(count, url) {
    $.ajax({
        url: url,
        dataType: "jsonp",
        async: true,
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('error');
            console.log(errorThrown);
            console.log(jqXHR);
            displayMessage("Woops! Error retrieving comments. (" + errorThrown + ")", BAD);
            $("#termSpace").append("<h3 class='error'>" + "There are no results to display for your video." + "</h3>").removeClass("hidden");
            $("#commentSpace").append("<h3 class='error'>" + "Unable to find comments for your video." + "</h3>").removeClass("hidden");
        },
        success: function (data) {
            nextUrl = getNextPageUrl(data);
            console.log(nextUrl);
            $.each(data.feed.entry, function (key, val) {
                $("#commentSpace").removeClass("hidden");
                var comment = $("<li class='comment'></li>");
                var body = $("<div class='commentBody'></div>");

                var author = $("<h2 class='author'></h2>");
                author.html(val.author[0].name.$t);

                // comment id used for google + reply retrieval: val.id.$t.split("comment:")[1]
                // google+ id: val.yt$googlePlusUserId.$t
                // reply count: val.yt$replyCount.$t


                var googleID = val.yt$googlePlusUserId.$t;

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
                content.html(parseComment(val.content.$t));

                // find replies
                if (commentID != "N/A") {
                    appendComments(comment, commentID, 1, "");
                }

                body.append(author).append(content).append(userData);
                comment.append(body);
                commentHTML.append(comment);
                $("#h2_comments").html("Comments (" + count + ")");
                count++;

            });

            if (nextUrl != "")// && count < 100)
                executeAsync(loadComments(count, nextUrl));
            else {
                displayMessage('Completed query.', GOOD);
                //var end = new Date().getTime();
                //var time = end - start;
                //alert('Execution time: ' + time);
            }
        }
    });
}

function appendComments(commentParent, id, count, pageToken) {
    if (pageToken == "")
        url = "https://www.googleapis.com/plus/v1/activities/" + id + "/comments";
    else
        url = "https://www.googleapis.com/plus/v1/activities/" + id + "/comments?" + "pageToken=" + pageToken;

    gapi.client.request({ 'path': url }).then(function (resp) {
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
                content.html(parseComment(val.object.content));

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
                executeAsync(appendComments(commentParent, id, count, page));
        }
    }, function (reason) {
        commentParent.append('<li>Error loading reply: ' + reason.result.error.message + '</li>');
        displayMessage('Issue retrieving replies.', BAD);
    });
}

function parseComment(comment) {
    if (!loaded) {
        colorArray = Array(TERMS.length);

        data.addColumn('string', 'Video');
        data.addColumn('number', 'Votes');

        // Add rows
        data.addRows(TERMS.length);
        for (i = 0; i < TERMS.length; i++) {

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
            s = res.substring(0, index);
            t = res.substring(index, index + TERMS[i].length);
            v = res.substring(index + TERMS[i].length, res.length + 1);

            res = s + "<span class='" + TERMS[i] + " highlight'>" + t + "</span>" + v;    
            comment = res.toLowerCase();
            $("#termResults ." + TERMS[i]).remove();
            $("#termResults").append("<li class='" + TERMS[i] + "'>" + TERMS[i] + ": " + data.getValue(i, 1) + "</li>");
            $("#termSpace .error").remove();
        }
    }

    // sort
    //var mylist = $('#termResults');
    //var listitems = mylist.children('li').get();
    //listitems.sort(function (a, b) {
    //    return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    //})
    //$.each(listitems, function (idx, itm) { mylist.append(itm); });

    //// add the rest
    //for (i = 0; i < TERMS.length; i++) {
    //    if (termStats[i] == 0) {
    //        $("#termResults ." + TERMS[i]).remove();
    //        $("#termResults").append("<li class='" + TERMS[i] + "'>" + TERMS[i] + ": " + termStats[i] + "</li>");
    //    }
    //}

    $("#termSpace").removeClass("hidden");
    overallCount++;
    return res;
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
        colors: pieColors
    };


    drawChart('piechart', 'piechart', nonNullData, options);

    // BAR
    var options = {
        title: 'Vote results',
        chartArea: { width: '50%' },
        hAxis: { title: 'Votes' },
        vAxis: { title: 'Video' },
        animation: {
            duration: 1000,
            easing: 'out'
        },
        //fontName: 'Segoe UI',
        legend: {
            position: 'none',
        },
        minValue: 0
    };

    drawChart('barchart', 'barchart', nonNullData, options);
                
}