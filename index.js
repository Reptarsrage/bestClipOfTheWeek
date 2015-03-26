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
    // Retrieve your client ID from the Google APIs Console at
    // https://code.google.com/apis/console.
    var OAUTH2_CLIENT_ID = "1077489651789-gfg6h47916jhisojg8v29qguj4u1lclf.apps.googleusercontent.com";
    var OAUTH2_SCOPES = [
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/youtube.readonly'
    ];

    var ONE_MONTH_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30;

    // Keeps track of the currently authenticated user's YouTube user ID.
    var channelId;

    // For information about the Google Chart Tools API, see
    // https://developers.google.com/chart/interactive/docs/quick_start
    google.load('visualization', '1.0', { 'packages': ['corechart'] });

    // The Google APIs JS client invokes this callback automatically after loading.
    // See http://code.google.com/p/google-api-javascript-client/wiki/Authentication
    window.onJSClientLoad = function () {
        gapi.auth.init(function () {
            window.setTimeout(checkAuth, 1);
        });
    };

    // Attempt the immediate OAuth 2 client flow as soon as the page loads.
    // If the currently logged-in Google Account has previously authorized
    // OAUTH2_CLIENT_ID, then it will succeed with no user intervention.
    // Otherwise, it will fail and the user interface that prompts for
    // authorization will need to be displayed.
    function checkAuth() {
        gapi.auth.authorize({
            client_id: OAUTH2_CLIENT_ID,
            scope: OAUTH2_SCOPES,
            immediate: true
        }, handleAuthResult);
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

function fetchResults() {
    gapi.client.setApiKey('AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE');
    displayMessage('Processing query...please wait', OKAY);
    getVideoStats('1M5vGlvic_o');
    loadComments(1, "http://gdata.youtube.com/feeds/api/videos/" + '1M5vGlvic_o' + "/comments?v=2&alt=json&max-results=" + 20);
    $("#termSpace").attr("class", "");
    //hideMessage();
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

    var title, description, thumbUrl, thumbW, thumbH, viewCount, likeCount, dislikeCount, favoriteCount, commentCount;


    gapi.client.load('youtube', 'v3', function () {
        // See https://developers.google.com/youtube/v3/docs/videos/list
        var request = gapi.client.youtube.videos.list({
            part: 'statistics, snippet',
            id: id
        });
        request.execute(function (response) {
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
           $("#results").attr("class", "");
        }, function (reason) {
            displayMessage('Error loading stats: ' + reason.result.error.message, BAD);
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
            displayMessage("Woops! Error retrieving comments. \n" + errorThrown + "\n" + jqXHR, BAD);
        },
        success: function (data) {
            nextUrl = getNextPageUrl(data);
            console.log(nextUrl);
            $.each(data.feed.entry, function (key, val) {
                $("#commentSpace").attr("class", "");
                var comment = $("<li class='comment'></li>");

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


                comment.append(author).append(content).append(userData);
                $('#comments').append(comment);
                count++;

            });

            if (nextUrl != "")// && count < 40)
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


                    comment.append(author).append(content).append(userdata);
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
        for (i = 0; i < TERMS.length; i++) {
            termStats[i] = 0;
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
                "<span class='highlight'>" + t + "</span>" +
                res.substring(index + TERMS[i].length, res.length + 1);
            comment = res.toLowerCase();
            $("#termResults ." + TERMS[i]).remove();
            $("#termResults").append("<li class='" + TERMS[i] + "'>" + TERMS[i] + ": " + termStats[i] + "</li>");
            //$("#termSpace").attr("class", "");
        }
    }

    var mylist = $('#termResults');
    var listitems = mylist.children('li').get();
    listitems.sort(function (a, b) {
        return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    })
    $.each(listitems, function (idx, itm) { mylist.append(itm); });
    return res;
}