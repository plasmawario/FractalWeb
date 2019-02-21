fractals[5] = "Burning Ship";

function renderBurningShip(can, ctx){
	updateCanvas(getCanvas(ctx));
	console.log("Rendering BurningShip");
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
			
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_BurningShip(x / zoom - xPan, y / zoom - yPan);
			
			//color fractal
			ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}
function BelongsToSet_BurningShip(x, y){
	//components of complex number with offset
	if (multibrot_exp < 0){
		var cx = x;
		var cy = y;
	}else{
		var cx = offsetX;
		var cy = offsetY;
	}
	
	var d = Math.pow((Math.pow(cx, 2) - Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx));
	total = 0;	//for histogram coloring
	for (var i = 0; i < iterationCount; i++){
		//the code below supports multibrot rendering and negative multibrot exponents, at a cost of increased rendering time
		if (multibrot_exp < 0){
			if (d == 0) return 0;
			//var zx = (Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx))) / d + x;
			//var zy = Math.pow(-(Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * -Math.sin(multibrot_exp * Math.atan2(cy, cx)) / d + y;
		}
		var zx = zMult * Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx)) + x;
		var zy = zMult * Math.abs(Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.sin(multibrot_exp * Math.atan2(cy, cx))) + y;
		//periodicity checking optimization: if a point in the set has been reached before, quick break
		if (periodicityChecking){
			if (cx == zx && cy == zy){
				return 0;
			}
		}
		cx = Math.abs(zx);
		cy = zy;
		
		total += histogram[i];
		
		//if the point exceeds the bounds, color the point based on how quickly it escapes
		if (Math.pow(cx, 2) + Math.pow(cy, 2) >= bounds){
			return ColorFractalBefore(cx, cy, i);
		}
	}
	//color point black if point does not escape
	return 0;
}