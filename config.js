/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Term configuration page
 */

const USER_NAME = "Admin";

$(document).ready(function () {
    handleEvent('GET', null);
});


function handleEvent(method, options) {
    if (method == 'GET') {
        return getData(USER_NAME);
    } 

    if (method == 'POST') {
        if (options.length != 3)
            return false;
        return postData(USER_NAME, options[0], options[1], options[2]);
    }

    if (method == 'DELETE') {
        if (options.length != 1)
            return false;

        return deleteData(USER_NAME, options[0]);
    }

    return false;
}

function getData(user) {
    $("#response").html("Fetching data...");


    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "GET",
        data: {
            username: user
        },
        success: displayData,
        error: showResultStatus
    });

    return true;
}


function postData(user, term, color, enabled) {
    $("#response").html("Posting data...");


    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "POST",
        data: {
            method: 'POST',
            username: user,
            term: term,
            color: color,
            enabled: enabled
        },
        success: showResultStatus,
        error: showResultStatus
    });

    return true;
}


function deleteData(user, term) {
    $("#response").html("Deleting data...");


    $.ajax({
        url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
        type: "POST",
        data: {
            method: 'DELETE',
            username: user,
            term: term
        },
        success: showResultStatus,
        error: showResultStatus
    });

    return true;
}

function showResultStatus(msg) {
    if (!msg)
        return false;

    // msg.status
    // msg.responseText
    // msg. statusText
    $("#response").html("Result: ");
    htm = $("<div></div>");
    if (msg.hasOwnProperty("status")) {
        htm.append($("<h3>" + msg.status + " - " + msg.statusText + "</h3>"));
        htm.append($("<p>" + msg.responseText + "</p>"));
    } else
        htm.append($("<p>" + msg + "</p>"));
    $("#response").append(htm);
}

function displayData(msg) {
    if (!msg)
        return false;

    $("#response").html("Success");

    htm = $("<div></div>");
    if (msg.hasOwnProperty("status")) {
        htm.append($("<h3>" + msg.status + " - " + msg.statusText + "</h3>"));
        htm.append($("<p>" + msg.responseText + "</p>"));
    } else {
        var rows = msg.split("<br/>");
        createTableRow("   ", 'add');
        for (i = 0; i < rows.length; i++) {
            createTableRow(rows[i], 'delete');
        }
        jscolor.init();
    }
    $("#response").append(htm);
}


function createTableRow(row, buttonType, before) {
    var row_dom = $("<tr></tr>");
    var case_delete = false;
    
    if (buttonType.toUpperCase() == 'DELETE')
        case_delete = true;


    if (case_delete) {
        cols = row.split(" ");
    } else {
        cols = ["", getRandomColor(), "1"];
        row_dom.addClass("tr_add");
    }
    if (cols.length == 3) {

        if (case_delete) {
            // delete button (last column)
            var button = $("<button class='button_delete'>Delete</button>");
            button.click(function () {
                $(this).prop('disabled', true);
                var parent = $(this).closest("tr");
                var vterm = parent.find(".input_term").val();
                handleEvent('DELETE', [vterm]);
                $(this).closest('tr').find("td").fadeOut(1000, function () { $(this).parent().remove(); }); // There is a problem in jQuery when hiding trs. This is the current workaround
            });
        } else {
            // add button (last column)
            var button = $("<button class='button_delete'>Add</button>");
            button.click(function () {
                $(this).prop('disabled', true);
                var parent = $(this).closest("tr");
                var vterm = parent.find(".input_term").val();
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
                parent.find(".color").val(getRandomColor());
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
                    if (item && vterm.toUpperCase() < item.toUpperCase()) {
                        if (toinsert) {
                            createTableRow(vterm + " " + vcolor + " " + venabled, 'delete', this);
                            toinsert = false;
                        }
                    }
                });
                if (toinsert) {
                    createTableRow(vterm + " " + vcolor + " " + venabled, 'delete');
                }
                jscolor.init();
            });
        }
        button = $("<td class='center'></td>").append(button);

        // enabled checkbox
        enabled = $("<input type='checkbox' class='checkpox_enabled'></input>");
        if (cols[2] == true)
            $(enabled).prop('checked', true); // Unchecks it
        else
            $(enabled).prop('checked', false); // Unchecks it

        if (case_delete)
            enabled.click(function () {
                var parent = $(this).closest("tr");
                var vterm = parent.find(".input_term").val();
                var vcolor = "#" + parent.find(".color").val();
                var venabled = 'no';
                if ($(this).prop('checked'))
                    venabled = 'yes';
                handleEvent('POST', [vterm, vcolor, venabled]);
            });
        enabled = $("<td class='center'></td>").append(enabled);

        // term input
        term = $("<input placeholder='Add a term' class='input_term' type='text'></input>");
        if (case_delete)
            term.change(function () {
                var parent = $(this).closest("tr");
                var vterm = $(this).val().trim();
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
                var vterm = parent.find(".input_term").val();
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
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}