/*
FIBBER 
custom js file

include in the index.html in the <head> using the following code:
   <script type="text/javascript" src="src/fibber.js"></script>
*/


/*
TODO:
- save the content loaded in from politifact to session variable with option to reset the session vars
- include some kind of animation using velocity to animate away the decrease in score... (clothing?)
- implement a randomization of content from the loaded array
- clean up the display for the final win/lose screen (error check for lack of statistics)

*/

var fibber = {
	useLocalContent: false,
	enableSavedContent: false,

	clintonData: [],
	trumpData: [],

	clintonCounter: 0,
	trumpCounter: 0,
	
	totalLives: 2,
	clintonLives: 2,
	trumpLives: 2,
	playerLives: 2,

	fibDetectionArray: [0,0],
	truthDetectionArray: [0,0],

	activeCharacter: "",
	activeStatement: {}
};


fibber.log = function(msg){
	console.log(msg);
};
fibber.go = function(target){
	$.afui.loadDiv(target,false,false,"up");
}

fibber.initialize = function(){
	fibber.log("initializing....");

	//setup custom on screen load functionality
	$("#instructions").on("panelload", function(){fibber.loadInstructionsPanel();});
	$("#viewstatement").on("panelload", function(){fibber.loadViewStatementPanel();});

	//update UI with dynamic variables
	fibber.viewCurrentScores();

	//check for saved content
	if(fibber.enableSavedContent == true && fibber.processIsExistsSavedContent()){
		
			fibber.processGetSavedContent();
			fibber.processRandomizeContent();
			$.afui.launch();

	}else{
		fibber.loadRemoteContent(function(){
			
			//clean the content
			fibber.processCleanContent();

			//randomize the content
			fibber.processRandomizeContent();

			//save the content
			fibber.processSaveContent();

			//launch the intel app framework
			$.afui.launch();
		});
	}
};


/*
using politifact API: http://static.politifact.com/api/doc.html
statements: 
	http://www.politifact.com/api/statements/truth-o-meter/people/hillary-clinton/json/?n=15
	http://www.politifact.com/api/statements/truth-o-meter/people/donald-trump/json/?n=15
*/
fibber.loadRemoteContent = function(callback){

	//check if there is an override to use local content
	if(fibber.useLocalContent == true){
		fibber.log("load: loading content from local source. NOT REMOTE");
		
		//load the local JSON content...
		var clintonLoaded, trumpLoaded = false;
		$.getJSON("content/clinton.json", function(response){
			fibber.clintonData = response;
			fibber.log(fibber.clintonData);
			clintonLoaded = true;
		});
		$.getJSON("content/trump.json", function(response){
			fibber.trumpData = response;
			fibber.log(fibber.trumpData);
			trumpLoaded = true;
		});

		//check if both loaded and callback
		var loadInterval = setInterval(function(){ 
			fibber.log("checking if loaded....");
			if(clintonLoaded == true && trumpLoaded == true){
				clearInterval(loadInterval);
				callback();
			}
		}, 3000);
		return;
	}

	//load in the remote data
	fibber.log("load: loading content from remote source. may take a little bit");
	$.ajax({
	    url: "http://www.politifact.com/api/statements/truth-o-meter/people/hillary-clinton/json/?n=15",
	    jsonp: "callback",
	    dataType: "jsonp",
	    data: {
	        format: "json"
	    },
	    success: function( response ) {
	        console.log( response ); // server response
	        fibber.clintonData = response;
	    }
	});

	$.ajax({
	    url: "http://www.politifact.com/api/statements/truth-o-meter/people/donald-trump/json/?n=15",
	    jsonp: "callback",
	    dataType: "jsonp",
	    data: {
	        format: "json"
	    },
	    success: function( response ) {
	        console.log( response ); // server response
	        fibber.trumpData = response;

	        //call the passed in function
	        callback();
	    }
	});
};

