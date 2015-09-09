/*
 * Justin Robb
 * 4/20/15
 * Best Clip of the Week Application
 * Top header/menu bar
 */


// http://cssmenumaker.com/menu/responsive-menu-bar
(function ($) {

  $.fn.menumaker = function(options) {
      
      var cssmenu = $(this), settings = $.extend({
        title: "Menu",
        format: "dropdown",
        breakpoint: 768,
        sticky: false
      }, options);

      return this.each(function() {
        cssmenu.find('li ul').parent().addClass('has-sub');
        if (settings.format != 'select') {
          cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');
          $(this).find("#menu-button").on('click', function(){
            $(this).toggleClass('menu-opened');
            var mainmenu = $(this).next('ul');
            if (mainmenu.hasClass('open')) { 
              mainmenu.hide().removeClass('open');
            }
            else {
              mainmenu.show().addClass('open');
              if (settings.format === "dropdown") {
                mainmenu.find('ul').show();
              }
            }
          });

          multiTg = function() {
            cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
            cssmenu.find('.submenu-button').on('click', function() {
              $(this).toggleClass('submenu-opened');
              if ($(this).siblings('ul').hasClass('open')) {
                $(this).siblings('ul').removeClass('open').hide();
              }
              else {
                $(this).siblings('ul').addClass('open').show();
              }
            });
          };

          if (settings.format === 'multitoggle') multiTg();
          else cssmenu.addClass('dropdown');
        }

        else if (settings.format === 'select')
        {
          cssmenu.append('<select style="width: 100%"/>').addClass('select-list');
          var selectList = cssmenu.find('select');
          selectList.append('<option>' + settings.title + '</option>', {
                                                         "selected": "selected",
                                                         "value": ""});
          cssmenu.find('a').each(function() {
            var element = $(this), indentation = "";
            for (i = 1; i < element.parents('ul').length; i++)
            {
              indentation += '-';
            }
            selectList.append('<option value="' + $(this).attr('href') + '">' + indentation + element.text() + '</option');
          });
          selectList.on('change', function() {
            window.location = $(this).find("option:selected").val();
          });
        }

        if (settings.sticky === true) cssmenu.css('position', 'fixed');

        resizeFix = function() {
          if ($(window).width() > settings.breakpoint) {
            cssmenu.find('ul').show();
            cssmenu.removeClass('small-screen');
            if (settings.format === 'select') {
              cssmenu.find('select').hide();
            }
            else {
              cssmenu.find("#menu-button").removeClass("menu-opened");
            }
          }

          if ($(window).width() <= settings.breakpoint && !cssmenu.hasClass("small-screen")) {
            cssmenu.find('ul').hide().removeClass('open');
            cssmenu.addClass('small-screen');
            if (settings.format === 'select') {
              cssmenu.find('select').show();
            }
          }
        };
        resizeFix();
        return $(window).on('resize', resizeFix);

      });
  };
})(jQuery);

(function($){
    $(document).ready(function(){

    if (urlParams['username'].length < 9) {
        $("#logged_as").text("Logged in as " + urlParams['username']);
    } else {
        $("#logged_as").text(urlParams['username']);
    }
    
    $("#a_logout").click(function () {
        $.ajax({
            url: 'https://bestclipoftheweek-1xxoi1ew.rhcloud.com/',
            type: "POST",
            timeout: 5000,
            cache: false,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            data: {
                username: urlParams['username'],
                token: urlParams['token'],
                logout: "logout",
            },
            success: function (resp) {
                if (resp["error"]) {
                    // error
                    console.log("Error logging out. Response: " + resp.error.message);
                    window.location = "login.html";
                } else {
                    window.location = "login.html";
                }
            },
            error: function (x, t, m) {
                console.log("Error logging out: " + t + ': ' + x.status + ". " + m);
                window.location = "login.html";
            }
        });
        
    });

    $("#a_changepassword").prop("href", "changepassword.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_index").prop("href", "index.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_config").prop("href", "config.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_about").prop("href", "about.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_quick").prop("href", "quick.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_comments").prop("href", "comments.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);
    $("#a_thumbnail").prop("href", "thumbnail.html?username=" + urlParams['username'] + "&token=" + urlParams['token'] + "&version=" + VERSION);




$(window).load(function() {
  $("#cssmenu").menumaker({
    title: "Menu",
    format: "dropdown"
  });

  
$('#cssmenu').prepend("<div id='menu-indicator'></div>");

var foundActive = false, activeElement, indicatorPosition, indicator = $('#cssmenu #menu-indicator'), defaultPosition;

$("#cssmenu > ul > li").each(function() {
  if ($(this).hasClass('active')) {
    activeElement = $(this);
    foundActive = true;
  }
});

if (foundActive === false) {
   activeElement = $("#cssmenu > ul > li").first();
}

defaultPosition = indicatorPosition = activeElement.position().left + activeElement.width()/2 - 5;
//console.log(activeElement);
//console.log(activeElement.position().left);
//console.log(activeElement.width());
indicator.css("left", indicatorPosition);

$("#cssmenu > ul > li").hover(function() {
  activeElement = $(this);
  indicatorPosition = activeElement.position().left + activeElement.width()/2 - 5;
  indicator.css("left", indicatorPosition);
}, 
function() {
  indicator.css("left", defaultPosition);
});

});

});
})(jQuery);
