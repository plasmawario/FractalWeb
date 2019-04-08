/*
This was initially coded with the help of this website:
https://progur.com/2017/02/create-mandelbrot-fractal-javascript.html

<script>document.body.style.backgroundImage = "url('https://i.gyazo.com/95aaf3207f28b173c4cec4759b83707f.png')"; document.body.style.backgroundSize = "300px 300px"</script>
*/

var bounds = 4;
//---default control variables---//
var iterationCount = 250;
var zoom_A = 200;
var xPan_A = 200;
var yPan_A = 150;
var offsetX = 0;
var offsetY = 0;
var multibrot_exp = 2;
var multibrotSupport = false;

var zoom_B = 200;
var xPan_B = 150;
var yPan_B = 150;

var zoom_C = 125;
var xPan_C = 200;
var yPan_C = 75;

var zoom;
var xPan;
var yPan;

var resolutionMultiplier = 1;
var coloringMethod = document.getElementById("fractal_coloringMethod").value;
var coloringType = document.getElementById("fractal_colorPalette").value;
var canvasA_Fractal = "Mandelbrot";
var canvasB_Fractal = "Julia";
var canvasC_Fractal = "Mandelbrot";

var canvasA_Status = $("#canvasA_status");
var canvasB_Status = $("#canvasB_status");
var canvasC_Status = $("#canvasC_status");
//--------------------------------//

var mouseHold = false;
var mouseX, mouseY;
var periodicityChecking = true;
var zMult = 1;
var infoBox = $("#infobox");

//-for histogram-//
var histogram = [iterationCount];
var total = 0;
//---------------//

var colorPalette = [];

//hides graph information when page loads
$("#graphcontainer").hide();

var canvasA = document.getElementById("canvas_fractalA");
canvasA.width = 600 * resolutionMultiplier;
canvasA.height = 600 * resolutionMultiplier;
var contextCanvasA = canvasA.getContext("2d");

var canvasB = document.getElementById("canvas_fractalB");
canvasB.width = 600 * resolutionMultiplier;
canvasB.height = 600 * resolutionMultiplier;
var contextCanvasB = canvasB.getContext("2d");

var canvasC = document.getElementById("canvas_fractalC");
canvasC.width = 600 * resolutionMultiplier;
canvasC.height = 300 * resolutionMultiplier;
var contextCanvasC = canvasC.getContext("2d");

var canvasDiagram = document.getElementById("BifurcationDiagram");
canvasDiagram.width = 600 * resolutionMultiplier;
canvasDiagram.height = 300 * resolutionMultiplier;
var contextCanvasDiagram = canvasDiagram.getContext("2d");

var canvasCobweb = document.getElementById("CobwebPlot");
canvasCobweb.width = 600 * resolutionMultiplier;
canvasCobweb.height = 600 * resolutionMultiplier;
var contextCanvasCobweb = canvasCobweb.getContext("2d");

createAddonFractals();

//initial render of fractals
A_ButtonRender();
B_ButtonRender();
C_ButtonRender();
renderGrid();
renderFractalGraph(false);

function renderMandelbrot(can, ctx){
	//updateCanvas(getCanvas(ctx));
	getCanvas(updateCanvas(can));
	console.log("Rendering Mandelbrot Set");
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
			
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_Mandelbrot(x / zoom - xPan, y / zoom - yPan);
			
			//color fractal
			ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}
function renderJulia(can, ctx){
	//point for the julia set to render
	var cx = parseFloat($("#Julia_coordX").val());
	var cy = parseFloat($("#Julia_coordY").val());
	//updateCanvas(getCanvas(ctx));
	getCanvas(updateCanvas(can));
	console.log("Rendering Julia set with point: (" + cx + ", " + cy + ")");
	
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
						
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_Julia(cx, cy, x / zoom - xPan, y / zoom - yPan);
			
			//color fractal
			ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}

