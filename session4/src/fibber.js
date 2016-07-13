
//var is used to create variables
//using the {} to create a variable that is type object
var fibber = {};


//this is a function that can be called using fibber.init();
fibber.init = function(){

	$("#startbtn").on("click", fibber.start);

};


//this is a function that can be called using fibber.start();
fibber.start = function(){

	alert('START BUTTON WAS CLICKED');

	/*
	This code is commented out so it is greyed out and will not run
	fibber.add(5,4);
	fibber.add(3,3);
	fibber.add(0,1);
	*/

};


//this is a function that can be called using fibber.add(5,2);
fibber.add = function(x, y){
	var z;
	z = x + y;
	alert("SUM IS EQUAL TO: " + z);
}

