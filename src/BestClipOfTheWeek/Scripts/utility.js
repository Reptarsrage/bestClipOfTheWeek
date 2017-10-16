/*
Justin Robb
8/20/15
bestClipOfTheWeek
Utility functions (shared)
*/

"use strict";

// Constants
var GOOD = 0;
var BAD = 1;
var OKAY = 2;
var WARNING = 3;
var ANIMATION_TIME = 500;

var Utility = Utility || {
    delayAfter: function executeAsync(func, delay) {
        delay = typeof delay !== 'undefined' ? delay : 0;
        setTimeout(func, delay);
    },
    makeAsyncYouTubeAjaxRequest: function (url, data, success, error) {
        url += "&key=" + YOUTUBE_API_KEY;
        $.ajax({
            url: url,
            type: "GET",
            timeout: 5000,
            cache: false,
            data: data,
            success: function (response) {
                if (!response) {
                    error({ status: "Error" }, 500, "No response from server.");
                    return;
                }

                if (response["error"]) {
                    // error
                    error(x, response["error"]["code"], response["error"]["message"]);
                    return;
                }

                success(response);
            },
            error: function (x, t, m) {
                console.log(t + ': ' + x.status + ". " + m);
                error(x, t, m);
            }
        });
    },
    // Helper method to display a message on the page.
    displayMessage: function (message, good) {
        console.log(good + ": " + message);
        if (message.length > 100)
            message = message.substring(0, 100);
        $('#message .alert').fadeOut(500);
        if (good === GOOD) {
            $('#message .alert.alert-success .message').text(message);
            $('#message .alert.alert-success').fadeIn(500);
        } else if (good === BAD) {
            $('#message .alert.alert-danger .message').text(message);
            $('#message .alert.alert-danger').fadeIn(500);
        } else {
            $('#message .alert.alert-info .message').text(message);
            $('#message .alert.alert-info').fadeIn(500);
        }
    },
    // Helper method to display a message on the page.
    displayLoading: function (message, percentage) {
        if ($('#message .alert').is(":visible")) {
            $("#progress").collapse('hide');
            $("#progress .progress-bar").attr("aria-valuenow", 0);
            $("#progress .progress-bar .progress-text").html("");
            return;
        }
        $("#progress").collapse('show');
        var percent = Math.floor(percentage * 100);
        $("#progress .progress-bar").attr("aria-valuenow", percent).css('width', percent + "%");
        $("#progress .progress-bar .progress-text").html(message);
    },
    addToSortedList: function (listElt, elt) {
        var name = elt;
        if (name !== '') {
            var toinsert = true;
            $(listElt).children("li:not(.error)").each(function () {
                var item = $(this).html();
                if (name.toUpperCase() < item.toUpperCase()) {
                    if (toinsert) {
                        $(this).before('<li>' + name + '</li>');
                        toinsert = false;
                    }
                }
            });
            if (toinsert) {
                $(listElt).append('<li>' + name + '</li>');
            }
        }
    },
    grabVideoId: function (url) {
        //https://www.youtube.com/watch?v=zPQZ8psBwO4
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
    },
    getRandomColor: function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },
    configureTooltipForPage: function (page) {
        $('[data-toggle="tooltip"]').each(function (index) {
            var name = $(this).attr("name");
            $(this).attr("title", TOOL_TIPS[page][name]);
        });
        $('[data-toggle="tooltip"]').tooltip();
    },
    loadStart: function (elt, callback) {
        callback = callback || function() { return; };
        $(elt).children(".error:visible").hide();
        $(elt).children(".loading:hidden").fadeIn(ANIMATION_TIME, callback);
    },
    loadComplete: function (elt, callback) {
        callback = callback || function() { return; };
        $(elt).children(".error:visible").hide();
        $(elt).children(".loading:visible").fadeOut(ANIMATION_TIME, callback);
    },
    error: function (elt, callback) {
        callback = callback || function() { return; };
        $(elt).children(".loading:visible").fadeOut(ANIMATION_TIME);
        $(elt).children(".error:hidden").fadeIn(ANIMATION_TIME, callback);
    },
    wipe: function (elt) {
        $(elt).find("*").filter(":not(.loading, .error, .svgContainer)").remove();
    }
};