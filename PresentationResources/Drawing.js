
// ------------------------------------------------------------------------------- 
// ImageCavas Object Constructor
function ImageCanvas(imgID) {
	this.container; // container for our canvases (same as parent container for imgID element

	this.canvasWork; //canvas for drawing current stroke (line, square, etc..
	this.contextWork;

	this.canvasAll; //all strokes are combined onto this
	this.contextMain;

	this.drawing = false; // not currently drawing
	this.imgID = "#" + imgID;
	
	//get image container
	this.container = $(this.imgID).parent();
	if (!this.container) {
		alert('Bad image ID was provided.');
		return;
	}
	
    // Add canvas elements
    $(this.container).append("<canvas id='mainCanvas' class='drawingCanvas'></canvas>");
	$(this.container).append("<canvas id='workCanvas' class='drawingCanvas'></canvas>");
	
	//$('canvas').css('display', 'absolute');
	//$('canvas').css('top', '0px');
	//$('canvas').css('left', '0px');
	
    // Get the 2D canvas contextWork.
    this.canvasMain = $('#mainCanvas')[0];
    this.contextMain = this.canvasMain.getContext("2d");
    
	this.canvasWork = $('#workCanvas')[0];
    this.contextWork = $('#workCanvas')[0].getContext("2d");

	//build toolbox - NEW
	var sToolBox = this.BuiltoolBoxBox();
	$(this.container).prepend(sToolBox);	

	me=this;
	$('.tool').bind('click', function(ev) {
		me.SelectTool(this.id);
	});
	
	$('#toolBox').css('position','absolute');
	$('#toolBox').css('z-index', '50');
	//$('#toolBox').css('float','left');
	$('#toolBox').css('padding','0px');
	$('#toolBox').css('margin','0px');
	$('#toolBox').css('border-radius','4px');
	
	$('.tool').css('margin','1px 2px');
	$('.tool').css('border-radius','3px');
	$('.tool').css('border','1px solid gray');
	$('.tool').css('cursor','pointer');

	this.SelectTool('pencil');
	
	//set canvas size and position(to image size/position) and set up resizing event handler..
	this.ReSize();
	me=this;
	$(window).bind('resize', function(ev) {
		me.ReSize();
	});
	
}
// -------------------------------------------------------------------------------  
ImageCanvas.prototype.HideToolBox = function() {
		$('#toolBox').css('visibility','hidden'); 
}
// -------------------------------------------------------------------------------  
ImageCanvas.prototype.ShowToolBox = function() {
	$('#toolBox').css('visibility','visible'); 
}
// -------------------------------------------------------------------------------  
ImageCanvas.prototype.ReSize = function() {
	var p=$(this.imgID).position();
	$('.drawingCanvas').attr('height', $(this.imgID).height());
	$('.drawingCanvas').attr('width', $(this.imgID).width()+20);
	$('.drawingCanvas').css('top', p.top);
	$('.drawingCanvas').css('left', p.left-10);
	//alert('resize!');
}

//==================================================================================
// Toolbox stuff
ImageCanvas.prototype.BuiltoolBoxBox = function() {
	var toolData = new Array( /* event handlers are specified in SelectTool */
		"pencil", 		"./PresentationResources/pencil.png", 
		"line", 		"./PresentationResources/line.png",
		"rect", 		"./PresentationResources/rect.png",
		"oval", 		"./PresentationResources/oval.png",
		"highlight", 	"./PresentationResources/highlight.png",
		"eraser", 		"./PresentationResources/eraser.png",
		"clear",		"./PresentationResources/clear.png"
		);
	
	var sToolBoxHTML = "<div id='toolBox'>";
	for(x=0;x<toolData.length;x+=2) {
		sToolHTML = "<img id='" + toolData[x] + "' class='tool' src='" + toolData[x+1] + "'>";
		sToolBoxHTML+=sToolHTML;
	}

	sToolHTML += "</div>";
	return sToolBoxHTML;
}