//colors the fractal based on if a point is in the set or not
function ColorFractalAfter(isInSet, ctx, x, y){
	if (isInSet == 0){
		ctx.fillStyle = "#000000";
		ctx.fillRect(x, y, 1, 1);
	}else{
		if (coloringMethod == "Escape Time" || coloringMethod == "Normalized Iteration Count"){
			if (coloringType == "Classic"){
				ctx.fillStyle = "hsl(" + (isInSet * 2) + ", 100%, " + isInSet + "%)";
				ctx.fillRect(x, y, 1, 1);
			}else if (coloringType == "paletteRainbow"){
				ctx.fillStyle = "hsl(" + (isInSet % 180) + ", 100%, " + 50 + "%)";
				ctx.fillRect(x, y, 1, 1);
			}else if (coloringType == "PaletteTEST"){
				ctx.fillStyle = "hsl(" + colorPalette[0] + ", 100%, " + 50 + "%)";
				ctx.fillRect(x, y, 1, 1);
			}
		}else if (coloringMethod == "Histogram"){
			ctx.fillStyle = "hsl(" + colorPalette[isInSet % colorPalette.length] + ", 100%, " + colorPalette[isInSet % colorPalette.length] + "%)";
			ctx.fillRect(x, y, 1, 1);
		}
	}
}

//gets the canvas to set correct zoom and panning
function getCanvas(ctx){
	//plug in canvas to set correct zoom and panning
	if (ctx == contextCanvasA){
		zoom = zoom_A;
		xPan = xPan_A;
		yPan = yPan_A;
	}else if (ctx == contextCanvasB){
		zoom = zoom_B;
		xPan = xPan_B;
		yPan = yPan_B;
	}else if (ctx == contextCanvasC){
		zoom = zoom_C;
		xPan = xPan_C;
		yPan = yPan_C;
	}
}

//-----Calculations for fractals-----//
//Mandelbrot set
function BelongsToSet_Mandelbrot(x, y){
	//components of complex number with offset
	if (multibrot_exp < 0){
		var cx = x;
		var cy = y;
	}else{
		var cx = offsetX;
		var cy = offsetY;
	}
	
	//Cardioid/bulb checking optimization: Before passing a point into the algorithm, check if the given point is in the cardioid or period-2 bulb
	/*var p = Math.sqrt(Math.pow((x - 0.25), 2) + Math.pow(y, 2));
	if (x <= (p - (2 * (p * p)) + 0.25) || 0.0625 >= Math.pow((x + 1), 2) + Math.pow(y, 2)){
		return 0;
	}*/ //Only works with the original unedited mandelbrot, this may be cut out
	
	total = 0;	//for histogram coloring
	for (var i = 0; i < iterationCount; i++){
		//what if you put a complex number as the exponent? :thinking:
		
		//the code below supports multibrot rendering and negative multibrot exponents, at a cost of increased rendering time
		if (multibrotSupport){
			var zx = Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx)) + x;
			var zy = Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.sin(multibrot_exp * Math.atan2(cy, cx)) + y;
		}else{
			var zx = Math.pow(cx, 2) - Math.pow(cy, 2) + x;
			var zy = 2 * cx * cy + y;
		}
		
		//periodicity checking optimization: if a point in the set has been reached before, quick break
		if (periodicityChecking){
			if (cx == zx && cy == zy){
				return 0;
			}
		}
		cx = zx * zMult;
		cy = zy * zMult;
		
		total += histogram[i];
		
		//if the point exceeds the bounds, color the point based on how quickly it escapes
		if (Math.pow(cx, 2) + Math.pow(cy, 2) >= bounds){
			return ColorFractalBefore(cx, cy, i);
		}
	}
	//color point black if point does not escape
	return 0;
}

//Julia set
function BelongsToSet_Julia(x, y, cx, cy){
	var d = Math.pow((Math.pow(cx, 2) - Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx));
	for (var i = 0; i < iterationCount; i++){

		//calculates real and imaginary component of complex number
		//the code below supports multibrot rendering
		if (multibrot_exp < 0){
			if (d == 0) return 0;
			//var zx = (Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx))) / d + x;
			//var zy = Math.pow(-(Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * -Math.sin(multibrot_exp * Math.atan2(cy, cx)) / d + y;
		}
		if (multibrotSupport){
			var zx = Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx)) + x;
			var zy = Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.sin(multibrot_exp * Math.atan2(cy, cx)) + y;
		}else{
			var zx = Math.pow(cx, 2) - Math.pow(cy, 2) + x;
			var zy = 2 * cx * cy + y;
		}
		//periodicity checking: if a point in the set has been reached before, quick break
		if (periodicityChecking){
			if (cx == zx && cy == zy){
				return 0;
			}
		}
		
		cx = zx * zMult;
		cy = zy * zMult;
		
		//if the point exceeds the bounds, color the point based on how quickly it escapes
		if (Math.pow(cx, 2) + Math.pow(cy, 2) >= bounds){
			var result;// = (i / iterationCount * 100);
			return ColorFractalBefore(cx, cy, i);
		}
	}
	//color point black if point does not escape
	return 0;
}

