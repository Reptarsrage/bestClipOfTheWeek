const GOOD = 0;
const BAD = 1;
const OKAY = 2

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

(function () {
    window.onJSClientLoad = function () {
        handleAuthResult(true);
    }

    // Handle the result of a gapi.auth.authorize() call.
    function handleAuthResult(authResult) {
        if (authResult) {
            // Auth was successful. Hide auth prompts and show things
            // that should be visible after auth succeeds.
            displayMessage("Authorize - Success", GOOD);

            //loadAPIClientInterfaces();
        } else {
            // Auth was unsuccessful. Show things related to prompting for auth
            // and hide the things that should be visible after auth succeeds.
            displayMessage("Authorize - Failure", BAD);
        }
    }
})();

var termStats;
var colorArray;

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
    $("#comments").empty();
    $("#stats").empty();


    gapi.client.setApiKey('AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE');
    displayMessage('Processing query...please wait', OKAY);
    var id = grabVideoId();
    $("#termSpace").append("<h3 class='error'>" + "There are no results to display for your video." + "</h3>");
    getVideoStats(id);
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


    gapi.client.load('youtube', 'v3', function () {
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
                //thumbUrl = response.result.items[0].snippet.thumbnails.high.url;
                //thumbW = response.result.items[0].snippet.thumbnails.high.width;
                //thumbH = response.result.items[0].snippet.thumbnails.high.height;


                // stats
                viewCount = response.result.items[0].statistics.viewCount;
                likeCount = response.result.items[0].statistics.likeCount;
                dislikeCount = response.result.items[0].statistics.dislikeCount;
                favoriteCount = response.result.items[0].statistics.favoriteCount;
                commentCount = response.result.items[0].statistics.commentCount;

                // construct html
                title = "<h3><a href='https://www.youtube.com/watch?v=" + id + "'>" + title + "</a></h3>";
                description = "<h3 class='hidden'>" + description + "</h3>";

                viewCount = "<p>Views: " + viewCount + "</p>";
                likeCount = "<p>Likes: " + likeCount + "</p>";
                dislikeCount = "<p>Dislikes: " + dislikeCount + "</p>";
                favoriteCount = "<p>Favorites: " + favoriteCount + "</p>";
                commentCount = "<p>Comments: " + commentCount + "</p>";

                // add to DOM
                $("#stats").append(title).append(description).append(viewCount).append(likeCount).append(dislikeCount).append(favoriteCount).append(commentCount);
                $("#results").removeClass("hidden");
                loadComments(1, "http://gdata.youtube.com/feeds/api/videos/" + id + "/comments?v=2&alt=json&max-results=" + 20);
            } else {
                // no results
                showErrors();
                displayMessage("No results found for video with ID='" + id + "'.", OKAY);
            }
        }, function (reason) {
            displayMessage('Error loading stats: ' + reason.result.error.message, BAD);
            showErrors();
        });
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
        //gets the max first 50 results.  To get the 'next' 50, use &start-index=50
        dataType: "jsonp",
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
                $('#comments').append(comment);
                count++;

            });

            if (nextUrl != "" && count < 40)
                loadComments(count, nextUrl);
            else
                displayMessage('Completed query.', GOOD);
        }
    });
}




function appendComments(commentParent, id, count, pageToken) {
    gapi.client.load('plus', 'v1').then(function () {
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
                  //  commentParent.append(JSON.stringify(val));
                    count++;
                });

                if (typeof page !== 'undefined' && page != pageToken)
                    appendComments(commentParent, id, count, page);
            }
        }, function (reason) {
            commentParent.append('<li>Error loading reply: ' + reason.result.error.message + '</li>');
            displayMessage('Issue retrieving replies.', BAD);
        });
    });

}

function parseComment(comment) {
    if (!termStats) {
        termStats = Array(TERMS.length);
        colorArray = Array(TERMS.length);
        for (i = 0; i < TERMS.length; i++) {
            termStats[i] = 0;
            colorArray[i] = getRandomColor();
            $("<style>")
                .prop("type", "text/css")
                .html("\
                ."+ TERMS[i] +" {\
                    font-weight: bold; \
                    color: " + colorArray[i] + ";\
                }")
                .appendTo("head");
        }
    }

    var res = comment;
    var index = -1;
    var t;

    comment = comment.toLowerCase();

    for (i = 0; i < TERMS.length; i++) {
        if ((index = comment.indexOf(TERMS[i].toLowerCase())) > -1) {
            termStats[i]++;
            t = res.substring(index, index + TERMS[i].length);
            res = res.substring(0, index) +
                "<span class='" + TERMS[i] + " highlight'>" + t + "</span>" +
                res.substring(index + TERMS[i].length, res.length + 1);
            comment = res.toLowerCase();
            $("#termResults ." + TERMS[i]).remove();
            $("#termResults").append("<li class='" + TERMS[i] + "'>" + TERMS[i] + ": " + termStats[i] + "</li>");
            $("#termSpace .error").remove();
        }
    }

    // sort
    var mylist = $('#termResults');
    var listitems = mylist.children('li').get();
    listitems.sort(function (a, b) {
        return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    })
    $.each(listitems, function (idx, itm) { mylist.append(itm); });

    // add the rest
    for (i = 0; i < TERMS.length; i++) {
        if (termStats[i] == 0) {
            $("#termResults ." + TERMS[i]).remove();
            $("#termResults").append("<li class='" + TERMS[i] + "'>" + TERMS[i] + ": " + termStats[i] + "</li>");
        }
    }

    $("#termSpace").removeClass("hidden");
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