// ------------------------------------------------------------------------------- 
ImageCanvas.prototype.SelectTool = function(tool) {

	//if tool's invalid, silently fail TODO
	if (false)
		return;
		
	//clear tool's a special case....
	if (tool == 'clear') {
		if (confirm("Clear drawing?"))
			this.contextMain.clearRect(0, 0, this.canvasWork.width, this.canvasWork.height);
		return;
	}		
	
	//unbind existing mouse handlers
	$('#workCanvas').unbind('mousedown');
	$('#workCanvas').unbind('mousemove');
	$('#workCanvas').unbind('mouseup');
		
	//denote all other tools are NOT selected
	$(this.selectetoolBoxID).css('border','1px solid gray');
	$(this.selectetoolBoxID).css('background-color','');
	
	//denote tool is selected
	this.selectetoolBoxID = '#' + tool;
	$('#'+tool).css('border','2px solid black');
	$('#'+tool).css('background-color','LightGray');
	
	//set default line width and style (highlighter may change)
	this.contextWork.lineWidth = 2;
	this.contextWork.strokeStyle = 'rgba(0,0,0,1)';
			
	//bind tool event handlers (tool name comes from toolData array originally)
	me=this;
	if (tool == 'pencil') {
		$('#workCanvas').bind('mousedown', function(ev) { me.pencilMouseDown(ev); });
		$('#workCanvas').bind('mousemove', function(ev) { me.pencilMouseMove(ev); });
		$('#workCanvas').bind('mouseup', function(ev) { me.pencilMouseUp(ev); });
	} else if (tool == 'highlight') {
		$('#workCanvas').bind('mousedown', function(ev) { me.highlightMouseDown(ev); });
		$('#workCanvas').bind('mousemove', function(ev) { me.pencilMouseMove(ev); });
		$('#workCanvas').bind('mouseup', function(ev) { me.pencilMouseUp(ev); });
	
	} else if (tool == 'line') {
		$('#workCanvas').bind('mousedown', function(ev) { me.shapeMouseDown(ev); });
		$('#workCanvas').bind('mousemove', function(ev) { me.lineMouseMove(ev); });
		$('#workCanvas').bind('mouseup', function(ev) { me.shapeMouseUp(ev); });
	} else if (tool == 'rect') {
		$('#workCanvas').bind('mousedown', function(ev) { me.shapeMouseDown(ev); });
		$('#workCanvas').bind('mousemove', function(ev) { me.rectMouseMove(ev); });
		$('#workCanvas').bind('mouseup', function(ev) { me.shapeMouseUp(ev); });
	} else if (tool == 'oval') {
		$('#workCanvas').bind('mousedown', function(ev) { me.shapeMouseDown(ev); });
		$('#workCanvas').bind('mousemove', function(ev) { me.ovalMouseMove(ev); });
		$('#workCanvas').bind('mouseup', function(ev) { me.shapeMouseUp(ev); });

	} else if (tool == 'eraser') {
		$('#workCanvas').bind('mousedown', function(ev) { me.eraserMouseDown(ev); });
		$('#workCanvas').bind('mousemove', function(ev) { me.eraserMouseMove(ev); });
		$('#workCanvas').bind('mouseup', function(ev) { me.eraserMouseUp(ev); });
	} 

	return;
}
 
// ===============================================================================  
// Drawing event helper functions
ImageCanvas.prototype.getMouseCoordinates = function(ev) {
	if (ev.layerX || ev.layerX == 0) { // Firefox
		ev._x = ev.layerX;
		ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
		ev._x = ev.offsetX;
		ev._y = ev.offsetY;
	}
}

// -------------------------------------------------------------------------------
ImageCanvas.prototype.canvasUpdate = function() {
	this.contextMain.drawImage(this.canvasWork, 0, 0);
	this.contextWork.clearRect(0, 0, this.canvasWork.width, this.canvasWork.height); //this.canvas.width, this.canvas.height);
}

// =============================================================================
// pencil/highligher event handlers
ImageCanvas.prototype.highlightMouseDown = function(ev) {
		this.contextWork.lineWidth = 30;
		this.contextWork.strokeStyle = 'rgba(255,255,0,0.02)';
		this.pencilMouseDown(ev);
}