//colors fractal with algorithm
function ColorFractalBefore(cx, cy, i){
	if (coloringMethod == "Escape Time"){
		return i;
	}else if (coloringMethod == "Histogram"){
		var hue = 0.0;
		for (j = 0; j <= i; j++){
			hue += histogram[j] / total;
		}
		return hue;
	}else if (coloringMethod == "Normalized Iteration Count"){
		return i - Math.log(Math.log(Math.sqrt((cx*cx)+(cy*cy)))) / Math.log(2);
	}
}

//-----draw grid-----//
function renderGrid(){
	//draw origin lines
	contextCanvasCobweb.beginPath();
	contextCanvasCobweb.lineWidth = 2;
	contextCanvasCobweb.strokeStyle = "#000000";
	contextCanvasCobweb.moveTo(0, canvasCobweb.height / 2);
	contextCanvasCobweb.lineTo(canvasCobweb.width, canvasCobweb.height / 2);
	contextCanvasCobweb.stroke();
	
	contextCanvasCobweb.beginPath();
	contextCanvasCobweb.lineWidth = 2;
	contextCanvasCobweb.strokeStyle = "#000000";
	contextCanvasCobweb.moveTo(canvasCobweb.width / 2, 0);
	contextCanvasCobweb.lineTo(canvasCobweb.width / 2, canvasCobweb.height);
	contextCanvasCobweb.stroke();
	
	
	//stuff for drawing other lines n stuff
	var values = [6, 3, 1.5, 1.2];
	
	for (var i = 0; i < values.length; i ++){
		contextCanvasCobweb.beginPath();
		contextCanvasCobweb.lineWidth = 1;
		contextCanvasCobweb.strokeStyle = "#000000";
		contextCanvasCobweb.moveTo(0, canvasCobweb.height / values[i]);
		contextCanvasCobweb.lineTo(canvasCobweb.width, canvasCobweb.height / values[i]);
		contextCanvasCobweb.stroke();
		
		contextCanvasCobweb.beginPath();
		contextCanvasCobweb.lineWidth = 1;
		contextCanvasCobweb.strokeStyle = "#000000";
		contextCanvasCobweb.moveTo(canvasCobweb.width / values[i], 0);
		contextCanvasCobweb.lineTo(canvasCobweb.width / values[i], canvasCobweb.height);
		contextCanvasCobweb.stroke();
	}
	
	contextCanvasCobweb.beginPath();
	contextCanvasCobweb.lineWidth = 1;
	contextCanvasCobweb.strokeStyle = "#000000";
	contextCanvasCobweb.moveTo(0, canvasCobweb.height);
	contextCanvasCobweb.lineTo(canvasCobweb.width, 0);
	contextCanvasCobweb.stroke();
	
}
function XC(x){
	return (x + 3 / (3 + 3) * canvasCobweb.width);
}
function YC(y){
	return canvasCobweb.height - (y + 3 / (3 + 3) * canvasCobweb.width);
	//if y = 0 then this will return 300. It needs to return -400 as the first value. The bigger y is, the lower the return value
	//if y = 700 then the result will be -400 as needed
	//y is currently being put in as 9. Somehow this needs to become 700
}
function renderFractalGraph(animate){
	
	/*var zx = Math.pow(cx, 2) - Math.pow(cy, 2) + x;
	var zy = 2 * cx * cy + y;*/
	//http://matt.might.net/articles/rendering-mathematical-functions-in-javascript-with-canvas-html/
	
	var first = true;
	var h = canvasCobweb.width / 6;
	
	if (animate){
		var cobwebanimate = setInterval(function(){
			//clears canvas and redraws
			contextCanvasCobweb.clearRect(0, 0, canvasCobweb.width, canvasCobweb.height);
			renderGrid();
			contextCanvasCobweb.beginPath();
			for (var x = (canvasCobweb.width * -1); x <= canvasCobweb.width; x ++){
				//function for parabola
				var y = x * x + 2;
				if (first){
					contextCanvasCobweb.moveTo(XC(x * 10), YC(y));
					first = false;
				}else{
					contextCanvasCobweb.lineTo(XC(x * 10), YC(y + h));
				}
			}
			contextCanvasCobweb.stroke();
			
			//init drawing cobweb plot line from origin to parabola
			contextCanvasCobweb.beginPath();
			contextCanvasCobweb.moveTo(canvasCobweb.width / 2, canvasCobweb.height / 2);
			contextCanvasCobweb.lineWidth = 1.5;
			contextCanvasCobweb.strokeStyle = "#00ff00";
			contextCanvasCobweb.lineTo(canvasCobweb.width / 2, YC(h));
			contextCanvasCobweb.stroke();
			
			//line from parabola to x
			contextCanvasCobweb.beginPath();
			contextCanvasCobweb.moveTo(canvasCobweb.width / 2, YC(h));
			contextCanvasCobweb.lineTo(XC(h), YC(h));
			contextCanvasCobweb.stroke();
			var lineLastX = XC(h);
			var lineLastY = YC(h);
			var y = 0;
			//continuing cobweb plot line until max iteraion value
			y = YC(h) * YC(h) / YC(-h);
			for (var j = 0; j < 1; j++){
				//line from x to parabola
				contextCanvasCobweb.beginPath();
				contextCanvasCobweb.moveTo(lineLastX, lineLastY);
				contextCanvasCobweb.lineTo(lineLastX, y);
				//630000 / 900 = 700
				contextCanvasCobweb.stroke();
				//lineLastX = XC(h);
				//lineLastY = YC(y);
				
				//line from parabola to x
				/*contextCanvasCobweb.beginPath();
				contextCanvasCobweb.moveTo(lineLastX), YC(y));
				contextCanvasCobweb.lineTo(canvasCobweb.width / 2, YC(h));
				contextCanvasCobweb.stroke();
				lineLastX = canvasCobweb.width / 2;
				lineLastY = YC(y);*/
			}
			
			h -= 0.25;
			//console.log(h)
			if (h == -225){
				clearInterval(cobwebanimate);
			}
		}, 50);
	}else{
		contextCanvasCobweb.beginPath();
		for (var x = (canvasCobweb.width * -1); x <= canvasCobweb.width; x ++){
			//Function to graph
			var y = x * x;
			if (first){
				contextCanvasCobweb.moveTo(XC(x * 10), YC(y));
				first = false;
			}else{
				contextCanvasCobweb.lineTo(XC(x * 10), YC(y));
			}
		}
		contextCanvasCobweb.stroke();
		
	}
	
	
}
$("#Canimate").click(function(){
	console.log("Animating infographs");
	setInterval(renderFractalGraph(true), 50);
});
//-------------------//

