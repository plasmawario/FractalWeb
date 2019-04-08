fractals[2] = "Nova";
multiSupport[4] = false;

function renderNova(can, ctx){
	getCanvas(updateCanvas(can));
	console.log("Rendering Nova");
	for (var x = 0; x < can.width; x++){
		for (var y = 0; y < can.height; y++){
			
			//call function to iterate equasion and take zoom and panning into account
			var isInSet = BelongsToSet_Nova(x / zoom - xPan, y / zoom - yPan);
					
			var novaColor = ["hsl(0, 100, 50)",
					"hsl(125, 100, 50)",
					"hsl(240, 100, 50)"];
			
			//color fractal
			var color = novaColor[isInSet % 3];
				if (isInSet == 0){
					ctx.fillStyle = "#000000";
					ctx.fillRect(x, y, 1, 1);
				}else{
					if (coloringMethod == "Escape Time" || coloringMethod == "Normalized Iteration Count"){
						if (coloringType == "Classic"){
							ctx.fillStyle = color;
							ctx.fillRect(x, y, 1, 1);
						}else if (coloringType == "paletteRainbow"){
							ctx.fillStyle = "hsl(" + (color % 180) + ", 100%, " + 50 + "%)";
							ctx.fillRect(x, y, 1, 1);
						}else if (coloringType == "PaletteTEST"){
							ctx.fillStyle = "hsl(" + colorPalette[0] + ", 100%, " + 50 + "%)";
							ctx.fillRect(x, y, 1, 1);
						}
					}else if (coloringMethod == "Histogram"){
						ctx.fillStyle = "hsl(" + colorPalette[color % colorPalette.length] + ", 100%, " + colorPalette[isInSet % colorPalette.length] + "%)";
						ctx.fillRect(x, y, 1, 1);
					}
				}
			//ColorFractalAfter(isInSet, ctx, x, y);
		}
	}
	console.log("done");
}

function BelongsToSet_Nova(x, y){
	//components of complex number
	var cx = x;
	var cy = y;
	var z = math.complex(1, -0.5 +- Math.sqrt(3)/2);
	//https://en.wikipedia.org/wiki/Newton_fractal
	
	var zz = math.complex(cx, cy);
	
	for (var i = 0; i < iterationCount; i++){
		
		z -= math.divide(startF(z), startD(z));
		
		var roots = [math.complex(1, 0),
				math.complex(-0.5, Math.sqrt(3)/2),
				math.complex(-0.5, -Math.sqrt(3)/2)];
		
		var tolerance = 0.000001;
		
		for (var j = 0; j < roots.length; j++){
			var difference = z - roots[i];
			
			if (Math.abs(difference.x) < tolerance && Math.abs(difference.y) < tolerance){
				return ColorFractalBefore(cx, cy, j);
			}
			
		}
		//ignore all the stuff below pls k thx
		//var zx = (cx - R * (Math.pow(cx, p) - 1) / (p * Math.pow(cx, p - 1) + x)) - (cy - R * (Math.pow(cy, p) - 1) / (p * Math.pow(cy, p - 1) + y));
		//var zy = 2 * cx * cy + y;
	}
	//color point black if point does not escape
	return 0;
}
//starting function
function startF(z){
	return Math.pow(z, 3) - math.complex(1, 0);
}
//derivative of above function
function startD(z){
	return 3  * math.multiply(z, z);
}