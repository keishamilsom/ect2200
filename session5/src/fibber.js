/*
SESSION 5 - Coding Basics

1. Setting text of a div
2. If/then logic
3. Using the console
4. Creating objects to store data
5. Handling other events besides "click"

*/


//var is used to create variables
//using the {} to create a variable that is type object
var fibber = {};


//this is a function that can be called using fibber.init();
fibber.initialize = function(){

	$("#startbtn").on("click", fibber.start);

};

fibber.start = function(){
	alert("Start Button Clicked...");
};












/*

---------------------------------IGNORE ALL OF THIS-------------------

fibber.viewStatement = function(){
};

fibber.processDecision = function(decision){
}

fibber.log = function(msg){
	console.log(msg);
};

fibber.loadRemoteContent = function(callback){
	
};



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

//setup custom on screen load functionality
	$("#instructions").on("panelload", function(){fibber.loadInstructionsPanel();});
	$("#viewstatement").on("panelload", function(){fibber.loadViewStatementPanel();});

*/