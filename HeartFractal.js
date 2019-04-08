fractals[4] = "Burning Heart";
multiSupport[6] = false;

function renderHeart(can, ctx){
	getCanvas(updateCanvas(can));
	console.log("Rendering Burning Heart");
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
			
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_Heart(x / zoom - xPan, y / zoom - yPan);
			
			//color fractal
			ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}

function BelongsToSet_Heart(x, y){
	//components of complex number
	var cx = offsetX;
	var cy = offsetY;
	
	var z = math.complex(0, 0);
	
	for (var i = 0; i < iterationCount; i++){
		//failed attempt at using the mathjs library to replace the code
		//f(z) = z² + c
		//z = math.pow(z, 2) + math.complex(cx, cy);
		//z = z.split(/[+-]/);
		//z = z.map(z => z.trim());
		//var zA = z[0];
		//var zB = z[1];
		//zB = zB.slice(0, -1);
		//if (zB == ""){zB = 1;}
		//z = math.complex(zA, zB);
		
		//cx = z.re;
		//cy = z.im;
		
		//calculates real and imaginary component of complex number
		//if (multibrotSupport){
			//var zx = Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.cos(multibrot_exp * Math.atan2(cy, cx)) + x;
			//var zy = -Math.pow((Math.pow(cx, 2) + Math.pow(cy, 2)), (multibrot_exp / 2)) * Math.sin(multibrot_exp * Math.atan2(cy, cx)) + y;
		//}else{
			var zx = Math.pow(cx, 2) + Math.pow(cy, 3) + x;
			var zy = 2 * cx * cy + y;
		//}
		
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