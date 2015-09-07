/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Term configuration page
 */

// Variables
var lastAdded = null;
var lastRemoved = null;

window.onerror = function (msg, url, line, col, error) {
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;
    console.log("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
    displayMessage("An error occured on the page. Please try releoading the page. If you experience any further issues you can contact me for support.", BAD);
    var suppressErrorAlert = true;
    return suppressErrorAlert;
};

$(document).ready(function () {
    // tool-tips
    Utility.configureTooltipForPage('config');

    $("#table_config").fadeOut(500);
    $("#table_config tbody").empty();
    $(".loading").fadeIn(500);
    Utility.delayAfter(function () { handleEvent('GET', null) });

    $("#a_index").prop("href", "index.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_quick").prop("href", "quick.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_comments").prop("href", "comments.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_thumbnail").prop("href", "thumbnail.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
});


// Helper method to display a message on the page.
function displayMessage(message, good) {
    $('#message').text(message);

    if (good == GOOD) {
        $('#message').attr("class", "good");
        $('#message').fadeOut(500);
    } else if (good == BAD) {
        $('#message').attr("class", "bad");
        $('#message').fadeIn(500);
        if (lastAdded) lastAdded.fadeOut(500, function () { $(this).remove(); });
        if (lastRemoved) lastRemoved.find("td").fadeIn(500);
    } else {
        $('#message').attr("class", "okay");
        $('#message').fadeIn(500);
    }
}

function handleEvent(method, options) {
    if (method == 'GET') {
        return getData(urlParams['username']);
    } 

    if (method == 'POST') {
        lastAdded = null;
        if (lastRemoved) lastRemoved.remove();
        if (options.length != 3)
            return false;
        return postData(urlParams['username'], options[0], options[1], options[2]);
    }

    if (method == 'DELETE') {
        lastAdded = null;
        if (lastRemoved) lastRemoved.remove();
        if (options.length != 1)
            return false;

        return deleteData(urlParams['username'], options[0]);
    }

    return false;
}

function getData(user) {
    // show loading
    $(".loading").fadeIn(500);

    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "GET",
        timeout: 5000,
        cache: false,
        data: {
            username: user,
            token: urlParams['token']
        },
        success: displayData,
        error: showResultStatus
    });

    return true;
}


function postData(user, term, color, enabled) {

    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "POST",
        timeout: 5000,
        data: {
            method: 'POST',
            cache: false,
            username: user,
            term: term,
            color: color,
            enabled: enabled,
            token: urlParams['token']
        },
        success: showResultStatus,
        error: showResultStatus
    });

    return true;
}


function deleteData(user, term) {
    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "POST",
        timeout: 5000,
        data: {
            method: 'DELETE',
            username: user,
            cache: false,
            term: term,
            token: urlParams['token']
        },
        success: showResultStatus,
        error: showResultStatus
    });

    return true;
}

function showResultStatus(msg) {
    $(".loading").fadeOut(500);
    if (!msg) {
        displayMessage("No message to display", GOOD)
    }
    // msg.status
    // msg.responseText
    // msg. statusText
    if (msg.hasOwnProperty("status")) {
        if (msg.status != 200)
            displayMessage("Error: " + msg.status + " - " + msg.statusText + ". " + msg.responseText, BAD);
        else
            displayMessage("Success: " + msg.status + " - " + msg.statusText + ". " + msg.responseText, GOOD);
    } else
        displayMessage("Success", GOOD);
}

function displayData(msg) {
    if (!msg)
        return false;

    showResultStatus(msg);
    $("#table_config").fadeIn(500);

    if (!msg.hasOwnProperty("status")) {
        var rows = msg.split("<br/>");
        createTableRow("   ", 'add');
        for (i = 0; i < rows.length; i++) {
            createTableRow(rows[i], 'delete');
        }
        jscolor.init();
    }
}


