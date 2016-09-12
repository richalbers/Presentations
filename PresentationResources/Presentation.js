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

//constants
var SELECTED_ITEM_COLOR = "gray";

//globals
var aSlides=new Array (); //each element will hold one Slide.  Each slide is a string.
var sOutline="";
var iCurrentSlide=0;

var ImgCanvas; 			//object to enable drawing on image
var styleController;	//object to enable picking "page styles"

//---------------------------------------------------------------------
$(document).ready(function()
{ 
	//Add divs for outline, visible slide (main), Style select box, and Overlay screen (for enlarged imaages)
	$('body').append("<div id='Outline'></div>");
	$('body').append("<div id='Main' )></div>");

	$('body').append("<div id='FullScreenOverlay'> <div>" +
		"<div id='CenteredBox'>" +
			"<div id='RedX'>&nbsp; X &nbsp;</div>" +
			"<img id='BigImage'/>" +
		"</div>" +
	"</div></div>");

	//set up style selections and handler (will fail if PageStyle.js wasn't previously included)
	try {
		styleController = new StyleControl();
	} catch (err) {
		console.log("StyleControl object missing.  PageStyle.js file missing?");
	}
	
	//Build the slides and outline
	BuildSlides(); 
	BuildOutline();
	document.title = GetTitle(aSlides[0]);	
	
	//Configure canvas to be used for drawing on images
	try {
		ImgCanvas = new ImageCanvas("BigImage");	
	} catch (err) {
		console.log("ImageCanvas object (for drawing) is missing.  Drawing.js file missing?");
	}	
	//when lines are clicked on highlight them (futue ones too)
	$('#Main li, h1').live('click', function() {
		//swap color and background-color
		var color=$(this).css('background-color');
		if (color == 'gray')
			$(this).css('background-color', '' );
		else
			$(this).css('background-color', 'gray' );
	});
	
	//When small images are clicked display larger (now and in future)
	$('img.small').live('click', function() {
		sSrc=$(this).attr("src");
		$('#BigImage').attr("src", sSrc); /*#BigImage*/
		$('#FullScreenOverlay').css('display', 'table');
		
		//Configure canvas to be used for drawing on images
		try { 
			ImgCanvas.ReSize();
		} catch(err) { };
	});	
	
	//and when large image is clicked it goes away...
	$('#RedX').live('click', function() {
		$('#FullScreenOverlay').css('display', 'none');
	});	
	
	//show the first slide
	ShowSlide(0);

});


//---------------------------------------------------------------------
// build main slides from data
function BuildSlides()
{
	//read data from data div and place it into arrays for processing
	sData=document.getElementById("Data").innerHTML; //one giant string
	//alert(sData);  //TEST
	//divide data into individual pages (strings) at lines starting with ----...
	sData=sData.replace(/----*/g,"NewSlide");
	var aData=sData.split("NewSlide");

	//turn each page (aData entry) into a string of HTML code
	for (i=0;i<aData.length;i++) 
		if (aData[i].length > 9) {
			sHTML=BuildHTML(aData[i]);
			aSlides[aSlides.length]=sHTML;
		}
	//alert("Data Loaded!"); //TEST
}


//---------------------------------------------------------------------
//build outline (displayed on the left) from slide headings
function BuildOutline()
{
	//build outline html based on titles (first h1 tags) in slide array
	var sSlideText = "";
	for (i=0;i<aSlides.length;i++) {
		//build associated line for Outline
		sSlideText="<div class=\"OutlineItem\" id=\"LX\"><a href=\"Javascript: ShowSlide(X)\">text</a></div>";
		sSlideText=sSlideText.replace(/X/g, i);
		sSlideText=sSlideText.replace(/text/, GetTitle(aSlides[i]) );
		//$('#Outline").append(sSlideText);
		sOutline+=sSlideText;	//global holding all outline html code
	}
	
	//write the html code 
	document.getElementById("Outline").innerHTML=sOutline;
	//alert(sOutline);	//TEST
}

//---------------------------------------------------------------------
// Show the specified slide
function ShowSlide(SlideNum)
{
	//save current slide number
	iOldSlide=iCurrentSlide;

	//set new slide number
	if (SlideNum == -1)
		iCurrentSlide=iCurrentSlide+1
	else
		iCurrentSlide=SlideNum;

	//bounds checks
	if (iCurrentSlide>=aSlides.length) iCurrentSlide=aSlides.length-1;
	if (iCurrentSlide<0) iCurrentSlide=0;

	//put requested page in Main div
	//alert(aSlides[iCurrentSlide]);
	document.getElementById("Main").innerHTML=aSlides[iCurrentSlide];

	//change background colors of Outline to denote where we are
	document.getElementById("L" + iOldSlide).style.backgroundColor="transparent"; //document.getElementById("Outline").style.backgroundColor;
	document.getElementById("L" + iCurrentSlide).style.backgroundColor=SELECTED_ITEM_COLOR;
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
	var aSlide=sSlide.split("\n"); 	//each line becomes one array entry
	var sHTML = ""; 		//HTML output will go here
	var iLvl=0;			//keeps track of <ul> nesting level
	var sCodeClass="";
	
	for (var j=0; j<aSlide.length; j++) {
		var line=aSlide[j];
		if (line.length>2) {
			line = line.replace("<","&lt;");
			line = line.replace(">","&gt;");
			line = FindAndFormatImgs(line);
			line = FindAndFormatLinks(line);
			if (line.search(/\[\[code\]\]/) >= 0) //check for beginning of code marker
				sCodeClass="Code";
			else { //other lines are probably list (possibly nested) items
				var iTabCount=0;
				while (line.charAt(iTabCount) == '	') iTabCount++;
				while (iTabCount > iLvl) { sHTML+="<ul class=\"Level" + iLvl + " " + sCodeClass + "\">"; iLvl++; sCodeClass="";}
				while (iTabCount < iLvl) { sHTML+="</ul>"; iLvl--; }
				if (iLvl==0)
					sHTML+="<h1>" + line + "</h1>";
				else
					sHTML= sHTML + "<li>" + line.substr(iLvl) +  "</li>";
			}
		}
	}
	while (iLvl > 0) { sHTML+="</ul>"; iLvl--; }

	return sHTML;
}

//---------------------------------------------------------------------
// Finds and replaces all image specifies with actual html
// Replaces [[img http://static.howstuffworks.com/gif/vpn-2.gif]]
//     with <img src="http://static.howstuffworks.com/gif/vpn-2.gif>
function FindAndFormatImgs(sLine)
{
	var iBeg = sLine.search(/\[\[img .*\]\]/); //find first validly specified image
	while (iBeg >= 0) {
		var iEnd = sLine.indexOf(']]', iBeg);
		var sImgURL=sLine.substring(iBeg+6, iEnd);
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