//-----Addon fractals-----//
function createAddonFractals(){
	for (var i = 0; i < fractals.length; i++){
		if (fractals[i] != null){
			var newOption = document.createElement("option");
			newOption.setAttribute("value", fractals[i]);
			newOption.text = fractals[i];
			document.getElementById("dropdownA").appendChild(newOption);
		}
	}
	for (var i = 0; i < fractals.length; i++){
		if (fractals[i] != null){
			var newOption = document.createElement("option");
			newOption.setAttribute("value", fractals[i]);
			newOption.text = fractals[i];
			document.getElementById("dropdownB").appendChild(newOption);
		}
	}
}
//------------------------//

//update canvas properties
function updateCanvas(canv){
	if (canv == canvasA){
		canvasA.width = 600 * resolutionMultiplier;
		canvasA.height = 600 * resolutionMultiplier;
		zoom_A = $("#zoom_A").val() * resolutionMultiplier;
		xPan_A = ($("#X_Pan_A").val() / (zoom_A / 2)) * resolutionMultiplier;
		yPan_A = ($("#Y_Pan_A").val() / (zoom_A / 2)) * resolutionMultiplier;
		return contextCanvasA;
	}else if (canv == canvasB){
		canvasB.width = 600 * resolutionMultiplier;
		canvasB.height = 600 * resolutionMultiplier;
		zoom_B = $("#zoom_B").val() * resolutionMultiplier;
		xPan_B = ($("#X_Pan_B").val() / (zoom_B / 2)) * resolutionMultiplier;
		yPan_B = ($("#Y_Pan_B").val() / (zoom_B / 2)) * resolutionMultiplier;
		return contextCanvasB;
	}else if (canv == canvasC){
		canvasC.width = 600 * resolutionMultiplier;
		canvasC.height = 300 * resolutionMultiplier;
		zoom_C = $("#zoom_C").val() * resolutionMultiplier;
		xPan_C = ($("#X_Pan_C").val() / (zoom_C / 2)) * resolutionMultiplier;
		yPan_C = ($("#Y_Pan_C").val() / (zoom_C / 2)) * resolutionMultiplier;
		return contextCanvasC;
	}
}

