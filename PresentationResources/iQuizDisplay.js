/*
	iQuizDisplay.css
	Description
		Facilitates interactive presentations.  
	Requires:
		Jquery
		iQuizDisplay.css 
*/
//================================================================================
var iQuiz = new IQuiz;

$(document).ready(function()
{ 
	iQuiz.init();
});

//================================================================================
// IQuiz class
function IQuiz() {
	//Constants --------------------------------------
	//id's and/or classes of items on UI (in html)
	this.DIV_QUESTION_ID = "#question";
	this.DIV_ANSWERS_ID = "#answers";
	this.BUTTON_CLOSE_ID = "#buttonClose";
	this.BUTTON_RESPONSES_ID = "#buttonResponses";
	this.BUTTON_NEXT_ID = "#buttonNext";
	this.BUTTON_PREVIOUS_ID = "#buttonPrevious";
	this.RESPONSE_INDICATOR_CLASS = "responseIndicator";

	//other constants
	this.MAX_STUDENTS = 24; 
	
	//Private member variables ---------------------------
	this.aQuestions = new Array; 	//array of questions (each question consists of text and an array of answers)
	this.currentQuestionNdx=-1; 	//currently displayed question
	
	//this.aResponses = new Array;	//integers, element 0 is # choose a, 1 is number who chose b, etc..
}

//-----------------------------------------------------------------------------
IQuiz.prototype.init = function() {
	
	//attach event handlers
	$(this.BUTTON_CLOSE_ID).click(function() {
		alert("close!");
	});
	$(this.BUTTON_RESPONSES_ID).click(function() {
		alert("show responses!");
	});
	
	var me=this;
	$(this.BUTTON_NEXT_ID).click(function() {
		me.currentQuestionNdx++;
		me.displayCurrentQuestion();
	});
	$(this.BUTTON_PREVIOUS_ID).click(function() {
		me.currentQuestionNdx--;
		me.displayCurrentQuestion();
	});
	
	//create student response indicator grid
	$("#ccenter").html("<table style='width: 100%; table-layout: fixed;'><tr id='row1'></tr><tr id='row2'></tr></table>");
	for (var x=1;x<=this.MAX_STUDENTS;x++) {
		var sRowId="#row1";
		if (x>this.MAX_STUDENTS/2)
			sRowId="#row2";
		var sRespID="#" + this.RESPONSE_INDICATOR_CLASS + x;
		$(sRowId).append("<td class='" + this.RESPONSE_INDICATOR_CLASS + "' id='" + sRespID +"'>" + x + "</td>");
	}

	BuildTestData();
	
	//Load Questions from arg list
	var uri = window.location.search.substr(1); //gets all parameters (after &)
	var sQuestions=uri.substr(uri.search("questions=")+10);
	if (sQuestions.length <= 0)
		alert("Error!  No Quiz data!\nQuiz questions must be passed as parameters\ne.g. iQuizDisplay.html?Questions=...");
	else {
		//convert URI back into array of objects
		var jsonQuestions = decodeURIComponent(sQuestions);
		this.aQuestions = JSON.parse(jsonQuestions);
		//display first question
		this.currentQuestionNdx=0;
		this.displayCurrentQuestion();
	}
}
//-----------------------------------------------------------------------------
IQuiz.prototype.displayCurrentQuestion = function() {
	
	var oQuestion = this.aQuestions[this.currentQuestionNdx];
	
	var sQuestion = "" + (this.currentQuestionNdx+1) + ". " + oQuestion.text;
	$(this.DIV_QUESTION_ID).html(sQuestion);
	
	//build array of answer data. 
	//Each answer line consists of three item (put into a td's): (#responses, answer_letter, Actual answer)
	var aAnswers = oQuestion.answers;
	var sHTML="<table style='border-spacing: 15px;'><tbody style='text-align: left; vertical-align: top;'>";
	for(var AnsNdx=0; AnsNdx<aAnswers.length; AnsNdx++) {
		sResponses="";
		sAnsLetter="" + String.fromCharCode(AnsNdx+97) + ")"; //97 is 'a'
		sAnswer=aAnswers[AnsNdx];
		sHTML+="<tr><td style='width: 50px'>" + sResponses + "</td><td style='width: 30px'>" + sAnsLetter + "</td><td>" + sAnswer + "</td></tr>";
	}
	sHTML+="</tbody></table>";
	$(this.DIV_ANSWERS_ID).html(sHTML);
	
	//disable/enable nav buttons
	this.configureButtons();
}

//-----------------------------------------------------------------------------
IQuiz.prototype.configureButtons = function() {
	
	//previous question button
	if (this.currentQuestionNdx <= 0)
		$(this.BUTTON_PREVIOUS_ID).attr("disabled", "disabled");
	else
		$(this.BUTTON_PREVIOUS_ID).removeAttr("disabled");
	
	//next question button
	if (this.currentQuestionNdx >= this.aQuestions.length-1)
		$(this.BUTTON_NEXT_ID).attr("disabled", "disabled");
	else
		$(this.BUTTON_NEXT_ID).removeAttr("disabled");
}	
//-----------------------------------------------------------------------------
function BuildTestData() {

	//test data
	//	questions start at beginning of line
	//	answers are prefaced with a tab
	var tq="";
	tq+="Which of the following makes the best pet?\n\tcat \n\tdog \n\tman eating lion \n\t elephant ... or dog ... or bird... or something else.  But definately not a man eating lion.";
	tq+="\nHow many legs does a dog have? sfsfafas sdf sadf fsda fds fa as as as as sd asd  as sa  as f asfd fsdsaf    asdf sfda sdf sfad fsda fds fsda \n	1 \n\t2 \n\t3 \n\t4";
	tq+="\nHow many tails does a cat have?\n\t1 \n\t2 asdf a a fas as as fasf as asffsfa asf asfasfsad asf asf as fasf as asf asf asfasfa asf asdf asf fsad safd \n\t3 \n\t4";
	tq+="\nThe sky is blue?\n\t1true \n\tfalse";
	//alert(tq);
	
	//put data into array
	var tqa = tq.split("\n");
	//alert(tqa);
	
	//build array of question objects
	// 	each question object consists of:
	//		text: question
	//		answers: array of answers (each answer is a string
	var q=new Array;
	qstNdx=-1;
	for(var strNdx=0; strNdx<tqa.length; strNdx++) {
		//if new question (doesn't start with tab)
		if(tqa[strNdx].charAt(0) != "\t") {
			qstNdx++;
			q[qstNdx] = new Object;
			q[qstNdx].text = tqa[strNdx];
			ansNdx=-1;
			q[qstNdx].answers = new Array;
			//alert("Question: " + tqa[strNdx]);
		}
		//otherwise it's an answer for previous question
		else {
			ansNdx++;
			q[qstNdx].answers[ansNdx] = tqa[strNdx];
			//alert("Answer: " + tqa[strNdx]);
		}
	}
	
	//convert array of objects into URI and create link for testing
	var jsonQ = JSON.stringify(q);
	var uriQ = encodeURIComponent(jsonQ);

	//put test link on page (recursion!)
	var url="file:///C:/Users/Rich/Dropbox/Public/MoodleDataStore/Presentations/iQuizDisplay.html?questions=" + uriQ;
	$('body').append("<a href='" + url + "' target='_blank'>Test link</a>");
	
}



//----------------------------------------------------------------------------