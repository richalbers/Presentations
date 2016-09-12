/*
	Presentation.html
	Description
		Facilitates html-based presentations.  See PresentationExample.html for demo on how to use
	Requires:
		Jquery
		Presentation.css 
		PageStyle.js - enables page "style sets" to be selected
		Drawing.js - enables on-image drawing
*/

//globals
var Globals = {
	iCurrentSlide: 0,
	aSlides: new Array(), 	//each element will hold one Slide.  Each slide is a string.
	sOutline: "",
	sImgPath: "",			//relative path to data file, to be used to locate associated relative images
	ImgCanvas: null,		//object to enable drawing on image
	styleController: null	//object to enable picking "page styles"
}

//---------------------------------------------------------------------
$(document).ready(function()
{ 
	//Add divs for outline, visible slide (main), Style select box, and Overlay screen (for enlarged imaages)
	$('body').append("<div id='Outline' class='OutlineNormal'></div>");
	$('body').append("<div id='Main' class='MainNormal'></div>");
	$('body').append("<div id='CodeLineDesc'></div>");

	//used to display images and quizzes
	$('body').append("<div id='FullScreenOverlay'> <div>" +
		"<div id='CenteredBox'>" +
			"<div id='RedX'>&nbsp; X &nbsp;</div>" +
			"<img id='BigImage'/>" +
		"</div>" +
	"</div></div>");

	//set up style selections and handler (will fail if PageStyle.js wasn't previously included)
	try {
		Globals.styleController = new StyleControl();
	} catch (err) {
		console.log("StyleControl object missing.  PageStyle.js file missing?");
	}
	
	//get File to Load (everything after ? on URL)
	var sDataURL = GetUrlParam("file");
	if (sDataURL == null) {
		$('#Main').html('Error - Presentation data file not specified<br>(add "?file=someFileName" to URL)');
		return;
	}
	
	//If the URL contains more than just a filename, save the path (images will be relative to it)
	var pathEnd = sDataURL.lastIndexOf("/");
	if (pathEnd >= 0) {
		Globals.sImgPath=sDataURL.substring(0,pathEnd+1); //includes /
		//alert(Globals.sImgPath); //TEST
	}
	
	//Build the slides and outline
	$.get(sDataURL, function(sData) {
		BuildSlides(sData); //puts data into global array Globals.aSlides
		
		$('#Outline').html(BuildOutline());
		$('#Outline div').each(function() {
			$(this).addClass("OutlineItem");
			var sHtml = $(this).html()
			if (sHtml == "Practice")
				$(this).addClass("Practice");
		});
		$('#Outline div').click( function() {
			var iSlideNum = $(this).attr("data-slidenum");
			ShowSlide(iSlideNum);
		});
		
		document.title = GetTitle(Globals.aSlides[0]);	
		ShowSlide(0);
	})
	.error(function() { 
		$('#Main').html("Error - Presentation data file " + sDataURL + " was not found.");
	})
	
	//Set up event handlers to shrink/expand Outline
	//$("#Main").dblclick(function() {
	//	$("#Outline").removeClass("OutlineNormal").addClass("OutlineShrunk");
	//	$("#Main").removeClass("MainNormal").addClass("MainBig");
	//});
	//$("#Outline").dblclick(function() {
	//	$("#Outline").removeClass("OutlineShrunk").addClass("OutlineNormal");
	//	$("#Main").removeClass("MainBig").addClass("MainNormal");
	//});
	
	//Configure canvas to be used for drawing on images
	try {
		Globals.ImgCanvas = new ImageCanvas("BigImage");
	} catch (err) {
		console.log("ImageCanvas object (for drawing) is missing.  Drawing.js file missing?");
	}	
	
	
	//When small images are clicked display larger (now and in future)
	$('img.small').live('click', function() {
		//display image
		var widthPercent = Math.floor($(this).width() / $(this).height() * 70); //calculation is a guestimate... might need work
		if (widthPercent>100)
			widthPercent = 100;
		$('#BigImage').attr("width", "" + widthPercent + "%");	
	
		var sSrc=$(this).attr("src");
		$('#BigImage').attr("src", sSrc); /*#BigImage*/
		
		Globals.ImgCanvas.HideToolBox(); 
		$('#FullScreenOverlay').css('display', 'table');
		$("#CenteredBox").animate({width: '80%'}, 400, function() {
			try { 
				Globals.ImgCanvas.ReSize();
				Globals.ImgCanvas.ShowToolBox();
			} catch(err) { };	
		});
	});	
	
	//and when large image's red X is clicked it goes away...
	$('#RedX').live('click', function() {
		//$("#FullScreenOverlay").fadeOut(500);
		Globals.ImgCanvas.ReSize(); //clears drawing of any user-added drawing stuff - Kludge...
		Globals.ImgCanvas.HideToolBox(); 
		$("#CenteredBox").animate({width: '10%'}, 400, function() { 
			$('#FullScreenOverlay').css('display', 'none');
		})
	});	
	
	//Show any source code line descriptions below the line they pertain to
	$('li[data-linedesc]').live('mouseenter', function() {
		var sLineDesc = $(this).attr('data-linedesc');
		$('#CodeLineDesc').html(sLineDesc);
		$('#CodeLineDesc').show();
		var p = $(this).offset();
		$('#CodeLineDesc').offset({top: p.top+35, left: p.left }); //initial display, line wrap may occur
	});
	$('li[data-linedesc]').live('mousemove', function() { //makes sure element stays visible
		$('#CodeLineDesc').show();
	});
	$('li[data-linedesc]').live('mouseout', function() {
		$('#CodeLineDesc').hide();
	});
	//$('li[data-linedesc]').live('click', function() {
	//	alert("click");
	//});
});