ImageCanvas.prototype.pencilMouseDown = function(ev) {
	this.contextWork.beginPath();
	this.getMouseCoordinates(ev);
    this.contextWork.moveTo(ev._x, ev._y);
	this.drawing=true;
} 

ImageCanvas.prototype.pencilMouseMove = function(ev) {
	if (this.drawing) {
		this.getMouseCoordinates(ev);
		this.contextWork.lineTo(ev._x, ev._y);
		this.contextWork.stroke();
	}
}

ImageCanvas.prototype.pencilMouseUp = function(ev) {
	this.canvasUpdate();
	this.drawing=false;
}

// =============================================================================
// shape drawing event handlers
ImageCanvas.prototype.shapeMouseDown = function(ev) {
	this.getMouseCoordinates(ev);
	this.startX = ev._x;
	this.startY = ev._y;
	this.drawing=true;
} 

// ------------------------------------------------------------------------------- 
ImageCanvas.prototype.lineMouseMove = function(ev) {
	if (this.drawing) {
		this.contextWork.clearRect(0, 0, this.canvasWork.width, this.canvasWork.height);

		this.getMouseCoordinates(ev);
		this.contextWork.beginPath();
		this.contextWork.moveTo(this.startX, this.startY);
		this.contextWork.lineTo(ev._x,   ev._y);
		this.contextWork.stroke();
		this.contextWork.closePath();
	}
}


// ------------------------------------------------------------------------------- 
ImageCanvas.prototype.rectMouseMove = function (ev) {
	if (this.drawing) {
		this.getMouseCoordinates(ev);

		var x = Math.min(ev._x,  this.startX);
		var	y = Math.min(ev._y,  this.startY);
		var w = Math.abs(ev._x - this.startX);
		var h = Math.abs(ev._y - this.startY);

		this.contextWork.clearRect(0, 0, this.canvasWork.width, this.canvasWork.height);
		this.contextWork.strokeRect(x, y, w, h);
	}
};

// ------------------------------------------------------------------------------- 
ImageCanvas.prototype.ovalMouseMove = function (ev) {
	if (this.drawing) {
		this.getMouseCoordinates(ev);

		var x = Math.min(ev._x,  this.startX);
		var	y = Math.min(ev._y,  this.startY);
		var w = Math.abs(ev._x - this.startX);
		var h = Math.abs(ev._y - this.startY);

		this.contextWork.clearRect(0, 0, this.canvasWork.width, this.canvasWork.height);
		
		//draw the ellipse
		var kappa = .5522848;
			ox = (w / 2) * kappa, // control point offset horizontal
			oy = (h / 2) * kappa, // control point offset vertical
			xe = x + w,           // x-end
			ye = y + h,           // y-end
			xm = x + w / 2,       // x-middle
			ym = y + h / 2;       // y-middle
			
		var ctx=this.contextWork;
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.closePath();
		ctx.stroke();
	}
};

// ------------------------------------------------------------------------------- 
ImageCanvas.prototype.shapeMouseUp = function(ev) {
	this.canvasUpdate();
	this.drawing=false;
}

// =============================================================================
// Eraser event handlers
ImageCanvas.prototype.eraserMouseDown = function(ev) {
	this.drawing=true;
	this.eraserMouseMove(ev);
} 

ImageCanvas.prototype.eraserMouseMove = function(ev) {
	if (this.drawing) {
		this.getMouseCoordinates(ev);
		var  size=30,
			x = ev._x - size/2,
			y = ev._y - size/2,
			w = size,
			h = size;

		this.contextWork.clearRect(0, 0, this.canvasWork.width, this.canvasWork.height);

		this.contextWork.strokeRect(x, y, w, h);	//show where eraser is
		this.contextMain.clearRect(x, y, w, h); //erase original cavnvas
	}
}

ImageCanvas.prototype.eraserMouseUp = function(ev) {
	this.contextWork.clearRect(0, 0, this.canvasWork.width, this.canvasWork.height); //erase eraser outline
	this.canvasUpdate();
	this.drawing=false;
}
// ------------------------------------------------------------------------------- 