/*
 * Justin Robb
 * 4/10/15
 * Best Clip of the Week Application
 * Tool tip storage
 */

const TOOL_TIPS = {
    index: {
        choose: "Provide the url to the video you wish to use. Kindly ensure the url you provide is valid and contains a valid video ID. (For example: https://www.youtube.com/watch?<b>v=1M5vGlvic_o</b>).<br>" +
        "The website will parse the Jesus out of the comments for this video and tally up the results based on your provided terms.<br>Once you're ready to have your mind blown, press 'Fetch Results'.",
        
        recommended: "Feel free to use any of these recommended videos for your search.<br />" +
	    "All of these videos are 'Best Clip of the Week' Videos from YouTube user StoneMountain64 (the Beast, the Legend).",
        
        terms: "The Terms to look for inside of the comments. These will be tallied up and displayed.<br>Use the Configuration tab to add and remove search terms if the default ones don't yank your chain.",

        stats: "In this area you can view basic stats about the video. This includes a chart which compares this video's likes, "+
            "views and comments to other videos in the same playlist.<br />If you would like to choose another video you can re-expand the search area above.",

        results: "This area shows the counts of the various search terms found within the video comments."+
            "<br><br>The API is kinda slow, and I'm too cheap for a nice server, so the client-side algorithm takes a "+
            "while to run <i>usually aound 90sec</i>. In the meantime you can sit back, relax, crack open a brew and place bets while you watch these charts update.",
        
        comments: "Here you can view all the comments for the video. If you go through them you can see the terms that were counted as votes, "+
            "and the ones that weren't.<br>You can also view a list of users who voted (Who cares about the ones that didn't amiright?). This list is in order and contains no duplicates.<br>"+
            "The count in the title is the number of comments (not including replies to comments) loaded for this video. As the program loads more comments this number will update.",
    },
    config: {
        term:
	"The literal string to search for within the comments. This will be used when tallying up the results.<br>Feel free to uses whatever junk you want, it <i>should</i> work.<br>Max length is 50 chars so don't go too nuts.",

        color:
            "Do you like pretty charts? If so you can associate a color with the term. <br>This color will be used to represent this term when parsing " +
            "comments and displaying the vote results in the charts. Uses <a href='http://jscolor.com/'>JSColor</a> - a SICK js color library.",

        enabled: 
            "Controls whether the term will be considered when tallying up results. If disabled the term will not appear in term lists or in charts.",
	
        add:
	"Want to search for terms that weren't included in the default set? Do it.<br>How many comments included the term <i>dirty teabag</i>?",

    delete:
	"If you have too many disabled terms, or just want a cleaner table go ahead and delete whatever you want. These terms are specific to the user. <br>I dont mind.<br><i>...very much</i>",

    configuration:
	"In this console you can add, delete and configure the terms used by the program. Each user has a different set of terms. Feel free to customize yours!",
    },
};