//---------------------------------------------------------------------
// get specified URL parameter
function GetUrlParam(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results != null)
		return results[1];
	else
		return null;
}

//---------------------------------------------------------------------
// build main slides from data.  Results are put into Global Array aSlides.
function BuildSlides(sData)
{
	//alert(sData);  //TEST
	//divide data into individual pages (strings) at lines starting with ----...
	sData=sData.replace(/----*/g,"NewSlide");
	//alert(sData.replace(/[^a-zA-Z]/g,"z"));
	var aData=sData.split("NewSlide");
	
	//turn each page (aData entry) into a string of HTML code and store it in the array of slides
	for (i=0;i<aData.length;i++) 
		if (aData[i].length > 9) {
			//alert(aData[i]); //TEST
			sHTML=BuildHTML(aData[i]);
			Globals.aSlides[Globals.aSlides.length]=sHTML;
			//alert(sHTML); //TEST
		}
	//alert("Data Loaded!"); //TEST
}

//---------------------------------------------------------------------
function BuildOutline()
{
	//build outline html based on titles (first h1 tags) in slide array
	var sSlideText = "";
	for (i=0;i<Globals.aSlides.length;i++) {
		//build associated line for Outline
		sSlideText="<div id=\"LX\" data-slidenum=\"X\">text</div>";
		sSlideText=sSlideText.replace(/X/g, i);
		sSlideText=sSlideText.replace(/text/, rtrim(GetTitle(Globals.aSlides[i]) ) );
		Globals.sOutline+=sSlideText;	//global holding all outline html code
	}
	
	return Globals.sOutline;
}

