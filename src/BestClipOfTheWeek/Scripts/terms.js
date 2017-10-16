"use strict";
var Form = Form || (function ($, w, d) {
    var App = {},
        Utils = {},
        Events = {},
        Public = {};

    // Variables
    var apiEndpoint = "/api/Term";

    Utils = {
        postData: function (term, success, error, method) {
            $.ajax({
                url: apiEndpoint,
                type: method,
                cache: false,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(term),
                success: success,
                error: error
            });
            return true;
        },
        deleteData: function (id, success, error) {
            $.ajax({
                url: apiEndpoint + "/" + id,
                type: "DELETE",
                timeout: 5000,
                cache: false,
                success: success,
                error: error
            });
            return true;
        }
    };

    Events = {
        init: function () {
            $(".js-delete").off('click').click(App.deleteElt);
            $(".js-add").off('click').click(App.addElt);
            $('.js-click').off('click').click(App.updateElt);
            $('.js-change').off('change').change(App.updateElt);
        }
    };

    App = {
        initOnLoad: function () {
            // tool-tips
            Utility.configureTooltipForPage("config");

            // jscolor
            jscolor.dir = "/images/";
            if (window.jscolor)
                jscolor.init();

            // Events
            Events.init();
        },
        deleteElt: function () {
            var $btn = $(this);
            $btn.prop("disabled", true);
            var $row = $btn.closest("tr");
            var termId = $row.find('input[name="id"]').val();
            var termName = $row.find('input[name="name"]').val();
            Utils.deleteData(termId,
                function (data) {
                    $row.fadeOut(500, function () {
                        $(this).remove();
                    });
                    // Utility.displayMessage("Term " + termName + " deleted", GOOD);
                }, function (error) {
                    $btn.prop("disabled", false);
                    Utility.displayMessage("Error deleting term " + termName + ": " + error.responseText, BAD);
                });
        },
        updateElt: function () {
            var $elt = $(this);
            var $row = $elt.closest("tr");
            $row.find('button').prop("disabled", true);

            var term = {
                TermId: $row.find('input[name="id"]').val(),
                Name: $row.find('input[name="name"]').val(),
                Color: $row.find('input[name="color"]').val(),
                Enabled: $row.find('input[name="enabled"]').is(':checked')
            };

            if (term.Name.length === 0 || term.Name.length > 50) {
                $row.find('input[name="name"]').addClass('bad');
                $row.find('button').prop("disabled", false);
                return;
            }
            $row.find('input[name="name"]').removeClass('bad');

            Utils.postData(term,
                function (data) {
                    $row.find('button').prop("disabled", false);
                    // Utility.displayMessage("Term " + term.Name + " updated", GOOD);
                }, function (error) {
                    $row.find('button').prop("disabled", false);
                    Utility.displayMessage("Error updating term " + term.Name + ": " + error.responseText, BAD);
                }, "PATCH");
        },
        addElt: function () {
            var $btn = $(this);
            $btn.prop("disabled", true);
            var $row = $btn.closest("tr");
            var newTerm = {
                TermId: 0,
                Name: "",
                Color: Utility.getRandomColor(),
                Enabled: true
            };
            var term = {
                TermId: $row.find('input[name="id"]').val(),
                Name: $row.find('input[name="name"]').val(),
                Color: $row.find('input[name="color"]').val(),
                Enabled: $row.find('input[name="enabled"]').is(':checked')
            };

            if (term.Name.length === 0 || term.Name.length > 50) {
                $row.find('input[name="name"]').addClass('bad');
                $row.find('button').prop("disabled", false);
                return;
            }
            $row.find('input[name="name"]').removeClass('bad');

            Utils.postData(term,
                function (data) {
                    var $clone = $row.clone().appendTo("#tableTerms");
                    $clone.find('input[name="id"]').val(data.TermId);
                    $clone.find('input[name="name"]').val(data.Name).addClass('js-change');
                    $clone.find('input[name="color"]').val(data.Color).addClass('js-change');
                    $clone.find('input[name="enabled"]').prop('checked', data.Enabled).addClass('js-click');
                    $clone.find('button').removeClass('js-add').addClass('js-delete').html('Delete').prop("disabled", false);

                    $row.find('input[name="id"]').val(newTerm.TermId);
                    $row.find('input[name="name"]').val(newTerm.Name);
                    $row.find('input[name="color"]').val(newTerm.Color);
                    $row.find('input[name="enabled"]').prop('checked', newTerm.Enabled);

                    if (window.jscolor)
                        jscolor.init();

                    Events.init();

                    $btn.prop("disabled", false);
                    // Utility.displayMessage("Term " + term.Name + " added", GOOD);
                }, function (error) {
                    $btn.prop("disabled", false);
                    Utility.displayMessage("Error adding term " + term.Name + ": " + error.responseText, BAD);
                }, "POST");
        }
    };

    Public = {
        init: App.initOnLoad
    };

    return Public;
})(window.jQuery, window, document);

jQuery(document).ready(Form.init);