"use strict";

var Report = Report || (function ($, w, d) {
    var App = {},
        Utils = {},
        Events = {},
        Public = {};

    // Constants
    var TIMER_DELAY = 2500;
    var MAX_TIMER_COUNT = 120 / (TIMER_DELAY / 1000);
    var PLAYLIST_TITLE = "World's Best Clip of the Week";
    var CHARTS = {
        COLUMNCHART: 1,
        BARCHART: 2,
        PIECHART: 3
    };

    // Variables
    var ConfiguredTermArray = null;
    var ConfiguredColorArray = null;
    var StartTime, EndTime;
    var Loaded = false;
    var Data = null;
    var $CommentHTML = $("<ul></ul>");
    var OverallCount = 0;
    var LastCount = 0;
    var TimerCount = 0;
    var GapiPieChart = null, GapiBarChart = null, GapiColumnChart = null;
    var GapiPieChartOptions = null, GapiPieChartData = null;
    var GapiBarChartOptions = null, GapiBarChartData = null;
    var GapiColumnChartOptions = null, GapiColumnChartData = null;
    var FetchID = 0;
    var Voters = new Array();
    var $VotersHtml = $("<ol></ol>");
    var VideoHistoryStats;
    var RetryCt = 25;
    var TotalComments = 0;
    var SelectedVideoId = "";
    var ComRplyCt = 0;
    var BestClipOfTheWeekPlaylistID = null;

    Utils = {
        redrawCharts: function () {
            if (GapiPieChart != null) {
                GapiPieChart.draw(GapiPieChartData, GapiPieChartOptions);
            }

            if (GapiBarChart != null) {
                GapiBarChart.draw(GapiBarChartData, GapiBarChartOptions);
            }

            if (GapiColumnChart != null) {
                GapiColumnChart.draw(GapiColumnChartData, GapiColumnChartOptions);
            }
        },
        drawChart: function (chartType, containerID, dataTable, options) {
            var chart;
            var containerDiv = document.getElementById(containerID);

            if (!$("#" + containerID).is(":visible")) {
                return;
            }

            if (chartType === CHARTS.BARCHART) {
                if (GapiBarChart == null) {
                    GapiBarChart = new google.visualization.BarChart(containerDiv);
                }
                chart = GapiBarChart;
                GapiBarChartOptions = options;
                GapiBarChartData = dataTable;
            } else if (chartType === CHARTS.COLUMNCHART) {
                if (GapiColumnChart == null) {
                    GapiColumnChart = new google.charts.Bar(containerDiv);
                }
                chart = GapiColumnChart;
                GapiColumnChartOptions = options;
                GapiColumnChartData = dataTable;
            } else if (chartType === CHARTS.PIECHART) {
                if (GapiPieChart == null) {
                    GapiPieChart = new google.visualization.PieChart(containerDiv);
                }
                chart = GapiPieChart;
                GapiPieChartOptions = options;
                GapiPieChartData = dataTable;
            } else {
                console.log("Unknown chart type " + chartType);
                return false;
            }

            Utility.loadComplete($("#" + containerID).parent())
            chart.draw(dataTable, options);
        },
        loadTermSpaceCharts: function () {
            // get only non zero vals
            var nonNullData = new google.visualization.DataTable();
            var pieColors = Array(ConfiguredTermArray.length);

            nonNullData.addColumn('string', 'Video');
            nonNullData.addColumn('number', 'Votes');
            nonNullData.addColumn({ type: 'string', role: 'style' });
            nonNullData.addColumn({ type: 'string', role: 'annotation' });
            var total = 0;
            for (var j = 0; j < Data.getNumberOfRows(); j++) {
                total += Data.getValue(j, 1);
            }

            var x = 0;
            for (var i = 0; i < Data.getNumberOfRows(); i++) {
                pieColors[i] = "#FFFFFF";
                if (Data.getValue(i, 1) > 0) {
                    nonNullData.addRows(1);
                    nonNullData.setCell(x, 0, Data.getValue(i, 0));
                    nonNullData.setCell(x, 1, Data.getValue(i, 1));
                    nonNullData.setCell(x, 2, 'color: ' + ConfiguredColorArray[i]);
                    nonNullData.setCell(x, 3, (Data.getValue(i, 1) / total * 100).toFixed(2) + "%");
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
                    fontSize: '24pt'
                }
            };


            Utility.delayAfter(function () {
                Utils.drawChart(CHARTS.PIECHART, 'piechartSVGContainer', nonNullData, options);
                App.updateTermsCount();
            }, ANIMATION_TIME);

            // BAR
            var baroptions = {
                backgroundColor: { fill: 'transparent' },
                theme: 'maximized',
                chartArea: {
                    backgroundColor: 'transparent'
                },
                hAxis: {
                    title: 'Votes',
                    position: 'none'
                },
                vAxis: {
                    title: 'Video',
                    position: 'none'
                },
                animation: {
                    duration: 500,
                    easing: 'linear'
                },
                legend: {
                    position: 'none'
                },
                axisTitlesPosition: 'none',
                annotations: {
                    highContrast: true,
                    textStyle: {
                        color: 'black',
                        fontSize: '24pt'
                    }
                }
            };

            Utils.drawChart(CHARTS.BARCHART, 'barchartSVGContainer', nonNullData, baroptions);
            App.updateTermsCount();
        },
        loadStatsSpaceCharts: function (response) {
            // draw column chart
            var nonNullData = new google.visualization.DataTable();

            nonNullData.addColumn('string', '');
            nonNullData.addColumn('number', 'Views');
            nonNullData.addColumn('number', 'Comments');
            nonNullData.addColumn('number', 'Likes');

            VideoHistoryStats.sort(function (a, b) {
                var date1 = new Date(a[5]);
                var date2 = new Date(b[5]);
                if (date1 > date2)
                    return -1;
                else if (date1 === date2)
                    return 0;
                else
                    return 1;
            });


            for (var pos = 0; pos < VideoHistoryStats.length; pos++) {
                if (VideoHistoryStats[pos][0] === response.items[0].snippet.title)
                    break;
            }
            var high = Math.min(pos + 4, VideoHistoryStats.length - 1);
            var low = Math.max(pos - 4, 0);

            for (var i = high; i >= low; i--) {
                nonNullData.addRows([["BCotW #" + (VideoHistoryStats.length - i)
                    , parseInt(VideoHistoryStats[i][1])
                    , parseInt(VideoHistoryStats[i][2])
                    , parseInt(VideoHistoryStats[i][3])]]);
            }

            var options = {
                backgroundColor: 'transparent',
                animation: {
                    startup: true,
                    easing: 'out',
                    duration: 'slow'
                },
                haxis: {
                    slantedText: true
                },
                chart: {
                    title: 'Video Statistics',
                    subtitle: 'With comparison to similar videos'
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
                        likes: { side: 'right', label: 'Likes / Comments' } // Right y-axis.
                    }
                },
                legend: {
                    position: 'none'
                }
            };
            Utils.drawChart(CHARTS.COLUMNCHART, 'columnchartSVGContainer', nonNullData, google.charts.Bar.convertOptions(options));
        },
        downloadPieChart: function () {
            $("#downloadPieChart").prop("disabled", true);
            download(GapiPieChart.getImageURI(), 'piechart.png', "image/png");
            $("#downloadPieChart").prop("disabled", false);
        },
        addUrlToInput: function (url, elt) {
            if ($(elt).hasClass("active")) {
                $(elt).removeClass("active");
                $("#input_video").val("");
                return true;
            }

            $("#recommendedVideosList li.active").removeClass("active");
            $(elt).addClass("active");

            $("#input_video").val(url);
        },
        chartTimeUpdate: function (currFetchID) {
            if (currFetchID !== FetchID || TimerCount > MAX_TIMER_COUNT) {
                OverallCount = 0;
                LastCount = 0;
                TimerCount = 0;
                // TIMEOUT!
                return;
            } else if (LastCount === OverallCount) {
                TimerCount++;
                // tick
                Utility.delayAfter(function () { Utils.chartTimeUpdate(currFetchID); }, TIMER_DELAY);
                return;
            } else {
                LastCount = OverallCount;
                TimerCount = 0;
                // UPDATE!
                Utils.loadTermSpaceCharts();
                Utility.delayAfter(function () { Utils.chartTimeUpdate(currFetchID); }, TIMER_DELAY);
            }
        },
        toggleComments: function (cb, manual) {
            if (manual) {
                $("#checkbox_voters").prop('checked', false);
                Utils.toggleVoters($("#checkbox_voters"), false);
            }

            if (cb.prop('checked')) {
                $("#comments").collapse('show');
                $("#comments").append($CommentHTML);
                $(".commentBody").off('hover').hover(function () {
                    // in
                    $(this).find("span.highlight").css("font-size", "14pt");
                }, function () {
                    // out
                    $(this).find("span.highlight").css("font-size", "12pt");
                });
            } else {
                $("#comments").collapse('hide');
                Utility.wipe($("#comments"));
                $(".commentBody").off('hover');
            }
        },
        toggleVoters: function (cb, manual) {
            if (manual) {
                $("#checkbox_comments").prop('checked', false);
                Utils.toggleComments($("#checkbox_comments"), false);
            }

            if (cb.prop('checked')) {
                $("#voters").collapse('show');
                $("#voters").append($VotersHtml);
            } else {
                $("#voters").collapse('hide');
                Utility.wipe($("#voters"));
            }
        },
        fetchComplete: function () {
            Utility.displayMessage('Completed query.', GOOD);
            $("#progress").collapse('hide');
            EndTime = new Date().getTime();
            var time = (EndTime - StartTime) / 1000.00;
            console.log('Execution time: ' + time + " seconds");
        }
    };

    Events = {
        init: function () {
            $("#checkbox_comments, .checkbox_comments").click(function () { Utils.toggleComments($('#checkbox_comments'), true); });
            $("#checkbox_voters, .checkbox_comments").click(function () { Utils.toggleVoters($('#checkbox_voters'), true); });
            $("#fetch").click(App.fetchResults);
            $("#downloadPieChart").click(Utils.downloadPieChart);
            window.addEventListener('resize', Utils.redrawCharts);
        }
    };

    App = {
        initOnLoad: function () {
            // get terms and colors
            $("#fetch").prop("disabled", true);
            $("#downloadPieChart").prop("disabled", true);
            $("#fetch").prop("title", "Please wait for terms to be loaded");

            // tool-tips
            Utility.configureTooltipForPage('index');

            // Events
            Events.init();

            // start off hiding errors, will be shown as they crop up
            $(".error").hide();
            $(".loading").show();

            // hide all sections (will show one at a time as it completes
            $("#commentSpace").collapse('hide');
            $("#termSpace").collapse('hide');
            $("#statsSpace").collapse('hide');
            $("#results").collapse('hide');
            $("#progress").collapse('hide');
            Utils.toggleVoters($("#checkbox_voters"), false);
            Utils.toggleComments($("#checkbox_comments"), false);

            // load user terms
            App.loadTermsAndColors();
        },
        googleChartsLoaded: function () {
            Data = new google.visualization.DataTable();
            App.initOnLoad();

            App.populateBestOfTheWeek(
                function success(historyStats, listElt) {
                    VideoHistoryStats = historyStats;
                    Utility.loadComplete($("#recommendedVideosList"), function () { $("#recommendedVideosList").append(listElt); });
                },
                function error(x, t, m) {
                    Utility.wipe($("#recommendedVideosList"));
                    Utility.error($("#recommendedVideosList"));
                });
        },
        updateTermsCount: function () {
            // sort
            var mylist = ConfiguredTermArray.slice();
            if (mylist && mylist.length > 1) {
                mylist.sort(function (a, b) {
                    var anum = a[1];
                    var bnum = b[1];

                    if (anum !== bnum)
                        return bnum - anum;
                    else
                        return a[0].toUpperCase().localeCompare(b[0].toUpperCase());
                });

                Utility.loadComplete($("#termResults_list"));
                Utility.wipe($("#termResults_list"));

                $.each(mylist, function (idx, itm) {
                    if (itm[1] > 0) {
                        $("#termResults_list").append("<div class='list-group-item " + itm[0] + "'>" + itm[0] + ": " + itm[1] + "</div>");
                    }
                });

                if ($("#termResults_list .list-group-item:not(.error)").length > 0) {
                    $("#termResults_list").append("<div class='list-group-item disabled'>&nbsp;</div>");
                }

                $.each(mylist, function (idx, itm) {
                    if (itm[1] === 0) {
                        $("#termResults_list").append("<div class='list-group-item disabled'>" + itm[0] + ": " + itm[1] + "</div>");
                    }
                });
            }
        },
        fetchResults: function () {
            // clean up
            Utility.wipe($("#termResults_list, #piechart, #barchart, #columnchart, #comments, #voters"));
            $("input[type='checkbox']").prop('disabled', false);
            $("#h2_comments").html('0');
            $("#stats_group").css("background-image", "url()");
            $(".js-wipe").empty();
            $("#downloadPieChart").prop("disabled", true);

            // start off hiding errors, will be shown as they crop up
            $(".error").filter(":not(#userSpace .error)").hide();

            // starting off showing all loading images, will hide as they load
            $(".loading").filter(":not(#userSpace .loading)").show();

            // hide all sections (will show one at a time as it completes
            $("#commentSpace").collapse('hide');
            $("#termSpace").collapse('hide');
            $("#statSpace").collapse('hide');
            $("#userSpace").collapse('hide');
            $("#progress").collapse('hide');
            Utils.toggleVoters($("#checkbox_voters"), false);
            Utils.toggleComments($("#checkbox_comments"), false);

            //reset
            StartTime = 0, EndTime = 0;
            Loaded = false;
            Data = new google.visualization.DataTable();
            $CommentHTML = $("<ul></ul>");
            OverallCount = 0;
            LastCount = 0;
            TimerCount = 0;
            GapiPieChart = null, GapiBarChart = null, GapiColumnChart = null;
            GapiPieChartOptions = null, GapiPieChartData = null;
            GapiBarChartOptions = null, GapiBarChartData = null;
            GapiColumnChartOptions = null, GapiColumnChartData = null;
            Voters = new Array();
            $VotersHtml = $("<ol></ol>");
            RetryCt = 25;
            TotalComments = 0;
            ComRplyCt = 0;
            FetchID++;

            // Start
            if (ConfiguredColorArray == null || ConfiguredTermArray == null) {
                Utility.displayMessage("Unable to load terms for user.", BAD);
                return false;
            }

            // PHASE 1
            $("#results").collapse('show');
            StartTime = new Date().getTime();
            Utility.displayLoading('Processing query...please wait', 0.01);
            var id = Utility.grabVideoId($("#input_video").val());
            SelectedVideoId = id;
            Utility.delayAfter(function () { App.getVideoStats(id, FetchID); }, ANIMATION_TIME);
            Utils.chartTimeUpdate(FetchID);
            $("#statsSpace").collapse('show');
        },
        getVideoStats: function (id, currFetchID) {
            if (currFetchID !== FetchID) {
                return;
            }

            if (!id || id.length === 0) {
                // no results
                Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
                return;
            }

            var url = "https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=" + id + "&maxResults=1";
            Utility.makeAsyncYouTubeAjaxRequest(url, null,
                function success(response) {
                    if (response.pageInfo.totalResults > 0 && response.items.length > 0) {
                        // snippet
                        var title = response.items[0].snippet.title;
                        var description = response.items[0].snippet.description;
                        var thumbUrl = response.items[0].snippet.thumbnails.high.url;
                        var thumbW = response.items[0].snippet.thumbnails.high.width;
                        var thumbH = response.items[0].snippet.thumbnails.high.height;

                        // stats
                        var viewCount = response.items[0].statistics.viewCount;
                        var likeCount = response.items[0].statistics.likeCount;
                        var dislikeCount = response.items[0].statistics.dislikeCount;
                        var favoriteCount = response.items[0].statistics.favoriteCount;
                        var commentCount = response.items[0].statistics.commentCount;
                        TotalComments = commentCount;

                        // html
                        Utility.loadComplete($("#stats_group"));

                        $("#stats_group").css('background-image', "url(" + thumbUrl + ")");
                        $("#img_overlay_link").prop("href", "https://www.youtube.com/watch?v=" + id).html(title);
                        $("#img_overlay_desc").html(description);
                        $("#div_video_stats_views").html(viewCount);
                        $("#div_video_stats_likes").html(likeCount);
                        $("#div_video_stats_dislikes").html(dislikeCount);
                        $("#div_video_stats_favorites").html(favoriteCount);
                        $("#div_video_stats_comments").html(commentCount);

                        Utility.delayAfter(function () {
                            // PHASE 2
                            Utility.loadComplete($("#commentSpace"));
                            $("#commentSpace").collapse('show');
                            App.loadComments(1,
                                "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&order=relevance&videoId=" +
                                id + "&maxResults=" + 20, currFetchID);
                            $("#downloadPieChart").prop("disabled", false);
                            $("#termSpace").collapse('show');
                        });
                        Utils.loadStatsSpaceCharts(response);
                        App.updateTermsCount();

                    } else {
                        // no results
                        Utility.error($("#statsSpace"));
                        Utility.displayMessage("No results found for video with ID='" + id + "'.", OKAY);
                        $("#stats_group").hide();
                        $("#columnchart").hide();
                        return;
                    }
                }, function error(x, t, m) {
                    FetchID++;
                    Utility.error($("#statsSpace"));
                    Utility.displayMessage('Error loading stats: ' + x.status + ". " + m, BAD);
                    $("#stats_group").hide();
                    $("#columnchart").hide();
                });
        },
        loadComments: function (count, url, currFetchID) {
            if (currFetchID !== FetchID)
                return;

            Utility.loadComplete($("#comments"))

            // Get YouTube Comments
            Utility.makeAsyncYouTubeAjaxRequest(url, null,
                function success(data) {
                    if (currFetchID !== FetchID)
                        return;

                    var nextUrl = "";
                    if (data["nextPageToken"] && data["nextPageToken"].length > 0) {
                        nextUrl = url;
                        if (nextUrl.indexOf("pageToken") > 0) {
                            nextUrl = nextUrl.replace(/pageToken=.*$/, "pageToken=" + data["nextPageToken"]);
                        } else {
                            nextUrl += "&pageToken=" + data["nextPageToken"];
                        }
                    }

                    if (nextUrl) {
                        var nextCt = count + data.pageInfo.totalResults;
                        Utility.delayAfter(function () { App.loadComments(nextCt, nextUrl, currFetchID); });
                    }

                    $.each(data["items"], function (key, val) {
                        var $comment = $("<li class='comment'></li>");
                        var $body = $("<div class='commentBody'></div>");

                        var $author = $("<strong class='author'></strong>");
                        var authorName = val.snippet.topLevelComment.snippet.authorDisplayName;
                        $author.html(authorName);

                        var googleID = val.snippet.topLevelComment.snippet.authorGoogleplusProfileUrl;
                        var replyCt = val.snippet.totalReplyCount;
                        var commentID = val.id;
                        var publishedAt = val.snippet.topLevelComment.snippet.publishedAt;

                        var $userData = $("<div class='commentData'></div>");
                        $userData.html("<p> Reply number: " + count + "</p>" +
                            "<p> Google+:<a href='" + googleID + "' target='_blank'>" + googleID + "</a></p>" +
                            "<p> ReplyCt: " + replyCt + "</p>" +
                            "<p> Posted: " + publishedAt + "</p>");

                        var $content = $("<div class='content'></div>");
                        $content.html(App.parseComment(val.snippet.topLevelComment.snippet.textDisplay, currFetchID, authorName));

                        // find replies
                        if (replyCt > 0) {
                            App.loadCommentReplies($comment, commentID, 1, "", currFetchID);
                        }

                        $body.append($author).append($content).append($userData);
                        $body.hover(function () {
                            // in
                            $(this).find("span.highlight").css("font-size", "1.5em");
                        }, function () {
                            // out
                            $(this).find("span.highlight").css("font-size", "1em");
                        });

                        $comment.append($body);
                        $CommentHTML.append($comment);
                        Utility.displayLoading('Processing query...please wait', count / TotalComments);
                        $("#h2_comments").html(count + ComRplyCt);
                        count++;
                    });

                    if (!nextUrl) {
                        // Get google+ comments if any exist
                        Utility.displayLoading('Getting commenters from Google+...please wait', count / TotalComments);
                        App.getGooglePlusComments(SelectedVideoId, function (comment, author) {
                            var commentElt = $("<li class='comment googlePlus'></li>");
                            var body = $("<div class='commentBody'></div>");
                            var authorElt = $("<strong class='author'>" + author + "</strong>");
                            var userData = $("<div class='commentData'></div>");
                            userData.html("<p> reply number: " + count + "</p>" +
                                "<p>Retrieved from Google+</p>" +
                                "<p>No further information loaded for this comment</p>");

                            var content = $("<div class='content'>" + App.parseComment(comment, currFetchID, author) + "</div>");
                            body.append(authorElt).append(content).append(userData);
                            body.hover(function () {
                                // in
                                $(this).find("span.highlight").css("font-size", "1.5em");
                            }, function () {
                                // out
                                $(this).find("span.highlight").css("font-size", "1em");
                            });

                            if (author === "StoneMountain64") {
                                commentElt.prop("id", "googlePlusMasterComment");
                                commentElt.append(body);
                                $CommentHTML.prepend(commentElt);
                            } else {
                                commentElt.append(body);
                                $CommentHTML.find("#googlePlusMasterComment").append(commentElt);
                            }
                            $("#h2_comments").html(count);
                            Utility.displayLoading('Getting comments from Google+...please wait', count / TotalComments);
                            count++;
                        }, function (x, t, m) {
                            console.log("Error loading google+ comments." + x + t + m);
                            Utils.fetchComplete();
                        }, function () {
                            Utils.fetchComplete();
                        });
                    }
                }, function error(x, t, m) {
                    if (currFetchID !== FetchID)
                        return;

                    console.log("Error loading comments: " + x.status + ". " + m);

                    // try again
                    RetryCt--;
                    if (RetryCt > 0) {
                        Utility.delayAfter(function () { App.loadComments(count, url, currFetchID); }, 500);
                    } else {
                        // give up
                        FetchID++;
                        Utility.error($("#termSpace, #commentSpace, #comments, #voters"), function () {
                            $("#h2_comments").html('Error');
                        });
                        $("input[type='checkbox']").prop('checked', false);
                        $("input[type='checkbox']").prop('disabled', true);
                        Utility.displayMessage("Error loading comments: " + x.status + ". " + m, BAD);
                    }
                });
        },
        loadCommentReplies: function (commentParent, id, count, pageToken, currFetchID) {
            if (currFetchID !== FetchID)
                return;

            var url;
            if (pageToken === "")
                url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=" + id;
            else
                url = "https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=" + id + "&pageToken=" + pageToken;

            Utility.makeAsyncYouTubeAjaxRequest(url, null,
                function success(data) {
                    if (currFetchID !== FetchID)
                        return;

                    var nextPageToken = "";

                    if (data["nextPageToken"]) {
                        nextPageToken = data["nextPageToken"];
                        var nextCt = count + data.pageInfo.totalResults;
                        Utility.delayAfter(function () { App.loadCommentReplies(commentParent, id, nextCt, nextPageToken, currFetchID); });
                    }

                    $.each(data["items"], function (key, val) {
                        var $comment = $("<li class='comment'></li>");
                        var $body = $("<div class='commentBody'></div>");
                        var $content = $("<div class='content'></div>");
                        var $author = $("<strong class='author'></strong>");
                        var $userdata = $("<div class='commentData'></div>");

                        var authorName = val.snippet.authorDisplayName;

                        $author.html(authorName);
                        $content.html(App.parseComment(val.snippet.textDisplay, currFetchID, authorName));
                        $userdata.html("<p> Reply number: " + count + "</p>" +
                            "<p> Posted: " + val.snippet.publishedAt + "</p>" +
                            "<p> Id: " + val.id + "</p>" +
                            "<p> Next page token: " + nextPageToken + "</p>");

                        $body.append($author).append($content).append($userdata);
                        $body.hover(function () {
                            // in
                            $(this).find("span.highlight").css("font-size", "14pt");
                        }, function () {
                            // out
                            $(this).find("span.highlight").css("font-size", "12pt");
                        });

                        $comment.append($body);
                        commentParent.append($comment);
                        count++;
                        ComRplyCt++;
                    });
                }, function error(x, t, m) {
                    if (currFetchID !== FetchID)
                        return;

                    console.log('Error loading comments: ' + x.status + ". " + m);

                    // try again
                    RetryCt--;
                    if (RetryCt > 0) {
                        App.loadCommentReplies(commentParent, id, count, pageToken, currFetchID);
                    } else {
                        // Give Up
                        FetchID++;
                        Utility.error($("#termSpace, #commentSpace, #comments, #voters"), function () {
                            $("#h2_comments").html('Error');
                        });
                        $("input[type='checkbox']").prop('checked', false);
                        $("input[type='checkbox']").prop('disabled', true);
                        Utility.displayMessage('Error loading comments: ' + x.status + ". " + m, BAD);
                    }
                });
        },
        parseComment: function (comment, currFetchID, author) {
            if (currFetchID !== FetchID)
                return;

            if (!Loaded) {
                Data.addColumn('string', 'Video');
                Data.addColumn('number', 'Votes');

                // Add rows
                Data.addRows(ConfiguredTermArray.length);
                for (var j = 0; j < ConfiguredTermArray.length; j++) {

                    // data
                    Data.setCell(j, 0, ConfiguredTermArray[j][0]);
                    Data.setCell(j, 1, ConfiguredTermArray[j][1]);
                }
                Loaded = true;
            }

            var res = comment;
            var index = -1;
            comment = comment.toLowerCase();
            for (var i = 0; i < ConfiguredTermArray.length; i++) {
                var key = ConfiguredTermArray[i][0];
                if ((index = comment.indexOf(key.toLowerCase())) >= 0) {
                    ConfiguredTermArray[i][1]++;
                    Data.setCell(i, 1, ConfiguredTermArray[i][1]);

                    var s = res.substring(0, index);
                    var t = res.substring(index, index + key.length);
                    var v = res.substring(index + key.length, res.length + 1);

                    res = s + "<span class='" + key + " highlight'>" + t + "</span>" + v;
                    comment = res.toLowerCase();

                    if (Voters.indexOf(author) < 0) {
                        Voters.push(author);
                        Utility.loadComplete($("#voters"));
                        Utility.addToSortedList($VotersHtml, author);
                    }
                }
            }

            OverallCount++;
            return res;
        },
        loadTermsAndColors: function () {
            var $listElts = $("#termsList li");
            ConfiguredColorArray = new Array();
            ConfiguredTermArray = new Array();
            $listElts.each(function (idx) {
                var term = $(this).data("name");
                var color = "#" + $(this).data("color");
                var enabled = !$(this).hasClass("disabled");

                if (enabled) {
                    ConfiguredColorArray.push(color);
                    ConfiguredTermArray.push([term, 0]);
                }
            });
            $("#fetch").prop("disabled", false);
            $("#fetch").prop("title", "");
        },
        populateBestOfTheWeek: function (success, error) {
            var historyStats = new Array();
            var $listElt = $("<ul />");
            $listElt.addClass("list-group short-list");

            var addVideoStatsToArray = function (id, title, shorthand, dateadded) {
                if (id.trim() === '')
                    return false;

                var url = "https://www.googleapis.com/youtube/v3/videos?part=statistics&id=" + id + "&maxResults=1";

                Utility.makeAsyncYouTubeAjaxRequest(url, null,
                    function (response) {
                        if (response.pageInfo.totalResults > 0 && response.items.length > 0) {
                            // stats
                            var viewCount = response.items[0].statistics.viewCount;
                            var likeCount = response.items[0].statistics.likeCount;
                            var commentCount = response.items[0].statistics.commentCount;
                            historyStats.push([title, viewCount, commentCount, likeCount, shorthand, dateadded]);
                            return true;
                        } else {
                            return false;
                        }
                    }, function (x, t, m) {
                        return false;
                    });
                return true;
            };


            var requestVideosInPlaylist = function (playlistId, pageToken) {

                var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistId + "&maxResults=20";

                if (pageToken) {
                    url += "&pageToken=" + pageToken;
                }
                Utility.makeAsyncYouTubeAjaxRequest(url, null,
                    function (response) {

                        var nextPageToken = response.nextPageToken;

                        var playlistItems = response.items;
                        if (playlistItems) {
                            $.each(playlistItems, function (index, item) {
                                var date = new Date(item.snippet.publishedAt);
                                var title = item.snippet.title;
                                var pos = item.snippet.position;
                                var url;

                                if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("default")) {
                                    url = item.snippet.thumbnails.default.url;
                                } else if (item.snippet.thumbnails && item.snippet.thumbnails.hasOwnProperty("high")) {
                                    url = item.snippet.thumbnails.high.url;
                                } else {
                                    url = "";
                                }
                                var id = item.snippet.resourceId.videoId;

                                if (title.length > 80) {
                                    title = title.substring(0, 77) + "...";
                                }

                                var $listItem = $("<li />");
                                var $container = $("<div />");
                                var $subContainer1 = $("<div />");
                                var $subContainer2 = $("<div />");
                                var $thumb = $("<img />");
                                var $header = $("<h4 />");
                                var $subHeader = $("<small />");

                                $thumb.addClass("img-thumbnail option_thumb").attr("src", url).attr("alt", pos);
                                $header.addClass("option_title").html(title);
                                $subHeader.addClass("option_date text-muted").html("Date added: " + date.toLocaleDateString());
                                $subContainer2.addClass("col-10");
                                $subContainer1.addClass("col-2 d-none d-md-block");
                                $container.addClass("row");
                                $listItem.addClass("list-group-item").attr("title", item.snippet.title).attr("role", "button")
                                    .data("id", id).click(function () {
                                        Utils.addUrlToInput("https://www.youtube.com/watch?v=" + $(this).data("id"), this);
                                    });

                                $listElt.append($listItem);
                                $listItem.append($container);
                                $container.append($subContainer1);
                                $container.append($subContainer2);
                                $subContainer1.append($thumb);
                                $subContainer2.append($header);
                                $subContainer2.append($subHeader);

                                // add to stored list for column chart usage
                                if (!addVideoStatsToArray(item.snippet.resourceId.videoId, item.snippet.title, item.snippet.title.substring(0, 20) + "...", date)) {
                                    error({ status: null }, "500", "Internal Error");
                                    return;
                                }
                            });
                            if (!pageToken) {
                                success(historyStats, $listElt);
                            }
                        }

                        if (nextPageToken)
                            requestVideosInPlaylist(playlistId, nextPageToken);
                    }, function (x, t, m) {
                        error(x, t, m);
                    });
            };

            App.getBestClipOfTheWeekPlaylistID(function (id) {
                requestVideosInPlaylist(id);
            }, function (x, t, m) {
                error(x, t, m);
            });
        },
        getGooglePlusComments: function (videoId, success, error, final) {
            var url = "https://www.googleapis.com/plus/v1/people?query=%22Stonemountain64%22";
            Utility.makeAsyncYouTubeAjaxRequest(url, null,
                function (response) {
                    var id = null;
                    $(response.items).each(function (idx, itm) {
                        if (id) {
                            return;
                        }

                        if (itm.displayName === "StoneMountain64" && itm.url.indexOf("StoneMountain64") > -1) {
                            id = itm.id;
                        }
                    });

                    if (!id) {
                        error(null, 404, "Unable to locate google+ user StoneMountain64.");
                        return;
                    }

                    url = "https://www.googleapis.com/plus/v1/people/" + id + "/activities/public?";

                    var getPost = function (url, page) {
                        var req = url;
                        if (page) {
                            req += "&pageToken=" + page;
                        }

                        Utility.makeAsyncYouTubeAjaxRequest(req, null,
                            function (response) {
                                var postId = null;
                                $(response.items).each(function (idx, itm) {
                                    if (postId) {
                                        return;
                                    }
                                    if (itm.object && itm.object.attachments) {
                                        $(itm.object.attachments).each(function (attidx, attitm) {
                                            if (postId) {
                                                return;
                                            }
                                            if (attitm.objectType === "video" && attitm.url.indexOf(videoId) >= 0) {
                                                postId = itm.id;
                                                success(itm.object.content, "StoneMountain64");
                                            }
                                        });
                                    }
                                });

                                if (!postId && response.nextPageToken) {
                                    getPost(url, response.nextPageToken);
                                    return;
                                } else if (!postId) {
                                    error(null, 404, "Error: Post not found.");
                                    return;
                                }

                                url = "https://www.googleapis.com/plus/v1/activities/" + postId + "/comments?";

                                var getCommentPage = function (url, page) {
                                    var req = url;
                                    if (page) {
                                        req += "&pageToken=" + page;
                                    }

                                    Utility.makeAsyncYouTubeAjaxRequest(req, null,
                                        function (response) {
                                            $(response.items).each(function (idx, itm) {
                                                success(itm.object.content, itm.actor.displayName);

                                            });
                                            if (response.nextPageToken) {
                                                getCommentPage(url, response.nextPageToken);
                                            } else {
                                                final();
                                            }
                                        }, error);
                                };
                                getCommentPage(url, null);
                            },
                            error);
                    };
                    getPost(url, null);
                }, error);
        },
        getBestClipOfTheWeekPlaylistID: function (success, error) {
            if (this.bestClipOfTheWeekPlaylistID) {
                success(BestClipOfTheWeekPlaylistID);
            }

            // Retrieve the list of videos in the specified playlist.
            var requestVideoPlaylist = function (channelID, pageToken) {
                var url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=" + channelID + "&maxResults=20";

                if (pageToken) {
                    url += "&pageToken=" + pageToken;
                }

                Utility.makeAsyncYouTubeAjaxRequest(url, null,
                    function (response) {
                        // Only show pagination buttons if there is a pagination token for the
                        // next or previous page of results.
                        var nextPageToken = response.nextPageToken;
                        var playlistItems = response.items;
                        if (playlistItems) {
                            $.each(playlistItems, function (index, item) {
                                var title = item.snippet.title;
                                var id = item.id;
                                if (title === PLAYLIST_TITLE) {
                                    success(id);
                                    return;
                                }
                            });
                        }
                        if (nextPageToken)
                            requestVideoPlaylist(channelID, nextPageToken);

                    }, function (x, t, m) {
                        console.log(t + ': ' + x.status + ". " + m);
                        error(x, t, m);
                    });
            };


            var url = "https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=StoneMountain64&maxResults=1";

            Utility.makeAsyncYouTubeAjaxRequest(url, null, function success(response) {
                if (response["items"] && response.items.length > 0) {
                    var channelID = response.items[0].id;
                    requestVideoPlaylist(channelID);
                } else {
                    console.log(t + ': ' + x.status + ". " + m);
                    error(x, t, m);
                }
            }, function (x, t, m) {
                console.log(t + ': ' + x.status + ". " + m);
                error(x, t, m);
            });
        }
    };

    Public = {
        googleChartsLoaded: App.googleChartsLoaded
    };

    return Public;
})(window.jQuery, window, document);

// Load the Visualization API and the corechart package.
google.charts.load('current', { 'packages': ["corechart", "bar"] });

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(Report.googleChartsLoaded);