//---------------------------------------------------------------------
// Show the specified slide
function ShowSlide(SlideNum)
{
	//save current slide number
	var iOldSlide=Globals.iCurrentSlide;

	//set new slide number
	if (SlideNum == -1)
		Globals.iCurrentSlide=Globals.iCurrentSlide+1
	else
		Globals.iCurrentSlide=SlideNum;

	//bounds checks
	if (Globals.iCurrentSlide>=Globals.aSlides.length) Globals.iCurrentSlide=Globals.aSlides.length-1;
	if (Globals.iCurrentSlide<0) Globals.iCurrentSlide=0;

	//put requested page in Main div
	//alert(Globals.aSlides[Globals.iCurrentSlide]);
	var speedMS=300;
	$("#Main").fadeOut(speedMS, function() {
		$("#Main").html(Globals.aSlides[Globals.iCurrentSlide]).fadeIn(speedMS);
	});
	//document.getElementById("Main").innerHTML=Globals.aSlides[Globals.iCurrentSlide];

	//change background colors of Outline to denote where we are
	var sID="#L" + iOldSlide;
	$(sID).removeClass("Selected");
	sID="#L" + Globals.iCurrentSlide;
	$(sID).addClass("Selected");
}

//---------------------------------------------------------------------
//return the title (first h1 data) from the given html code
function GetTitle(sHTML)
{
	var iTitleStart=sHTML.indexOf("<h1")+4;
	var iTitleEnd=sHTML.indexOf("</h1>");
	var sTitle=sHTML.substring(iTitleStart, iTitleEnd);
	return sTitle;
}

//---------------------------------------------------------------------
// Build HTML code for one slide
function BuildHTML(sSlide)
{
	var aSlide; 	
	var sHTML = ""; 	//HTML output will go here
	var iLvl=0;			//keeps track of <ul> nesting level
	var iCodeLevel=0;	//beginning code level
	var sCodeClass="";
	var bFormatAsCode = false;
	
	//clean up data
	sSlide = trim(sSlide); //remove whitespace from ends...
	//alert(sSlide);
	
	//If iQuiz page, make a link that executes a function which handles displaying the quiz
	if (sSlide.search(/^iQuiz/) >= 0) { //if iQuiz is the first text that appears
		//get question and answer data from slide 
		var sQuizText = sSlide.replace(/^iQuiz/,""); //remove "iQuiz"
		var sQuizText = ltrim(sQuizText); //remove whitespace from beginning
		
		sHTML+="<h1>" + "Review Quiz" + "</h1>";
		sHTML+="<p>Click <a href='Javascript: displayQuiz(\"" + sQuizText + "\")'>here</a> to begin the quiz!</p>";
		//alert(sHTML); TODO - make span, save displayQuiz data in tag as data-qd attribute, and use JQuery to call the routine
		return sHTML;
	}
	
	//otherwise, it's a regular presentation slide.  Format it as HTML
	//The slide ends up being a bunch of nested unordered lists, including the code (for better or worse),
	//with images "floated" to the right.
	//Tabs at the beginning of each line control the insertion of <ul> tags
	
	aSlide=sSlide.split("\n"); 	//each line becomes one array entry (string) for processing
	
	for (var j=0; j<aSlide.length; j++) {        //process each line
		var line=aSlide[j];
		//"beginning of code" marker denotes lines that follow will be formatted as code
		if (line.search(/\[\[code\]\]/) >= 0) { 
				sCodeClass="Code";
				bFormatAsCode = true;
				iCodeLevel=iLvl;
		 //other lines will be displayed as list items (even code, although list marker is removed from those via css)
		} else {
			//removes newline character from end
			if (line[line.length-1] == '\n')
				line = line.substr(0,line.length-1); 
			//format line as html
			line = line.replace("<","&lt;");
			line = line.replace(">","&gt;");
			line = FindAndFormatImgs(line);
			line = FindAndFormatLinks(line);
			
			//determine how far line is tabbed in (count the tabs)
			//if it's indented further than the previous line, add necessary <ul> tags (probably only one)	
			//if it's indented less than the previous line, add necessary </ul> tags (probably just one)		
			var iTabCount=0;
			while (line.charAt(iTabCount) == '	') 
				iTabCount++;
			
			while (iTabCount > iLvl) {
				sHTML+="<ul class=\"Level" + iLvl + " " + sCodeClass + "\">\n"; 
				iLvl++; 
				sCodeClass="";
			}

			while (iTabCount < iLvl) { 
				sHTML+="</ul>\n"; 
				iLvl--; 
				if (iLvl <= iCodeLevel) // no longer code
					bFormatAsCode = false;
			}
			
			//format the line as either a heading element or list item and add to Page
			line = line.substr(iLvl); //removes leading tab chars (ul nesting handles indentation)
			if (iLvl==0) 
				line="<h1>" + line + "</h1>\n";
			else if (bFormatAsCode == true) {
				// If there's a line description, make it a property of the tag
				var sLineDesc = "";
				var iBeg = line.search(/\[\[desc .*\]\]/); //find line Description 
				if (iBeg > 1) {
					var iEnd = line.search(/\]\]/);
					sLineDesc =  "data-linedesc=\"" + line.substring(iBeg+7, iEnd) + "\"";
					var sLineNew = line.substring(0,iBeg);
					line = sLineNew;
				}
				line = "<li " + sLineDesc + ">&nbsp;" + ColorCodeAsCPP(line) +  "&nbsp;</li>\n";
			} else //regular non-code line
				line = "<li>" + line +  "</li>\n";
			sHTML+=line;
		}
	}
	while (iLvl > 0) { sHTML+="</ul>"; iLvl--; }

	//alert(sHTML); //TEST
	return sHTML;
}

