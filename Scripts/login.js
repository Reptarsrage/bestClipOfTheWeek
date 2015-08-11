/*
 * Justin Robb
 * 4/20/15
 * Best Clip of the Week Application
 * Login page
 */

//constants
const TIMER_DELAY = 500;
const MIN_TIMER_DELAY = 300;
const RAPID_TIMER_DELAY = 50;
const ROW_COUNT = 10;
const COL_COUNT = 10;

// vars
var backgroundImgArray;
var stopTimer = false;
var backgroundInit = false;
var backgroundComplete = false;
var backgroundImgQueue;

$(document).ready(function () {

    fillBackground();

    $("#login").click(function () {
        disable();
        if ($("#result").text().trim() != "")
            $("#result").fadeTo(50, 0);
        login();
    });
    $("#signup").click(function () {
        disable();
        if ($("#result").text().trim() != "")
            $("#result").fadeTo(50, 0);
        signup();
    });

    Utility.delayAfter(function () {
        $("#userid").focus();
    }, 0);

    $(document).keypress(function (e) {
        if (e.which == 13) {
            login();
        }
    });
});


function disable() {
    $("#userid").prop("disabled", true);
    $("#pswrd").prop("disabled", true);
    $("#login").prop("disabled", true);
    //$("#signup").prop("disabled", true);
}

function enable() {
    $("#userid").prop("disabled", false);
    $("#pswrd").prop("disabled", false);
    $("#login").prop("disabled", false);
    //$("#signup").prop("disabled", false);
}



function login() { /*function to check userid & password*/
    /*the following code checkes whether the entered userid and password are matching*/
    var username = $("#userid").val().trim();
    var password = $("#pswrd").val().trim();

    if (username == "" || password == "") {
        displayMessage("Please enter a valid username and password", BAD)/*displays error message*/
        return false;
    }

    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "GET",
        timeout: 10000,
        data: {
            username: username,
            password: password,
            login: 'login'
        },
        success: showResultStatus,
        error: showResultStatus
    });

    return true;
    
}

// Helper method to display a message on the page.
function displayMessage(message, good) {
    $('#result').text(message);

    if (good == GOOD) {
        $('#result').attr("class", "good");
        $('#result').fadeTo(1000, 1);
        var token = message;
        var username = $("#userid").val().trim();
        window.location = "index.html?username=" + username + "&token=" + token + "&version=" + VERSION;

    } else if (good == BAD) {
        $('#result').attr("class", "bad");
        $('#result').fadeTo(1000, 1);
        enable();
    } else {
        $('#result').attr("class", "okay");
        $('#result').fadeTo(1000, 1);
        enable();
    }
}

function showResultStatus(msg) {
    //#result
    if (!msg) {
        displayMessage("No message to display", GOOD)
    }
    // msg.status
    // msg.responseText
    // msg. statusText
    if (msg.hasOwnProperty("status")) {
        if (msg.status != 200)
            displayMessage(msg.status + " - " + msg.statusText + ". " + msg.responseText, BAD);
        else
            displayMessage(msg.responseText, GOOD);
    } else {
        displayMessage(msg, GOOD);
    }
}

function signup() { /*function to check userid & password*/
    /*the following code checkes whether the entered userid and password are matching*/
    var username = $("#userid").val().trim();
    var password = $("#pswrd").val().trim();

    if (username == "" || password == "") {
        displayMessage("Please enter a valid username and password", BAD)/*displays error message*/
        return false;
    }

    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "GET",
        timeout: 10000,
        data: {
            username: username,
            password: password,
            signup: 'signup'
        },
        success: showResultStatus,
        error: showResultStatus
    });

    return true;
}

function fillBackground() {
    backgroundInitialize();
    var url = "https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=StoneMountain64&maxResults=1";

    Utility.makeAsyncYouTubeAjaxRequest(url, null, function success(resp) {
        if (resp.items && resp.items.length > 0) {
            channelID = resp.items[0].id;
            requestVideoPlaylist(channelID);
        } else {
            console.log("Error: No channel found.");
            Utility.delayAfter(function () { fillBackground(); }, 1000);
        }
    }, function error(x, t, m) {
        console.log("Error: " + t + ". " + m + ".");
        Utility.delayAfter(function () { fillBackground(); }, 1000);
    });
}


// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(channelID, pageToken) {
    var url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=" + channelID + "&maxResults=20"

    if (pageToken) {
        url += "&pageToken="+pageToken;
    }
    
    Utility.makeAsyncYouTubeAjaxRequest(url, null,
        function success(response) {
            // Only show pagination buttons if there is a pagination token for the
            // next or previous page of results.
            nextPageToken = response.nextPageToken;
            var playlistItems = response.items;
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
            if (nextPageToken) {
                requestVideoPlaylist(channelID, nextPageToken);
            }
        },
        function error(x, t, m) {
            console.log("Error: " + t + ". " + m + ".");
            Utility.delayAfter(function () { requestVideoPlaylist(channelID, pageToken); }, 1000);
        });
}


// Retrieve the list of videos in the specified playlist.
function requestVideosInPlaylist(playlistId, pageToken) {
    var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistId + "&maxResults=20"


    if (pageToken) {
        url += "&pageToken=" + pageToken;
    }
    Utility.makeAsyncYouTubeAjaxRequest(url, null,
       function success(response) {

        nextPageToken = response.nextPageToken;

        var playlistItems = response.items;
        if (playlistItems) {
            $.each(playlistItems, function (index, item) {
                if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("default")) {
                    url = item.snippet.thumbnails.default.url;
                } else if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("high")) {
                    url = item.snippet.thumbnails.high.url;
                } else {
                    url = "";
                }
                if (url.length > 0) {
                    backgroundImgArray.push(url);
                }
            });
        }

        if (nextPageToken)
            requestVideosInPlaylist(playlistId, nextPageToken);
    }, function error(x, t, m) {
        // error
        console.log("Error: " + x.status + ". " + m + ".");
        Utility.delayAfter(function () { requestVideosInPlaylist(playlistId, pageToken); }, 1000);
    });
}

function backgroundUpdate() {
    if (stopTimer)
        return;
    displayBackgroundImage();

    if (backgroundComplete) {
        Utility.delayAfter(backgroundUpdate, Math.floor(Math.random() * 200) + MIN_TIMER_DELAY);
    } else {
        Utility.delayAfter(backgroundUpdate, RAPID_TIMER_DELAY);
    }
    
}


function displayBackgroundImage() {
    if (!backgroundInit || !backgroundImgArray || backgroundImgArray.length < 1)
        return;

    var row_num;
    var col_num;
    var elt;
    if (backgroundImgQueue.length > 0) {
        var next = backgroundImgQueue.pop()
        var row_num = Math.floor(next / ROW_COUNT) + 1;
        var col_num = Math.floor(next % COL_COUNT) + 1;
        elt = $("#" + row_num + ".row > #" + col_num + ".col");
        var front = elt.find(".front");
        var back = elt.find(".back");
        $(front).css('background-image', 'url(' + backgroundImgArray[Math.floor(Math.random() * backgroundImgArray.length)] + ')');
        $(back).css('background-image', 'url(' + backgroundImgArray[Math.floor(Math.random() * backgroundImgArray.length)] + ')');
    } else {
        backgroundComplete = true;
        var row_num = Math.floor(Math.random() * (ROW_COUNT + 1));
        var col_num = Math.floor(Math.random() * (COL_COUNT + 1));
        elt = $("#" + row_num + ".row > #" + col_num + ".col");
    }

    if (Math.random() >= 0.5)
        elt.find(".card").flip(true);
    else
        elt.find(".card").flip(false);
}

function backgroundInitialize() {
    if (!backgroundInit) {
        backgroundImgArray = new Array();
        overallCount = 0;
        lastCount = 0;
        timerCount = 0;
        backgroundImgQueue = new Array();
        for (row = 1; row <= ROW_COUNT; row++) {
            var row_div = $("<div id='" + row + "' class='row'></div>");
            for (col = 1; col <= COL_COUNT; col++) {
                var col_div = $("<div id='" + col + "' class='col' ></div>");
                var flipper = $("<div class='card'><div class='front'></div><div class='back'></div></div>");
                flipper.flip({
                    trigger: 'manual',
                    axis: 'y',
                    speed: 1000,
                });

                col_div.append(flipper);
                row_div.append(col_div);
                backgroundImgQueue.push((row - 1) * 10 + (col - 1));
            }
            $("#backgorund_grid").append(row_div);
        }
        backgroundInit = true;
        backgroundImgQueue = shuffle(backgroundImgQueue);
        backgroundUpdate();
    }
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
