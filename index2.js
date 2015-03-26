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
            displayMessage("Authorize - Success");

            //loadAPIClientInterfaces();
        } else {
            // Auth was unsuccessful. Show things related to prompting for auth
            // and hide the things that should be visible after auth succeeds.
            displayMessage("Authorize - Failure");
        }
    }
})();

// Helper method to display a message on the page.
function displayMessage(message) {
    $('#message').text(message).show();
}

// Helper method to hide a previously displayed message on the page.
function hideMessage() {
    $('#message').hide();
}

function fetchResults() {
    gapi.client.setApiKey('AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE');
    loadComments(50, '1M5vGlvic_o');
    hideMessage();

}

function loadComments(count, videoID) {
    $.ajax({
        url: "http://gdata.youtube.com/feeds/api/videos/" + videoID + "/comments?v=2&alt=json&key=AIzaSyB_LOatFV88Yptvdv_ot_yvoQ9MZDKgdzE&max-results=" + count,
        //gets the max first 50 results.  To get the 'next' 50, use &start-index=50
        dataType: "jsonp",
        success: function (data) {
            var count = 1;
            $.each(data.feed.entry, function (key, val) {

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
                content.html(val.content.$t);

                // find replies
                if (commentID != "N/A") {
                    appendComments(comment, commentID, 1, "");
                }


                comment.append(author).append(content).append(userData);
                $('#comments').append(comment);
                count++;
                //$('#comments').append("<div style='font-size: 14px;' class='content'>" + JSON.stringify(data.feed.entry) + "</div>");
            });

        }
    });
}




function appendComments(commentParent, id, count, pageToken) {
    gapi.client.load('plus', 'v1').then(function () {
        displayMessage('loaded.');
        if (pageToken == "")
            url = "https://www.googleapis.com/plus/v1/activities/" + id + "/comments";
        else
            url = "https://www.googleapis.com/plus/v1/activities/" + id + "/comments?" + "&pageToken=" + pageToken;

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
                    content.html(val.object.content);

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
            commentParent('<li>Error: ' + reason.result.error.message + '</li>');
        });
    });

}