$(document).ready(function(){
    $(document).keypress(function (e) {
        if (e.which == 13) {
            $("#input_new").change();
            $("#button_submit").click();
        }
    });


    $("#button_submit").click(function () {
        $("#button_submit").prop("disabled", true);
        $("input").prop("disabled", true);
        $(".loading").fadeIn(500);

        var password_old = $("#input_old").val().trim();
        var password = $("#input_new").val().trim();
        var password_again = $("#input_new_again").val().trim();

        if (password.length < 6 || password_old == "" || password_again == "") {
            Utility.displayMessage("Please enter a valid password. Must be at least six characters long.", BAD)/*displays error message*/
            $("#button_submit").prop("disabled", false);
            $("input").prop("disabled", false);
            $(".loading").fadeOut(500);
            return;
        }

        if (password != password_again) {
            Utility.displayMessage("Passwords do not match", BAD)/*displays error message*/
            $("#button_submit").prop("disabled", false);
            $("input").prop("disabled", false);
            $(".loading").fadeOut(500);
            return;
        }

        $.ajax({
            url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
            type: "GET",
            timeout: 10000,
            data: {
                username: urlParams['username'],
                token: urlParams['token'],
                password: password_old,
                passwordNew: password,
                changepassword: 'signup'
            },
            success: function (resp) {
                if (!resp) {
                    Utility.displayMessage("Internal error, unable to change password. Please double check your current password and try again.", BAD);
                    $("#button_submit").prop("disabled", false);
                    $("input").prop("disabled", false);
                    $(".loading").fadeOut(500);
                    return;
                }

                Utility.displayMessage("Password changed successfully! Redirecting...", GOOD);
                Utility.delayAfter(function () {
                    window.location = "index.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION;
                }, 3000);
            },
            error: function (x, t, m) {
                Utility.displayMessage(t + " - " + m + ".", BAD);
                $("#button_submit").prop("disabled", false);
                $("input").prop("disabled", false);
                $(".loading").fadeOut(500);
            },
        });
    });

    $("#input_new").change(function () {
        var password = $("#input_new").val().trim();
        var password_again = $("#input_new_again").val().trim();

        if (password_again.length == 0) {
            return;
        }


        if (password != password_again) {
            $("#label_rtry_msg").text("Passwords do not match");
            $("#label_rtry_msg").attr("class", "bad_msg");
        } else {
            $("#label_rtry_msg").text("Passwords match");
            $("#label_rtry_msg").attr("class", "good_msg");
        }
    });

    $("#input_new_again").change(function () {
        var password = $("#input_new").val().trim();
        var password_again = $("#input_new_again").val().trim();

        if (password != password_again) {
            $("#label_rtry_msg").text("Passwords do not match");
            $("#label_rtry_msg").attr("class", "bad_msg");
        } else {
            $("#label_rtry_msg").text("Passwords match");
            $("#label_rtry_msg").attr("class", "good_msg");
        }
    });
});