fibber.processSaveContent = function(){
	fibber.log("processSaveContent: saving content into fibberData");
	var data = {
		"trumpData": fibber.trumpData,
		"clintonData": fibber.clintonData
	}
	fibber.log("SAVING: " + data);
	localStorage.setItem("fibberData", JSON.stringify(data));
	//localStorage.setItem("fibberData", data);
};

fibber.processIsExistsSavedContent = function(){
	var data = localStorage.getItem("fibberData");
	if (data == null || data == undefined || data == ""){
		fibber.log("processExistsSavedContent: NO object found in saved content. return false.");
		return false;
	}else{
		fibber.log("processExistsSavedContent: object found in saved content. return true.");
		fibber.log(data);
		return true;
	}
	fibber.log("processExistsSavedContent: Data not an object found in saved content. return false.");
	return false;
};

fibber.processGetSavedContent = function(){
	try{
		var data = JSON.parse(localStorage.getItem("fibberData"));
		//var data = localStorage.getItem("fibberData");
	}catch(err){
		fibber.log("ERROR: Could not parse the fibber data...");
	}
	fibber.trumpData = data.trumpData;
	fibber.clintonData = data.clintonData;

	//fibber.log("content loaded from saved session. clinton["+fibber.clintonData.length+"] trump["+fibber.trumpData.length+"]");
};

fibber.processClearSavedContent = function(){
	fibber.log("processClearSavedContent: clearing fibberData");
	localStorage.setItem("fibberData", "");
};

fibber.processCleanContent = function(){
	fibber.log("process: cleaning content");
	fibber.log("raw content loaded. clinton["+fibber.clintonData.length+"] trump["+fibber.trumpData.length+"]");

	//loop through the arrays and remove certain elements
	for(var i=0; i<fibber.clintonData.length; i++){
		fibber.log("Cleaning content clinton index["+i+"]");
		if(fibber.clintonData[i].speaker.last_name != "Clinton"){
			fibber.clintonData.splice(i,1);
			continue;
		}
		if(fibber.clintonData[i].ruling.ruling_slug == "mostly-true" || fibber.clintonData[i].ruling.ruling_slug == "true" || fibber.clintonData[i].ruling.ruling_slug == "half-true"){
			fibber.clintonData[i].ruling.ruling_slug = "truth";
		}
		if(fibber.clintonData[i].ruling.ruling_slug == "mostly-false" || fibber.clintonData[i].ruling.ruling_slug == "false" || fibber.clintonData[i].ruling.ruling_slug == "pants-fire"){
			fibber.clintonData[i].ruling.ruling_slug = "fib";
		}
		if(fibber.clintonData[i].ruling.ruling_slug != "fib" && fibber.clintonData[i].ruling.ruling_slug != "truth"){
			fibber.clintonData.splice(i,1);
		}
	}
	for(var i=0; i<fibber.trumpData.length; i++){
		fibber.log("Cleaning content trump index["+i+"]");
		if(fibber.trumpData[i].speaker.last_name != "Trump"){
			fibber.trumpData.splice(i,1);
		}
		if(fibber.trumpData[i].ruling.ruling_slug == "mostly-true" || fibber.trumpData[i].ruling.ruling_slug == "true" || fibber.trumpData[i].ruling.ruling_slug == "half-true"){
			fibber.trumpData[i].ruling.ruling_slug = "truth";
		}
		if(fibber.trumpData[i].ruling.ruling_slug == "mostly-false" || fibber.trumpData[i].ruling.ruling_slug == "false" || fibber.trumpData[i].ruling.ruling_slug == "pants-fire"){
			fibber.trumpData[i].ruling.ruling_slug = "fib";
		}
		if(fibber.trumpData[i].ruling.ruling_slug != "fib" && fibber.trumpData[i].ruling.ruling_slug != "truth"){
			fibber.trumpData.splice(i,1);
		}
	}

	fibber.log("content cleaned. clinton["+fibber.clintonData.length+"] trump["+fibber.trumpData.length+"]");
};

