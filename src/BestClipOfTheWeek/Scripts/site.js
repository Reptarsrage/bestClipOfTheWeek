// Write your JavaScript code.
$(function () {
    $("[data-hide]").on("click", function () {
        $(this).closest("." + $(this).attr("data-hide")).hide();
    });

    $("[data-modal]").on("click", function () {
        var id = "#" + $(this).attr("data-modal");
        $(".modal").not(id).modal('hide');
        $(id).modal('toggle');
    });
});