//-----Control functions-----//
$(".SwitchViews").click(function(){
	$("#maincontainer").toggle();
	$("#graphcontainer").toggle();
});

$("#fractal_coloringMethod").click(function(){
		coloringMethod = document.getElementById("fractal_coloringMethod").value;
});
//restoring default values
$("#ADefaults").click(function(){
	ResetADefaults();
});
$("#BDefaults").click(function(){
	ResetBDefaults();
});
$("#ctlDefaults").click(function(){
	ResetCtlDefaults();
});
$("#AllDefaults").click(function(){
	ResetADefaults();
	ResetBDefaults();
	ResetCtlDefaults();
});
function ResetADefaults(){
	$("#X_Pan_A").val(200);
	$("#Y_Pan_A").val(150);
	$("#zoom_A").val(200);
}
function ResetBDefaults(){
	$("#X_Pan_B").val(150);
	$("#Y_Pan_B").val(150);
	$("#zoom_B").val(200);
}
function ResetCDefaults(){
	$("#X_Pan_C").val(150);
	$("#Y_Pan_C").val(125);
	$("#zoom_C").val(150);
}
function ResetCtlDefaults(){
	$("#resMult").val(1);
	resolutionMultiplier = 1;
	$("#iterations").val(250);
	iterationCount = 250;
	$("#X_Offset").val(0);
	offsetX = 0;
	$("#Y_Offset").val(0);
	offsetY = 0;
	$("#mandelbrot_exponent").val(2);
	multibrot_exp = 2;
	document.getElementById("multibrotEnable").checked = false;
	multibrotEnable = false;
	$("#Julia_coordX").val(0.35);
	$("#Julia_coordY").val(0);
	coloringMethod = document.getElementById("fractal_coloringMethod").value = "Escape Time";
	coloringType = document.getElementById("fractal_colorPalette").value = "Classic";
	$("#fractalbounds").val(4);
	bounds = 4;
	document.getElementById("periodicityChecking").checked = true;
	periodicityChecking = true;
	$("#zMult").val(1);
	zMult = 1;
}
//re-rendering the fractals via button
$("#Arenderbtn").click(function(){
		A_ButtonRender();
});
$("#Brenderbtn").click(function(){
		B_ButtonRender();
});
$("#Crenderbtn").click(function(){
		C_ButtonRender();
});
$("#allrenderbtn").click(function(){
		A_ButtonRender();
		B_ButtonRender();
});
function A_ButtonRender(){
	try{
		//update canvas status
		setTimeout(function(){
			canvasA_Status.html("Rendering...");
			canvasA_Status.css("background-image", "url(loadingbar.gif)");
		}, 0);
		//begin re-rendering
		setTimeout(function(){
			var dropdown = $("#dropdownA").val();
			getFractalDropdown(canvasA, contextCanvasA, dropdown);
		}, 30);
		//update canvas status
		setTimeout(function(){
			canvasA_Status.html("Standby");
			canvasA_Status.css("background-image", "url()");
		}, 60);
	}catch(ex){
		console.log("There was an error while rendering the fractal! Error type: " + ex + ": " + ex.message);
		canvasA_Status.html("Error (check console)");
		canvasA_Status.css("background-color", "rgb(255, 40, 40)");
		canvasA_Status.css("background-image", "url()");
	}
}
function B_ButtonRender(){
	try{
		//update canvas status
		setTimeout(function(){
			canvasB_Status.html("Rendering...");
			canvasB_Status.css("background-color", "rgb(255, 40, 40)");
			canvasB_Status.css("background-image", "url(loadingbar.gif)");
		}, 0);
		//begin re-rendering
		setTimeout(function(){
			var dropdown = $("#dropdownB").val();
			getFractalDropdown(canvasB, contextCanvasB, dropdown);
		}, 30);
		//update canvas status
		setTimeout(function(){
			canvasB_Status.html("Standby");
			canvasB_Status.css("background-color", "rgb(40, 255, 40)");
			canvasB_Status.css("background-image", "url()");
		}, 60);
	}catch(ex){
		console.log("There was an error while rendering the fractal! Error type: " + ex + ": " + ex.message);
		canvasB_Status.html("Error");
		canvasB_Status.css("background-color", "rgb(255, 40, 40)");
		canvasB_Status.css("background-image", "url()");
	}
}
function C_ButtonRender(){
	try{
		//update canvas status
		setTimeout(function(){
			canvasC_Status.html("Rendering...");
			canvasC_Status.css("background-color", "rgb(255, 40, 40)");
			canvasC_Status.css("background-image", "url(loadingbar.gif)");
		}, 0);
		//begin re-rendering
		setTimeout(function(){
			var dropdown = $("#dropdownC").val();
			getFractalDropdown(canvasC, contextCanvasC, dropdown);
		}, 30);
		//update canvas status
		setTimeout(function(){
			canvasC_Status.html("Standby");
			canvasC_Status.css("background-color", "rgb(40, 255, 40)");
			canvasC_Status.css("background-image", "url()");
		}, 60);
	}catch(ex){
		console.log("There was an error while rendering the fractal! Error type: " + ex + ": " + ex.message);
		canvasC_Status.html("Error");
		canvasC_Status.css("background-color", "rgb(255, 40, 40)");
		canvasC_Status.css("background-image", "url()");
	}
}

