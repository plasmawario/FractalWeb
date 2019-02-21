fractals[3] = "Square";

function renderSquare(can, ctx){
	var ca = getCanvas(ctx);
	updateCanvas(ca);
	console.log("Rendering Square");
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
			
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_Square(x / zoom - xPan, y / zoom - yPan);
			
			//color fractal
			ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}

function BelongsToSet_Square(x, y){
	//components of complex number
	var cx = offsetX;
	var cy = offsetY;
	
	for (var i = 0; i < iterationCount; i++){
		
		//calculates real and imaginary component of complex number
		var zx = Math.pow(cx, 2) + Math.pow(cy, 2) + x;
		var zy = 2 * cx * cy + y;
		
		//periodicity checking: if a point in the set has been reached before, quick break
		if (periodicityChecking){
			if (cx == zx && cy == zy){
				return 0;
			}
		}
		
		cx = zx;
		cy = zy;
		
		//if the point exceeds the bounds, color the point based on how quickly it escapes
		if (Math.pow(cx, 2) + Math.pow(cy, 2) >= bounds){
			var result;// = (i / iterationCount * 100);
			return ColorFractalBefore(cx, cy, i);
		}
	}
	//color point black if point does not escape
	return 0;
}