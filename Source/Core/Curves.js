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
		var widthFn  = EC.width(obj);         //Getting width function
		
		var points = obj.points.map(Point);  //Getting array of points
		
		var fn =
			points.length == 0 ? EC.curves.linear    :
			points.length == 1 ? EC.curves.quadratic :
			points.length == 2 ? EC.curves.qubic     : null;  //Define function 
		
		points = [Point(obj.from)].append(points, [Point(obj.to)] );
		
		if (!fn) throw new Error('LibCanvas.Context2D.drawCurve -- unexpected number of points');
		
		var step = obj.step || 0.0015;
		
		var imgd = this.createImageData();
		
		var last = fn(points,0), point, color, width, angle, w, dx, dy, sin, cos, f;
		
		var lastStep = -1;
		var alias;
		
		for(var t=step;t<=1;t+=step){
			point = fn(points, t); //Find x,y
			
			if(lastStep < t - step*10){
				color = gradient(t);   //Find color
				width = widthFn(t);    //Find width
				alias = Math.sqrt(width%1)/3.3; //Find alias for this width
				lastStep = t;
			} //On every 10 steps find new color and width
			
			var w = point.x-last.x, h = point.y-last.y, dist = Math.hypotenuse(w, h);
				
			if (obj.inverted) {
				sin = w/dist; cos = h/dist;
			} else {
				sin = h/dist; cos = w/dist;
			}
			
			for(var d=0;d<=dist;d+=0.4){
				
				point.x = last.x + cos * d;
				point.y = last.y + sin * d;
				
				for(w=0; w<=width; w++){
					dx = sin * w;
					dy = cos * w;
					
					p1 = (~~(point.y - dy))*4*imgd.width + (~~(point.x + dx))*4;
					p2 = (~~(point.y + dy))*4*imgd.width + (~~(point.x - dx))*4;

					imgd.data[p1  ] = imgd.data[p2  ] = color[0];
					imgd.data[p1+1] = imgd.data[p2+1] = color[1];
					imgd.data[p1+2] = imgd.data[p2+2] = color[2];
					imgd.data[p1+3] = imgd.data[p2+3] = w>width?color[3]*alias:color[3];
				}
			
			}
			
			last = point;
		}
		
		this.putImageData(imgd,0,0);
		console.timeEnd('curve');
		return this;	
	}
});
};