function createTableRow(row, buttonType, before) {
    var row_dom = $("<tr></tr>");
    var case_delete = false;
    
    if (buttonType.toUpperCase() == 'DELETE')
        case_delete = true;


    if (case_delete) {
        cols = row.split(" ");
    } else {
        cols = ["", Utility.getRandomColor(), "1"];
        row_dom.addClass("tr_add");
    }
    if (cols.length == 3) {
        cols[0] = cols[0].replace(/&nbsp;/g, ' ');
        if (case_delete) {
            // delete button (last column)
            var button = $("<button class='button_delete'>Delete</button>");
            var ico = $("<img name='delete' class='tooltip' src='/common/images/info.png' alt='?' />");
            button.click(function () {
                $(this).prop('disabled', true);
                var parent = $(this).closest("tr");
                var vterm = parent.find(".input_term").val().replace(/\s/g, '&nbsp;');
                handleEvent('DELETE', [vterm]);
                lastRemoved = $(this).closest('tr');
                $(this).closest('tr').find("td").fadeOut(1000); // There is a problem in jQuery when hiding trs. This is the current workaround
            });
        } else {
            // add button (last column)
            var button = $("<button class='button_delete'>Add</button>");
            var ico = $("<img name='add' class='tooltip' src='/common/images/info.png' alt='?' />");
            button.click(function () {
                $(this).prop('disabled', true);
                var parent = $(this).closest("tr");
                var vterm = parent.find(".input_term").val().replace(/\s/g, '&nbsp;');
                var vcolor = parent.find(".color").val();
                var venabled = 'no';
                if (parent.find(".checkpox_enabled").prop('checked'))
                    venabled = 'yes';

                if (vterm.length == 0) {
                    // handle invalid cases
                    parent.find(".input_term").css("border", "1px solid red");
                    parent.find(".input_term").focus();
                    return;
                }

                // library ensures us the color is always valid
                parent.find(".input_term").css("border", "none");
                handleEvent('POST', [vterm, vcolor, venabled]);

                // clear all inputs
                parent.find(".input_term").val("");
                parent.find(".color").val(Utility.getRandomColor());
                parent.find(".checkpox_enabled").prop('checked', true);
                $(this).prop('disabled', false).addClass('disabled');
                $(this).removeClass('disabled');

                // add row to table (in sorted order)
                if (venabled == 'yes')
                    venabled = 1;
                else
                    venabled = 0;

                var toinsert = true;
                $("#table_config > tbody > tr").each(function () {
                    var item = $(this).find(".input_term").val();
                    if (item && vterm.toUpperCase() < item.replace(/\s/g, '&nbsp;').toUpperCase()) {
                        if (toinsert) {
                            createTableRow(vterm.replace(/\s/g,'&nbsp;') + " " + vcolor + " " + venabled, 'delete', this);
                            toinsert = false;
                        }
                    }
                });
                if (toinsert) {
                    createTableRow(vterm.replace(/\s/g, '&nbsp;') + " " + vcolor + " " + venabled, 'delete');
                }
                jscolor.init();
            });
        }
        button = $("<td class='center'></td>").append(button).append(ico);

        // enabled checkbox
        enabled = $("<input type='checkbox' class='checkpox_enabled'></input>");
        if (cols[2] == true)
            $(enabled).prop('checked', true); // Unchecks it
        else
            $(enabled).prop('checked', false); // Unchecks it

        if (case_delete)
            enabled.click(function () {
                var parent = $(this).closest("tr");
                var vterm = parent.find(".input_term").val().replace(/\s/g, '&nbsp;');
                var vcolor = "#" + parent.find(".color").val();
                var venabled = 'no';
                if ($(this).prop('checked'))
                    venabled = 'yes';
                handleEvent('POST', [vterm, vcolor, venabled]);
            });
        enabled = $("<td class='center'></td>").append(enabled);

        // term input
        term = $("<input placeholder='Add a term' class='input_term' type='text' maxlength='50'></input>");
        if (case_delete)
            term.prop("disabled", "disabled");
            term.change(function () {
                var parent = $(this).closest("tr");
                var vterm = $(this).val().trim().replace(/\s/g, '&nbsp;');
                var vcolor = "#" + parent.find(".color").val();
                var venabled = 'no';
                if (parent.find(".checkpox_enabled").prop('checked'))
                    venabled = 'yes';
                    
                if (vterm.length == 0) {
                    // handle invalid cases
                    $(this).css("border", "1px solid red");
                    $(this).focus();
                } else {
                    $(this).css("border", "none");
                    handleEvent('POST', [vterm, vcolor, venabled]);
                }
            });

        $(term).val(cols[0]);
        term = $("<td></td>").append(term);

        //color
        // handled by external lib JSColor
        color = $("<input class='color' value='" + cols[1] + "' />");
        if (case_delete)
            color.change(function () {
                var parent = $(this).closest("tr");
                var vterm = parent.find(".input_term").val().replace(/\s/g, '&nbsp;');
                var vcolor = "#" + $(this).val();
                var venabled = 'no';
                if (parent.find(".checkpox_enabled").prop('checked'))
                    venabled = 'yes';

                // library ensures us the color is always valid
                $(this).css("border", "none");
                handleEvent('POST', [vterm, vcolor, venabled]);
            });
        color = $("<td></td>").append(color);

        row_dom.append(term);
        row_dom.append(color);
        row_dom.append(enabled);
        row_dom.append(button);
        row_dom.find("td").fadeIn(1000);
    }

    if (before) {
        $(before).before(row_dom);
    } else {
        $("#table_config tbody").append(row_dom);
    }

    lastAdded = row_dom;
}