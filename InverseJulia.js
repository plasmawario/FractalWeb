fractals[8] = "Inverse Julia";
multiSupport[10] = false;

function renderInverseJulia(can, ctx){
	//point for the julia set to render
	var cx = parseFloat($("#Julia_coordX").val());
	var cy = parseFloat($("#Julia_coordY").val());
	//updateCanvas(getCanvas(ctx));
	getCanvas(updateCanvas(can));
	console.log("Rendering Inverse Julia set with point: (" + cx + ", " + cy + ")");
	
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
						
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_InverseJulia(cx, cy, x / zoom - xPan, y / zoom - yPan);
			
			//color fractal
			ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}
function BelongsToSet_InverseJulia(x, y, cx, cy){

	total = 0;	//for histogram coloring
	
	for (var i = 0; i < iterationCount; i++){
	
		//the code below supports multibrot rendering and negative multibrot exponents, at a cost of increased rendering time
		if (multibrotSupport){
			//var zx = Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx)) + x;
			//var zy = Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.sin(multibrot_exp * Math.atan2(cy, cx)) + y;
		}else{
			//special thanks to Earthnuker#2337 for helping me out with this one!!
			var zx = (x / (Math.pow(x, 2) + Math.pow(y, 2))) + Math.pow(cx, 2) - Math.pow(cy, 2);
			var zy = -(y / (Math.pow(x, 2) + Math.pow(y, 2))) + 2 * cx * cy;
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