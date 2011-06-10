/*
---

name: "EC"

description: ""

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Artem Smirnov <art543484@ya.ru>"
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Inner.TimingFunctions
	- Context2D

provides: EC

...
*/

new function () {
	
var Color = LibCanvas.Utils.Color, 
	TimingFunctions = LibCanvas.Inner.TimingFunctions,
	Point = LibCanvas.Point;

var EC = {};
EC.color = function (color) {
	color   = new Color(color || [0,0,0,1]);
	color.a = (color.a || 1) * 255;
	return color;
};

EC.gradient = function (obj) {
	if (!obj.gradient) {
		return Function.lambda( EC.color(obj.color).toArray() );
	} else if(typeof obj.gradient == 'function') {
		return obj.gradient;
	} else {
		var gradient = { fn: obj.gradient.fn || 'linear' };
		
		if (typeof gradient.fn != 'string') {
			throw new Error('Unexpected type of gradient function');
		}
		
		gradient.from = EC.color(obj.gradient.from);
		gradient.to   = EC.color(obj.gradient.to  );
		
		var diff = gradient.from.diff( gradient.to );
		
		return function(t) {
			var factor = TimingFunctions.count(gradient.fn, t);
			return gradient.from.shift( diff.clone().mul(factor) ).toArray()
		}
	}
}
EC.width = function (obj) {
	obj.width = obj.width || 1;
	switch (typeof obj.width) {
		case 'number'  : return Function.lambda(obj.width);
		case 'function': return obj.width;
		case 'object'  : return EC.width.range( obj.width );
		default: throw new Error('Unexpected type of width');
	};
};

EC.width.range = function (width) {
	if(!width.from || !width.to){
		throw new Error('width.from or width.to undefined');
	}
	var diff = width.to - width.from;
	return function(t){
		return width.from + diff * TimingFunctions.count(width.fn || 'linear', t);
	}
};

EC.curves = {
	linear: function (p, t) {
		return {
			x:p[0].x + (p[1].x - p[0].x) * t,
			y:p[0].y + (p[1].y - p[0].y) * t
		};
	},
	quadratic: function (p,t) {
		return {
			x:(1-t)*(1-t)*p[0].x + 2*t*(1-t)*p[1].x + t*t*p[2].x,
			y:(1-t)*(1-t)*p[0].y + 2*t*(1-t)*p[1].y + t*t*p[2].y
		};
	},
	qubic:  function (p, t) {
		return {
			x:(1-t)*(1-t)*(1-t)*p[0].x + 3*t*(1-t)*(1-t)*p[1].x + 3*t*t*(1-t)*p[2].x + t*t*t*p[3].x,
			y:(1-t)*(1-t)*(1-t)*p[0].y + 3*t*(1-t)*(1-t)*p[1].y + 3*t*t*(1-t)*p[2].y + t*t*t*p[3].y
		};
	}
};

LibCanvas.Context2D.implement({
	drawCurve:function (obj) {
		console.time('curve');
		var gradient = EC.gradient(obj);   //Getting gradient function
		var widthFn  = EC.width(obj);      //Getting width function
		
		var points = obj.points.map(Point);  //Getting array of points
		
		var fn =
			points.length == 0 ? EC.curves.linear    :
			points.length == 1 ? EC.curves.quadratic :
			points.length == 2 ? EC.curves.qubic     : null;  //Define function 
		
		points = [Point(obj.from)].append(points, [Point(obj.to)] );
		
		if (!fn) throw new Error('LibCanvas.Context2D.drawCurve -- unexpected number of points');
		
		var step = obj.step || 0.03;
		var inv  = obj.inverted?1:-1;
		
		var imgd = this.createImageData();
			
		var point    , p1    , p2,
			prevPoint, prevP1, prevP2,
			h, w, d,
			color, width, 
			dx, dy,
			maxX,minX,maxY,minY,
			x, y;
		
		prevPoint = fn(points, -step);
		
		buffer = document.createElement('canvas').getContext('2d');
		buffer.canvas.width = 1000;
		buffer.canvas.height = 1000;
		
		for (t=0 ; t<1 ; t+=step) {
			point = fn(points, t);      //Find position of curret point
			
			width = widthFn(t);         //Find color
			color = gradient(t);        //Find width
			
			h = point.x - prevPoint.x;  //Find delta by x
			w = point.y - prevPoint.y;  //Find delta by y
			d = Math.hypotenuse(h, w);  //Find distacne beetwen point and prevPoint
			
			sin = h / d;  //Find cos
			cos = w / d;  //Find sin
			
			dy = sin*width*inv;  //Find delta by x
			dx = cos*width;      //Find delta by y
			
			p1 = Point([point.x + dx, point.y + dy]);  //Find first point
			p2 = Point([point.x - dx, point.y - dy]);  //Find second point
			
			//404 Not found
			
			if (t) {
				
				buffer.beginPath();
				buffer.moveTo(p1.x,p1.y);
				buffer.lineTo(p2.x,p2.y);
				buffer.lineTo(prevP2.x,prevP2.y);
				buffer.lineTo(prevP1.x,prevP1.y);
				buffer.lineTo(p1.x,p1.y);

				maxX = Math.max(prevP1.x,prevP2.x,p1.x,p2.x);
				minX = Math.min(prevP1.x,prevP2.x,p1.x,p2.x);
				
				maxY = Math.max(prevP1.y,prevP2.y,p1.y,p2.y);
				minY = Math.min(prevP1.y,prevP2.y,p1.y,p2.y);
				
				for(x=minX;x<=maxX;x++){
					for(y=minY;y<=maxY;y++){
						if(buffer.isPointInPath(x,y)){
							p = (~~y)*4*imgd.width + (~~x)*4;
							imgd.data[p] = imgd.data[p+1] = imgd.data[p+2] = 0;
							imgd.data[p+3] = 255;
						}
					}
				}
				
				p = (~~p1.y)*4*imgd.width + (~~p1.x)*4;
				imgd.data[p] = imgd.data[p+1] = imgd.data[p+2] = 0;
				imgd.data[p+3] = 255;
			
				p = (~~p2.y)*4*imgd.width + (~~p2.x)*4;
				imgd.data[p] = imgd.data[p+1] = imgd.data[p+2] = 0;
				imgd.data[p+3] = 255;
				
			}
			prevP1 = p1;       //p1    -> prevP1
			prevP2 = p2;       //p2    -> prevP1
			prevPoint = point; //point -> prevPoint
		}

		this.putImageData(imgd,0,0);
		console.timeEnd('curve');
		return this;	
	}
});
};