fibber.processRandomizeContent = function(){
	fibber.trumpData = fibber.processShuffleArray(fibber.trumpData);
	fibber.clintonData = fibber.processShuffleArray(fibber.clintonData);
};

fibber.processShuffleArray = function(array){
	var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

fibber.processDecision = function(decision){
	fibber.log("process: selection made: " + decision);

	//check if active statement is really truth or fib
	var rulingSlug = fibber.activeStatement.ruling.ruling_slug;
	var title = "";
	var feedback = "";
	var msg = "";
	fibber.log("statement ruling: " + rulingSlug);

	//first setup the feedback line
	if(rulingSlug == "truth" && decision == "truth"){
		feedback = "<b>Nice work!</b> You were right!<br>";
		fibber.truthDetectionArray[0]++;
		fibber.truthDetectionArray[1]++;
		//fibber.processScoreDecreaseForCharacter(fibber.activeCharacter);
	}
	if(rulingSlug == "fib" && decision == "fib"){
		feedback = "<b>Nice work!</b> You were right!<br>";
		fibber.fibDetectionArray[0]++;
		fibber.fibDetectionArray[1]++;
		fibber.processScoreDecreaseForCharacter(fibber.activeCharacter);
	}
	if(rulingSlug == "fib" && decision == "truth"){
		feedback = "<b>Not a truth!</b> You were wrong!<br>";
		fibber.fibDetectionArray[1]++;
		fibber.processScoreDecreaseForCharacter("player");
	}
	if(rulingSlug == "truth" && decision == "fib"){
		feedback = "<b>Not a fib!</b> You were wrong!<br>";
		fibber.truthDetectionArray[1]++;
		fibber.processScoreDecreaseForCharacter("player");
	}


	//now setup the information added to feedback statement
	title = fibber.activeStatement.ruling.ruling;
	msg = feedback + "<br>";
	msg += fibber.activeStatement.ruling_headline + ". ";
	msg += fibber.activeStatement.ruling_link_text + ".";


	//pop open and when cancel is called
	fibber.viewFeedback(title, msg);

};

fibber.processScoreDecreaseForCharacter = function(targetCharacter){
	fibber.log("process: decreasing available lives for target character: " + targetCharacter);

	//decrease target character by one
	fibber[targetCharacter + "Lives"]--;
	fibber.log("process: remaining lives for " + targetCharacter + "=" + fibber[targetCharacter + "Lives"]);

	//visually update the score
	fibber.viewChangeInScore(targetCharacter);
};

fibber.processCheckForWinLoseState = function(){
	fibber.log("process: checking to see if anyone won/lost");
	if(fibber.clintonLives == 0){
		fibber.viewEndGame('clinton');
	}
	if(fibber.playerLives == 0){
		fibber.viewEndGame('player');
	}
	if(fibber.trumpLives == 0){
		fibber.viewEndGame('trump');
	}
};


/*
LOAD RELATED FUNCTIONALITY ----------- LOAD LOAD LOAD
*/
fibber.loadViewStatementPanel = function(){
	fibber.log("view: loadViewStatementPanel() called..");

	//setup the fib and truth buttons
	$(".fib-btn").off().on("tap", function(){
		fibber.processDecision('fib');
	});
	$(".truth-btn").off().on("tap", function(){
		fibber.processDecision('truth');
	});

	//display the current statement
	fibber.viewStatement();
};

fibber.loadInstructionsPanel = function(){
	fibber.log("view: loadInstructionsPanel() called..");

	//assume player is restarting the session
	//1. clear all variables holding session data
	fibber.clintonCounter = 0;
	fibber.trumpCounter = 0;
	fibber.activeCharacter = "";
	fibber.clintonLives = 5;
	fibber.trumpLives = 5;
	fibber.playerLives = 5;

	//2. reset any visuals that were moved/modified
};



/*
VIEW RELATED FUNCTIONALITY ----------- VIEW VIEW VIEW
*/
fibber.viewStatement = function(){
	fibber.log("------------------------------")
	fibber.log("view: viewStatement() called..");

	//first check to see if anyone won/lost before next statement is shown
	fibber.processCheckForWinLoseState();

	//update the active character
	switch(fibber.activeCharacter){
		case "":
			fibber.activeCharacter = "clinton";
			break;

		case "clinton":
			fibber.activeCharacter = "trump";
			break;

		case "trump":
			fibber.activeCharacter = "clinton";
			break;
	}

	fibber.log("view: active character statement for: " + fibber.activeCharacter);

	//use active character and counter to pull statement object
	var data = fibber.activeCharacter + "Data";
	var index = fibber.activeCharacter + "Counter";
	var statement = fibber[data][fibber[index]];
	fibber.activeStatement = statement;

	//update display
	//$("#statement-headline").html(statement.ruling_headline);
	$("#statement-text").html(statement.statement);
	$("#statement-context").html("- " + statement.statement_context + " <span class='statement-date'>(" + moment(statement.statement_date).fromNow() + ")</span>");

	//disable the non-active character side
	if(fibber.activeCharacter == "clinton"){
		$("#trump").css("opacity",".1");
		$("#clinton").css("opacity","1");
		$("#clinton-action-btns").show('fast');
		$("#trump-action-btns").hide('fast');
		$("#statement").addClass("bubble-left");
		$("#statement").removeClass("bubble-right");
	}else{
		$("#clinton").css("opacity",".1");
		$("#trump").css("opacity","1");
		$("#trump-action-btns").show('fast');
		$("#clinton-action-btns").hide('fast');
		$("#statement").addClass("bubble-right");
		$("#statement").removeClass("bubble-left");
	}
	


	//increment the counter
	fibber[index]++;
	if(fibber[index] > fibber[data].length){
		fibber.log("ERROR: Player surpassed the available items from charaters. Reusing items.");
		fibber[index] = 0;
	}
};

fibber.viewCurrentScores = function(){
	fibber.viewChangeInScore("clinton");
	fibber.viewChangeInScore("trump");
	fibber.viewChangeInScore("player");
};

fibber.viewChangeInScore_old = function(targetCharacter){
	var newscore = fibber[targetCharacter + "Lives"] + " items left";
	$("#counter-"+targetCharacter).html(newscore);
};

fibber.viewChangeInScore = function(targetCharacter){
	var lives = fibber[targetCharacter + "Lives"];

	var livesHtml = "";
	for (var i=0; i<fibber.totalLives; i++){
		if(i < lives){
			livesHtml += "<span class='live-item'></span>";
		}else{
			livesHtml += "<span class='live-item-removed'></span>";
		}
	}

	$("#counter-"+targetCharacter).html(livesHtml);
};

fibber.viewFeedback = function(title, msg){

	$.afui.popup( {
	   title:title,
	   message:msg,
	   cancelText:"CONTINUE",
	   cancelCallback: function(){
	   	fibber.viewStatement();
	   },
	   cancelOnly:true
	 });

};

fibber.viewEndGame = function(characterLost){
	
	var html = "";
	if(characterLost == "player"){
		html = "<h3>You lost!</h3>"
		html += "<p>Try again next time.</p>"
	}else{
		html = "<h3>You won!</h3>"
		html += "<p>Looks like "+characterLost+" lost big time.</p>"
	}

	html += '<a href="#instructions" class="button">Restart</a>';

	//calculate fib and truth detection rates and display
	fibRate = fibber.fibDetectionArray[0]/fibber.fibDetectionArray[1];
	truthRate = fibber.truthDetectionArray[0]/fibber.truthDetectionArray[1];

	html += "fib detection rate: " + Math.round(fibRate * 100) + "% ["+fibber.fibDetectionArray[0]+" out of "+fibber.fibDetectionArray[1]+"]" 
	html += "<br>truth detection rate: " + Math.round(truthRate * 100) + "% ["+fibber.truthDetectionArray[0]+" out of "+fibber.truthDetectionArray[1]+"]" 

	//update panel html
	$("#endgame").html(html);
	fibber.go("#endgame");
};