//multibrot exponent
$("#mandelbrot_exponent").change(function(){
	multibrot_exp = $("#mandelbrot_exponent").val();
});

//search the dropdown boxes for the selected fractal and render fractal based on the canvas the dropdown fractal is selected in
function getFractalDropdown(can, ctx, drop){
	if (drop == "Mandelbrot"){
		renderMandelbrot(can, ctx);
	}else if(drop == "Julia"){
		renderJulia(can, ctx);
	}else if(drop == "Tricorn"){
		renderTricorn(can, ctx);
	}else if(drop == "Tricorn Julia"){
		renderTricornJulia(can, ctx);
	}else if (drop == "Nova"){
		renderNova(can, ctx);
	}else if (drop == "Square"){
		renderSquare(can, ctx);
	}else if (drop == "Burning Heart"){
		renderHeart(can, ctx);
	}else if (drop == "Burning Ship"){
		renderBurningShip(can, ctx);
	}else if (drop == "Burning Ship Julia"){
		renderBurningShipJulia(can, ctx);
	}else if (drop == "Inverse Mandelbrot"){
		renderInverseMandelbrot(can, ctx);
	}else if (drop == "Inverse Julia"){
		renderInverseJulia(can, ctx);
	}else if (drop == "Lambda Mandelbrot"){
		renderLambdaMandelbrot(can, ctx);
	}else if (drop == "Lambda Julia"){
		renderLambdaJulia(can, ctx);
	}
}

//get offset values
$("#X_Offset").change(function(){
	offsetX = $("#X_Offset").val();
});
$("#Y_Offset").change(function(){
	offsetY = $("#Y_Offset").val();
});

//updates resolution multiplier
$("#resMult").change(function(){
	resolutionMultiplier = $("#resMult").val();
});

//updates iteration count
$("#iterations").change(function(){
	iterationCount = $("#iterations").val();
});

//get coords from mandelbrot set if mouse is clicked
$("#canvas_fractalA").mousedown(function(event){
	mouseHold = true;
});
$("#canvas_fractalA").mouseup(function(event){
	mouseHold = false;
});
$("#canvas_fractalB").mousedown(function(event){
	mouseHold = true;
});
$("#canvas_fractalB").mouseup(function(event){
	mouseHold = false;
});
$("#canvas_fractalA").mousemove(function(event){
	if (mouseHold){
		if ($("#dropdownA").val() == "Mandelbrot" || $("#dropdownA").val() == "Tricorn" || $("#dropdownA").val() == "Burning Ship"){
			mandelbrotMouseCoords("A", event);
		}
	}
});
$("#canvas_fractalB").mousemove(function(event){
	if (mouseHold){
		if ($("#dropdownB").val() == "Mandelbrot" || $("#dropdownB").val() == "Tricorn" || $("#dropdownB").val() == "Burning Ship"){
			mandelbrotMouseCoords("B", event);
		}
	}
});
function mandelbrotMouseCoords(fractal, e){
	var canvas_fractal = document.getElementById("canvas_fractal" + fractal);
	if (fractal == "A"){
		var fractalTable = document.getElementById("fractalTable");
		var mainContainer = document.getElementById("maincontainer");
		var canv_status = document.getElementById("canvas" + fractal + "_status");
		
		//gets offset values from other nested elements
		//var offsetX = canvas_fractal.offsetLeft + fractalTable.offsetLeft + mainContainer.offsetLeft;
		//var offsetY = canvas_fractal.offsetTop + fractalTable.offsetTop + mainContainer.offsetTop + canv_status.offsetHeight + canv_status.offsetTop + (canvas_fractal.offsetHeight / 2);
		var offsetX = $("#controls_" + fractal).offset().left;
		var offsetY = $("#controls_" + fractal).offset().top;
		
		//gets mouse coords based on main document
		mouseX = e.pageX - offsetX;
		mouseY = e.pageY - offsetY;
		
		//gets coords of mouse based on offset from main page from the fractal canvas
		$("#Julia_coordX").val(parseFloat(((mouseX) / zoom_A - xPan_A).toFixed(4)));
		$("#Julia_coordY").val(parseFloat(((mouseY) / zoom_A - yPan_A).toFixed(4)));
	}
}

