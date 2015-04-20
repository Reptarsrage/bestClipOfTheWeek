Best Clip of the Week (v0.1.0beta)

Hosted here: http://bestclipoftheweek.x10host.com/
Note that I've disabled the sign up feature for now. If you would like permission to login to the site please send me an email.

Description

	This is my attempt to tally the results of StoneMountain64's Best Clip of the Week videos.

	This site is not meant for a wide range of users. Mostly just one, although now that I've made it I  possibly see a little room for growth. My intention was to have a program that took a url and a list of terms and returned a count of votes for each term. After I completed this I thought, 'wouldn't it be cool if I could play with the terms, store them and manipulate them?' Well this whim lead to a backend server and a service running on Openshift. Then I thought, wouldn't it be cool if I had some charts? Luckily I was already using Youtube Data and Analytics, and Google+ API's, so adding Google Charts was not difficult. Then I figured since I have a database that may or may not charge me money for heavy use, I need some security. This drove me to make a login in system.

	After all that was said and done, I had kind of this clunky cool looking website. There are a couple of things that I haven't gotten to yet. The biggest one is improving the load time of the results. Client-side processing, slow google API's and zero caching have all added up to a whopping 90sec page load time... and unless I want to spend money and/or a ton of time, I'm not sure how to improve this. There is also the issue with errors cropping up. I didn't write unit tests as this was just kind of an ad-hoc fun project and I didn't want to deal with the overhead. There are some pretty heavy restrictions on my back-end server size, the amount of API calls I can make, and a few other limiting factors. There are some errors with showing/hiding loading and error messages that still need to be worked out. There are many moving pieces here, and if one fails the site doesn't work, it would be nice to come up with a solution for this as well.

	I had a super fun time making this site. Flaws and all I think it turned out pretty well.
            
        
Credits:
	API's:
	
		https://developers.google.com/chart/   Jquery library quite a revolutionary and free library.
		https://developers.google.com/youtube/analytics/   Jquery UI library a pretty damn usefull for them tooltips.
		https://developers.google.com/youtube/v3/   JSColor a SICK color chooser.
		https://developers.google.com/+/api/   nnattawat for that ballin' flip animation.
	
	Images:
	
		http://stackoverflow.com/questions/14446677/how-to-make-3-corner-rounded-triangle-in-css   Murray Smith for the most perfect triangle ever conceived.
		https://www.iconfinder.com/icons/401329/help_info_information_support_tip_tooltip_icon   Michal Kučera for a fancy tool-tip image.
		http://pixshark.com/spinner-gif-transparent-background.htm   This site for not the best loading image, but certainly the easiest to find.
	
	Special Thanks:
	
		https://jquery.com/   Jquery library quite a revolutionary and free library.
		https://jqueryui.com/   Jquery UI library which was pretty damn usefull for them tooltips.
		http://jscolor.com/   JSColor a SICK color chooser.
		http://nnattawat.github.io/flip/   nnattawat for that ballin' flip animation.
		https://www.openshift.com/   OpenShift for hosting my SQL server and PHP service (Heroku sucks!!).
		https://x10hosting.com/   x10hosting.com/ for hosting my site for free.
		http://cssmenumaker.com/menu/responsive-menu-bar   CSS Menu Maker for that stupidly classy header bar.
		http://www.w3schools.com/   W3Scools my sensei.
		http://phpfiddle.org/   phpfiddle for an easy solution to php programming.
		https://www.youtube.com/channel/UCN-v-Xn9S7oYk0X2v1jx1Qg   StoneMountain64 for kickin ass and taking names.

            
        
Support:
	Feel free to contact me directly with any questions or concerns related to the site. I'm definitely open to criticism, ideas, suggestions and even more open to praise.
   
			