//---------------------------------------------------------------------
// Finds and replaces all image specifies with actual html
// Replaces [[img http://static.howstuffworks.com/gif/vpn-2.gif]]
//    with  <img src="http://static.howstuffworks.com/gif/vpn-2.gif">
// and      [[img images/zzz.jpg]]
//    with  <img src="path_to_datafile/images/zzz.jpg">
function FindAndFormatImgs(sLine)
{
	var iBeg = sLine.search(/\[\[img .*\]\]/); //find first validly specified image
	while (iBeg >= 0) {
		var iEnd = sLine.indexOf(']]', iBeg);
		var sImgURL=sLine.substring(iBeg+6, iEnd);
		if (! ((sImgURL.substring(0,5) == "http:") || (sImgURL.substring(0,6) == "https:")) ) // if not absolute
			sImgURL = Globals.sImgPath + sImgURL;
		//if image starts in first position, it's assumed is all by itself on a line, we'll center it
		if (iBeg == 0) {
			var sTag="<div class=\"lic\"><img class=\"large\" src=\"" + sImgURL + "\"></div>"; 
			var sLineNew = sTag;
		}
		//otherwise we'll float it right
		else {
			var sTag="<img class=\"small\" src=\"" + sImgURL + "\" width=200 >"; 
			var sLineNew = sLine.substring(0,iBeg) + sTag + sLine.substring(iEnd+2);
		}
		//alert(sLineNew);
		sLine=sLineNew;
		iBeg = sLine.search(/\[\[img .*\]\]/); //find next validly formatted img
	}	
	return sLine;
}

