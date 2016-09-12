/*
	Stylecontrol - Adds select box to upper right-hand corner of the page which allows you to 
		select a style (which controls numerous properties)
		
	To use, simply create a style control object somewhere permanent, like this:
		var styleControl;	//declared globally
		styleController = new StyleControl; //called when page loads
*/

//---------------------------------------------------------------------
// StyleControl Object constructor (must be called AFTER page is ready)
function StyleControl()  
{
	//constants
	this.STYLE_SELECT_ID="#StyleSelect";
	this.STYLE_ELEMENTS_PER_ENTRY=6; 
	
	//Style Name, Background,  MainTextColor, OutlineBackColor, OutlineTextColor, OutlineBorderColor
	this.aStyleInfo=new Array(
		"Blackboard", "url(./PresentationResources/Chalkboard.jpg)", "white", "#ffff66", "black", "black",
		"Blackboard2", "url(./PresentationResources/Chalkboard.jpg)", "white", "transparent", "#ffff66", "#ffff66",
		"Blue", "DarkBlue", 				 "white", "LightBlue", "black", "black",
		"Green", "DarkGreen",			 	 "white", "LightGreen", "black", "black",
		"Aurora Borealis", "url(./PresentationResources/AuroraBorealis.jpg)", "white", "transparent", "white", "white"
	);

	//add style selector to page and populate it with style selections
	$('body').append("<select id='StyleSelect'></select>");
	for(x=0;x<this.aStyleInfo.length/this.STYLE_ELEMENTS_PER_ENTRY;x++) {
		$(this.STYLE_SELECT_ID).append( new Option(this.aStyleInfo[x*this.STYLE_ELEMENTS_PER_ENTRY], x ));
	}
	
	$(this.STYLE_SELECT_ID).css('display', 'block');
	$(this.STYLE_SELECT_ID).css('position', 'absolute');
	$(this.STYLE_SELECT_ID).css('top', '10px');
	$(this.STYLE_SELECT_ID).css('right', '10px');
	$(this.STYLE_SELECT_ID).css('z-index', '2');
	
	//set up style "change" event handler
	var me=this;
	$(this.STYLE_SELECT_ID).change(function() {
		me.SetStyle($(me.STYLE_SELECT_ID).val());
	});
	
	//set initial style
	this.SetStyle(0);
};

//---------------------------------------------------------------------
StyleControl.prototype.SetStyle = function(iStyle) {
	//get base index 
	x=iStyle*this.STYLE_ELEMENTS_PER_ENTRY;
	
	//set styles
	if(this.aStyleInfo[x+1][0] == 'u') {
		//background is image specified by URL
		$('body').css('background-image', this.aStyleInfo[x+1]);
		$('body').css('background-color', "none");
	} else {	
		//background is a color
		$('body').css('background-image', "none");
		$('body').css('background-color', this.aStyleInfo[x+1]);
	}
	$('body').css('color', this.aStyleInfo[x+2]);
	
	$('#Outline').css('background-color', this.aStyleInfo[x+3]);
	$('#Outline').css('color', this.aStyleInfo[x+4]);
	$('#Outline').css('border', '1px solid ' + this.aStyleInfo[x+5]);
	
}
