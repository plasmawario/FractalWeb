fractals[6] = "Burning Ship Julia";

function renderBurningShipJulia(can, ctx){
	//point for the julia set to render
	var cx = parseFloat($("#Julia_coordX").val());
	var cy = parseFloat($("#Julia_coordY").val());
	updateCanvas(getCanvas(ctx));
	console.log("Rendering Burning Ship Julia set with point: (" + cx + ", " + cy + ")");
	
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
						
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_BurningShipJulia(cx, cy, x / zoom - xPan, y / zoom - yPan);
			
			//color fractal
			ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}
function BelongsToSet_BurningShipJulia(x, y, cx, cy){
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
			var zy = Math.abs(Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.sin(multibrot_exp * Math.atan2(cy, cx))) + y;
		}else{
			var zx = Math.pow(cx, 2) - Math.pow(cy, 2) + x;
			var zy = Math.abs(2 * cx * cy) + y;
		}
		//periodicity checking: if a point in the set has been reached before, quick break
		if (periodicityChecking){
			if (cx == zx && cy == zy){
				return 0;
			}
		}
		
		cx = Math.abs(zx) * zMult;
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