$("#canvas_fractalA").bind("mousewheel", function(e){
	mouseX = event.clientX - $("#canvas_fractalA").offset().left;
	mouseY = event.clientY - $("#canvas_fractalA").offset().top;
	
	if (e.originalEvent.wheelDelta < 0){
		var scrlDir = -2;
	}else{
		var scrlDir = 2;
	}
	$("#zoom_A").val(function(index, currentvalue){
		$("#zoom_A").val(currentvalue += scrlDir);
	});
});
//check if the fractal selected by the dropdown supports multibrot rendering. If not, disable the checkbox
$("#dropdownA").change(function(){
	$("#multibrotEnable").prop("disabled", !multiSupport[document.getElementById("dropdownA").selectedIndex]);
});
$("#dropdownB").change(function(){
	$("#multibrotEnable").prop("disabled", !multiSupport[document.getElementById("dropdownB").selectedIndex]);
});

$("#fractalbounds").change(function(){
	bounds = $("#fractalbounds").val();
});
$("#periodicityChecking").click(function(){
	periodicityChecking = document.getElementById("periodicityChecking").checked;
});

$("#zMult").change(function(){
	zMult = $("#zMult").val();
});
$("#multibrotEnable").change(function(){
	$("#mandelbrot_exponent").prop("disabled", !$("#multibrotEnable").prop("checked"));
	multibrotSupport = document.getElementById("multibrotEnable").checked;
});

//stores color palletes
function GetColorPallets(){
	var paletteTEST = 200;
	var paletteRainbow = [0, 20, 50, 100, 175, 245, 300];
	
	var allColorPalettes = [paletteTEST, paletteRainbow];
	colorPalette = allColorPalettes[document.getElementById("fractal_colorPalette").selectedIndex - 1];
	coloringType = $("#fractal_colorPalette").val();
}

$("#fractal_colorPalette").change(function(){
	GetColorPallets();
});

