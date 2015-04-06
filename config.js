const USER_NAME = "Admin";

$(document).ready(function () {
    handleEvent('GET');
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
        type: "DELETE",
        data: {
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
    $("#response").html("Error");
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
        for (i = 0; i < rows.length; i++) {
            var row_dom = $("<tr></tr>");
            var row = rows[i];
            cols = row.split(" ");
            if (cols.length == 3) {
                delete_button = $("<td></td>");
                delete_button.append($("<button onclick=\"handleEvent('DELETE', ['" + cols[0] + "'])\" class='button_post'>Delete</button>"));
                row_dom.append("<td>" + cols[0] + "</td>");
                row_dom.append("<td>" + cols[1] + "</td>");
                row_dom.append("<td>" + cols[2] + "</td>");
                row_dom.append(delete_button);
            }
            $("#table_config tbody").append(row_dom);
        }
    }
    $("#response").append(htm);
}