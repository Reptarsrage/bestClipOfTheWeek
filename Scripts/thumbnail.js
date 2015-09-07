﻿/*
 * Justin Robb
 * 9/03/15
 * Best Clip of the Week Application
 * Thumbnail page
 */

window.addEventListener('resize', function (event) {

});
/*
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
*/
$(document).ready(function () {
    // tool-tips
    // Utility.configureTooltipForPage('thumbnail'); TODO: Tooltips for this page

    $("#a_index").prop("href", "index.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_config").prop("href", "config.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_quick").prop("href", "quick.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_comments").prop("href", "comments.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);


    $(".loading, .error, .1hide, .2hide").hide();

    $("#button_fetch_image2").click(function () {
        fetchThumbnail(2);
    });

    $("#button_fetch_image1").click(function () {
        fetchThumbnail(1);
    });

    $("#input_2").val("https://www.youtube.com/watch?v=vjW8wmF5VWc");
    $("#input_1").val("https://www.youtube.com/watch?v=vjW8wmF5VWc");
});

////////////////////////////////// FUNCTIONS ////////////////////////////////
function fetchThumbnail(num) {
    if (num != 1 && num != 2) {
        // error
        Utility.displayMessage('Error loading thumbnail: Invalid object number.');
        return;
    }

    var url, containerId;
    if (num == 1) {
        url = $("#input_1").val();
        containerId = "div_image1";
        $(".1hide").fadeIn();
    } else {
        url = $("#input_2").val();
        containerId = "div_image2"
        $(".2hide").fadeIn();
        
    }


    var videoId = url.match(/v=[^&]*/gi)[0].replace("v=", "");

    if (!videoId || videoId.length <= 0) {
        // error
        Utility.displayMessage('Error loading thumbnail: Invalid video ID');
        return;
    }

    getVideoThumbnail(videoId, containerId, num);
}



function getVideoThumbnail(id, containerId, num) {
    $("#" + containerId + " .img_thumb").remove();
    $("#" + containerId).parent().find(".view_image").prop("disabled", true);
    $("#" + containerId).parent().find(".download").prop("disabled", true);


    var url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&maxResults=1"

    Utility.makeAsyncYouTubeAjaxRequest(url, null,
       function success(response) {
           if (response.pageInfo.totalResults > 0 && response.items.length > 0) {
               // snippet
               thumbUrl = response.items[0].snippet.thumbnails.high.url;
               var img = $("<img src='" + thumbUrl + "' alt='thumbnail' class='img_thumb' />")
               img.hide();
               img.css("height", "360px");
               img.css("width", "480px");
               $("#" + containerId + " .loading").fadeOut(500);
               $("#" + containerId).append(img);
               img.fadeIn(500);

               $("#" + containerId).parent().find(".title").text(response.items[0].snippet.title);
               $("#" + containerId).parent().find(".resolution").text("Resolution: " + response.items[0].snippet.thumbnails.standard.width + " x " + response.items[0].snippet.thumbnails.standard.height);
               $("#" + containerId).parent().find(".url").append("Direct Url: <a href='" + response.items[0].snippet.thumbnails.standard.url + "' target='_blank'>" + response.items[0].snippet.thumbnails.standard.url + "</a>");

               $("#" + containerId).parent().find(".view_image").click(function () {
                   window.open(response.items[0].snippet.thumbnails.standard.url);
               });
               $("#" + containerId).parent().find(".view_image").prop("disabled", false);

               $("#" + containerId).parent().find(".download").click(function () {
                   downloadThumbnail(response.items[0].snippet.thumbnails.standard.url, $("#" + containerId).parent().find(".download"), id, num);
               });
               $("#" + containerId).parent().find(".download").prop("disabled", false);
             } else {
               // no results
               $("#" + containerId + " .loading").fadeOut(500);
               $("#" + containerId + " .error").fadeIn(500);
               Utility.displayMessage('Error loading thumbnail: No video found with Id ' + id);
           }
       }, function error(x, t, m) {
           // error 
           $("#" + containerId + " .loading").fadeOut(500);
           $("#" + containerId + " .error").fadeIn(500);
           Utility.displayMessage('Error loading thumbnail: ' + x.status + ". " + m, BAD);
       });
}


function downloadThumbnail(url, button, id, num) {
    button.prop("disabled", true);

    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "POST",
        timeout: 5000,
        cache: false,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: {
            username: urlParams['username'],
            token: urlParams['token'],
            thumbnail: url,
            filename: id + '_thumbnail'+num+'.png'
        },
        success: function (resp) {
            if (resp["error"]) {
                // error
                Utility.displayMessage("Unable to download image. Please try again.", BAD);
                console.log("Error with image response: " + resp.error.message);
                button.prop("disabled", false);
            } else {
                console.log("download success " + "https://bestclipoftheweek-1xxoi1ew.rhcloud.com/?file=" + resp);
                $("#message").fadeOut(500);
                window.location = "https://bestclipoftheweek-1xxoi1ew.rhcloud.com/?file=" + resp;
                Utility.delayAfter(function () { deleteThumbnail(resp, button); }, 1000);
            }
        },
        error: function (x, t, m) {
            console.log("Error getting image: " + t + ': ' + x.status + ". " + x.message + t + m);
            Utility.displayMessage("Unable to download image. Please try again.", BAD);
            button.prop("disabled", false);        }
    });
}


function deleteThumbnail(file, button) {
    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "POST",
        timeout: 5000,
        cache: false,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: {
            username: urlParams['username'],
            token: urlParams['token'],
            delete_file: file,
        },
        success: function (resp) {
            if (resp["error"]) {
                // error
                console.log("Error with deleting image. Response: " + resp.error.message);
                button.prop("disabled", false);
            } else {
                console.log("delete " + resp);
                button.prop("disabled", false);
            }
        },
        error: function (x, t, m) {
            console.log("Error deleting image: " + t + ': ' + x.status + ". " + x.message + t + m);
            button.prop("disabled", false);
        }
    });
}
