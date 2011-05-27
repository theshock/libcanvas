/*



drawArc,drawArcTo,drawLine
*/

var Color = LibCanvas.Utils.Color, 
	TimingFunctions = LibCanvas.Inner.TimingFunctions,
	Point = LibCanvas.Point;

var ExtendedCurve = {};
ExtendedCurve.gradient = function (obj) {
	if(!obj.gradient){
		var color = new Color(obj.color || 'rgba(0,0,0,1)').toArray();
		color[3] = (color[3] || 1) * 255;
		return function(){
			return color;
		}
	}else if(typeof obj.gradient == 'function'){
		return obj.gradient;
	}else{
		var gradient = {}
		
		gradient.fn = obj.gradient.fn || 'linear'
		gradient.motion = obj.gradient.motion || 'out';
		
		if(typeof gradient.fn == 'string'){
			gradient.from = new Color(obj.gradient.from || 'rgba(0,0,0,1)');
			gradient.from.a = (gradient.from.a || 1) * 255;
			
			gradient.to = new Color(obj.gradient.to || 'rgba(0,0,0,1)');
			gradient.to.a = (gradient.from.a || 1) * 255;
			
			var diff = gradient.from.diff(gradient.to);
			
			return function(t){
				var factor = TimingFunctions.count([gradient.fn,gradient.motion], t);
				return gradient.from.shift(diff.clone().mul(factor)).toArray()
			}
		}else{
			throw new Error('Unexpected type of gradient function');
		}
			
	}
}
ExtendedCurve.width = function (obj) {
	obj.width = obj.width || 1;
	if(typeof obj.width == 'number'){
		return function(){
			return obj.width;
		}
	}else if(typeof obj.width == 'function'){
		return obj.width;
	}else if(typeof obj.width == 'object'){
		if(!obj.width.from || !obj.width.to){
			throw new Error('width.from or width.to undefined');
		}else{
			return function(t){
				obj.width.fn = obj.width.fn || 'linear';
				obj.width.motion = obj.width.motion || 'out';
				return obj.width.from + (obj.width.to - obj.width.from) * TimingFunctions.count([obj.width.fn,obj.width.motion], t);
			}
		}
	}else{
		throw new Error('Unexpected type of width');
	}
}
ExtendedCurve.quadraticCurve = function (p,t) {
	//(1-t)*(1-t)*p0 + 2*t*(1-t)*p1 + t*t*p2 
	return new Point( (1-t)*(1-t)*p[0].x + 2*t*(1-t)*p[1].x + t*t*p[2].x,
                      (1-t)*(1-t)*p[0].y + 2*t*(1-t)*p[1].y + t*t*p[2].y );
}
ExtendedCurve.bezierCurve = function (p, t) {
	return new Point( (1-t)*(1-t)*(1-t)*p[0].x + 3*t*(1-t)*(1-t)*p[1].x + 3*t*t*(1-t)*p[2].x + t*t*t*p[3].x,
                      (1-t)*(1-t)*(1-t)*p[0].y + 3*t*(1-t)*(1-t)*p[1].y + 3*t*t*(1-t)*p[2].y + t*t*t*p[3].y	);
}

LibCanvas.Context2D.implement({
	drawCurve:function (obj) {
		var gradient = ExtendedCurve.gradient(obj);   //Getting gradient function
		var widthFn = ExtendedCurve.width(obj);         //Getting width function
		
		var points = obj.points.concat([obj.to] || []).map(Point);  //Getting array of points
		
		var fn = points.length == 3 ? ExtendedCurve.quadraticCurve :
		         points.length == 4 ? ExtendedCurve.bezierCurve : undefined;  //Define function 
				 
		if(!fn){
			throw new Error('LibCanvas.Context2D.drawCurve -- unexpected number of points');
		}  //If function not defined throw error
		
		var step = obj.step || 0.0003;  //Found one step
		
		var imgd = this.original('createImageData', [this.canvas.width, this.canvas.height], true);  //Create image data
		
		var last = fn(points,0), point, color, width, angle, w, dx, dy, sin, cos, f;
		
		for(var t=step;t<=1;t+=step){
			point = fn(points, t); //Find x,y
			
			color = gradient(t);   //Find color
			width = widthFn(t);    //Find width
			
			angle = Math.atan((point.y-last.y)/(point.x-last.x));   //Found angle
			sin = Math.sin(angle);
			cos = Math.cos(angle);
			
			for(w=0;w<width+1;w++){
				dx = sin * w;
				dy = cos * w;
				
				p1 = (~~(point.y - dy))*4*imgd.width + (~~(point.x + dx))*4;
				p2 = (~~(point.y + dy))*4*imgd.width + (~~(point.x - dx))*4;
				
				f = w>width?width%1/3.5:1;
				
				imgd.data[p1  ] = imgd.data[p2  ] = color[0];
				imgd.data[p1+1] = imgd.data[p2+1] = color[1];
				imgd.data[p1+2] = imgd.data[p2+2] = color[2];
				imgd.data[p1+3] = imgd.data[p2+3] = color[3]*f;
			}
			last = point;
		}
		
		this.putImageData(imgd,0,0); //Put new image data
		
		return this;	
	}
});