//---------------------------------------------------------------------
// Finds and replaces all links with actual html
// Replaces [[news!www.cnn.com]]
//     with <a href="http:\\www.cnn.com" target="_blank">news</a>
function FindAndFormatLinks(sLine)
{
	var iBeg = sLine.search(/\[\[.*!.*\]\]/); //find first validly formatted link
	while (iBeg >= 0) {
		var iMid = sLine.indexOf('!', iBeg);
		var iEnd = sLine.indexOf(']]', iMid);
		var sLink=sLine.substring(iBeg+2, iMid);
		var sTarget=sLine.substring(iMid+1, iEnd);
		if (sTarget.substr(0,3)== "www") sTarget="http://" + sTarget;
		var sTag="<a href=\"" + sTarget + "\" target=\"_blank\">" + sLink + "</a>"; 
		var sLineNew = sLine.substring(0,iBeg) + sTag + sLine.substring(iEnd+2);
		sLine=sLineNew;
		iBeg = sLine.search(/\[\[.*!.*\]\]/); //find next validly formatted link
	}	
	return sLine;
}
//---------------------------------------------------------------------
// find single line (of code) description, which will be displayed using "popup" text
function FindLineDesc(sLine)
{
	//FIX FIX FIX
	var sLineDesc = "";
	var iBeg = sLine.search(/\[\[desc .*\]\]/); //find line Desc
	var iEnd = sLine.search(/\]\]/);
	if (iBeg > 0) {
		var sLineDesc = sLine.substring(iBeg+7, iEnd);
		var sLineNew = sLine.substring(0,iBeg);
		sLine = sLineNew;
		alert(sLine);
		alert(sLineNew);
	}
		
	return sLineDesc;
}
//---------------------------------------------------------------------
// ColorCode as CPP
// 	comments are green, keywords are blue (some keywords, but not yet all)
// Note: C-style comments and literal strings aren't yet handled, and an extra space is inserted sometimes...
function ColorCodeAsCPP(sLine)
{	
	var sCode;
	var sComment;
		
	//separate code from single-line comment (if there is one)
	var iCommentStart = sLine.indexOf('//',0);
	if (iCommentStart >= 0) {
		sCode = sLine.substring(0, iCommentStart);
		sComment = sLine.substring(iCommentStart);
	}
	else {
		sCode = sLine;
		sComment = "";
	}
	
	//replace double-blanks with code to preserve them
	sCode = sCode.replace(/  /g," &nbsp;");
	
	//color keywords blue
	var aKeyWords=new Array(
		"void", "bool", "char", "short", "int", "float", "double", "unsigned", "string", 
		"#include", "using", "namespace", "const", "const;", "static_cast", "return", "return;",
		"if", "else", "switch", "case", "default", "default:", "break", "break;", "continue;", "true", "false",
		"do", "for", "while",
		"struct", "class", "private:", "public:", "protected:",
		"int*", "char*", "float*", "long*", "new", "delete"
	);
	var aWords=sCode.split(" ");
	var sSep="";
	sCode = "";
	for (var i=0;i<aWords.length;i++) { 
		if (aKeyWords.indexOf(trim(aWords[i])) > -1) 
			sCode=sCode + sSep + "<span class=\"Blue\">" + aWords[i] + "</span>";
		else
			sCode=sCode + sSep + aWords[i];
		sSep=" ";
	}
	
	//reassemble code with possible trailing comment
	sLine = sCode;
	if (sComment != "") 
		sLine = sLine + "<span class=\"Green\">" + sComment + "</span>"; 
	return sLine;
}
//-----------------------------------------------------------------------------
function FormatQuizData(sQuizData) {
	//parameter sQuizData
	//	questions start at beginning of line
	//	answers are prefaced with a tab
	
	//put data into array
	var tqa = sQuizData.split("\n");
	
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

	return uriQ;
	
	//put test link on page (recursion!)
}
//----------------------------------------------------------------------------------------------
function displayQuiz(sQuizText) {
	//sQuizText is a \n delimited list of lines representing questions and answers.  Answers begin with a \t
	//format it as URI 
	alert(sQuizText);

	var sURI = FormatQuizData(sQuizText);
	var sURL="https://dl.dropbox.com/u/56405057/MoodleDataStore/Presentations/iQuizDisplay.html";
	sURL += "?questions=";
	sURL += sURI;

	//TODO - display preceding link in a "popup" iframe that shades out and disables the rest of the page!!
	alert(sURL);
}
//----------------------------------------------------------------------------------------------
// String trim functions: trim, rtrim, ltrim
function trim(str, chr) {
  var rgxtrim = (!chr) ? new RegExp('^\\s+|\\s+$', 'g') : new RegExp('^'+chr+'+|'+chr+'+$', 'g');
  return str.replace(rgxtrim, '');
}
function rtrim(str, chr) {
  var rgxtrim = (!chr) ? new RegExp('\\s+$') : new RegExp(chr+'+$');
  return str.replace(rgxtrim, '');
}
function ltrim(str, chr) {
  var rgxtrim = (!chr) ? new RegExp('^\\s+') : new RegExp('^'+chr+'+');
  return str.replace(rgxtrim, '');
}