//-----Information Box-----//
//panel A//
$("#Arenderbtn").mouseenter(function(){
	infoBox.html("Render a fractal from dropdown A into canvas A");
});
$("#Arenderbtn").mouseleave(function(){
	clearInfo();
});
$("#ADefaults").mouseenter(function(){
	infoBox.html("Reset all fractal A properties to their default values");
});
$("#ADefaults").mouseleave(function(){
	clearInfo();
});
$("#dropdownA").mouseenter(function(){
	infoBox.html("Select which fractal you wish to render in canvas A");
});
$("#dropdownA").mouseleave(function(){
	clearInfo();
});
$("#X_Pan_A").mouseenter(function(){
	infoBox.html("Pan the fractal rendering along the X axis");
});
$("#X_Pan_A").mouseleave(function(){
	clearInfo();
});
$("#Y_Pan_A").mouseenter(function(){
	infoBox.html("Pan the fractal rendering along the Y axis");
});
$("#Y_Pan_A").mouseleave(function(){
	clearInfo();
});
$("#zoom_A").mouseenter(function(){
	infoBox.html("Zoom into the fractal on canvas A");
});
$("#zoom_A").mouseleave(function(){
	clearInfo();
});
//-------//
//panel B//
$("#Brenderbtn").mouseenter(function(){
	infoBox.html("Render a fractal from dropdown B into canvas B");
});
$("#Brenderbtn").mouseleave(function(){
	clearInfo();
});
$("#BDefaults").mouseenter(function(){
	infoBox.html("Reset all fractal B properties to their default values");
});
$("#BDefaults").mouseleave(function(){
	clearInfo();
});
$("#dropdownB").mouseenter(function(){
	infoBox.html("Select which fractal you wish to render in canvas B");
});
$("#dropdownB").mouseleave(function(){
	clearInfo();
});
$("#X_Pan_B").mouseenter(function(){
	infoBox.html("Pan the fractal rendering along the X axis");
});
$("#X_Pan_B").mouseleave(function(){
	clearInfo();
});
$("#Y_Pan_B").mouseenter(function(){
	infoBox.html("Pan the fractal rendering along the Y axis");
});
$("#Y_Pan_B").mouseleave(function(){
	clearInfo();
});
$("#zoom_B").mouseenter(function(){
	infoBox.html("Zoom into the fractal on canvas B");
});
$("#zoom_B").mouseleave(function(){
	clearInfo();
});
//-------//
//panel C//
$("#allrenderbtn").mouseenter(function(){
	infoBox.html("Render both fractals on both canvases");
});
$("#allrenderbtn").mouseleave(function(){
	clearInfo();
});
$("#ctlDefaults").mouseenter(function(){
	infoBox.html("Reset all properties in the third panel to their default values");
});
$("#ctlDefaults").mouseleave(function(){
	clearInfo();
});
$("#AllDefaults").mouseenter(function(){
	infoBox.html("Reset all properties to their default values");
});
$("#AllDefaults").mouseleave(function(){
	clearInfo();
});
$("#resMult").mouseenter(function(){
	infoBox.html("Increase the resolution of the canvases for more detailed fractals. Higher values may increase rendering time");
});
$("#resMult").mouseleave(function(){
	clearInfo();
});
$("#iterations").mouseenter(function(){
	infoBox.html("max number of iterations to calculate when rendering. Higher values may increase rendering time");
});
$("#iterations").mouseleave(function(){
	clearInfo();
});
$("#X_Offset").mouseenter(function(){
	infoBox.html("Add an offset to the mandelbrot fractals instead of initializing from 0");
});
$("#X_Offset").mouseleave(function(){
	clearInfo();
});
$("#Y_Offset").mouseenter(function(){
	infoBox.html("Add an offset to the mandelbrot fractals instead of initializing from 0");
});
$("#Y_Offset").mouseleave(function(){
	clearInfo();
});
$("#Julia_coordX").mouseenter(function(){
	infoBox.html("Takes an X coord from a mandelbrot fractal to render a julia set from");
});
$("#Julia_coordX").mouseleave(function(){
	clearInfo();
});
$("#Julia_coordY").mouseenter(function(){
	infoBox.html("Takes a Y coord from a mandelbrot fractal to render a julia set from");
});
$("#Julia_coordY").mouseleave(function(){
	clearInfo();
});
$("#mandelbrot_exponent").mouseenter(function(){
	infoBox.html("Change the value of \"n\" in \"f(z) = z^n + c\" to render multibrot fractals (negative values are slow!)");
});
$("#mandelbrot_exponent").mouseleave(function(){
	clearInfo();
});
$("#multibrotEnable").mouseenter(function(){
	infoBox.html("Enable support for rendering multibrot fractals. Enabling this will drastically increase rendering times!");
});
$("#multibrotEnable").mouseleave(function(){
	clearInfo();
});
$("#fractalbounds").mouseenter(function(){
	infoBox.html("Boundary to rendering the fractal. Higher values may increase render time");
});
$("#fractalbounds").mouseleave(function(){
	clearInfo();
});
$("#fractal_coloringMethod").mouseenter(function(){
	infoBox.html("Algorithm used for rendering the colors of the fractal");
});
$("#fractal_coloringMethod").mouseleave(function(){
	clearInfo();
});
$("#fractal_colorPalette").mouseenter(function(){
	infoBox.html("The color scheme used for rendering the fractal colors");
});
$("#fractal_colorPalette").mouseleave(function(){
	clearInfo();
});
$("#periodicityChecking").mouseenter(function(){
	infoBox.html("Checks if a point that is currently being calculated has previously fallen into the set. Speeds up computation time at a cost of memory usage");
});
$("#periodicityChecking").mouseleave(function(){
	clearInfo();
});
$("#zMult").mouseenter(function(){
	infoBox.html("Change the multiplier of \"z\" in \"f(z) = z^n + c\"");
});
$("#zMult").mouseleave(function(){
	clearInfo();
});
//-------//
function clearInfo(){
	infoBox.html("Hover over a control on the right to view additional info here");
}