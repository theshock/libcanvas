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

/*
	The following text contains bad code and due to it's code it should not be readed by ANYONE!
*/

var Color = LibCanvas.Utils.Color, 
	TimingFunctions = LibCanvas.Inner.TimingFunctions,
	Point = LibCanvas.Point;

var EC = {};
EC.color = function (color) {
	color   = new Color(color || [0,0,0,1]);
	color.a = (color.a || 1) * 255;
	return color;
};

EC.getPoints = function (prevPos, pos, width, c) {
	var w = pos.x-prevPos.x,
	    h = pos.y-prevPos.y,
	    dist = Math.hypotenuse(w, h);
		
	var sin = h/dist,
	    cos = w/dist;
		
	var dx = sin * width,
	    dy = cos * width;
		
	return [new Point(pos.x + dx, pos.y + dy*c),
	        new Point(pos.x - dx, pos.y - dy*c), Math.asin(sin)];
}

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
			return gradient.from.shift( diff.clone().mul(factor) ).toString();
		}
	}
};
EC.width = function (obj) {
	obj.width = obj.width || 1;
	switch (typeof obj.width) {
		case 'number'  : return Function.lambda(obj.width);
		case 'function': return obj.width;
		case 'object'  : return EC.width.range( obj.width );
		default: throw new Error('Unexpected type of width');
	}
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

EC.curves = [
	function (p, t) { // linear
		return {
			x:p[0].x + (p[1].x - p[0].x) * t,
			y:p[0].y + (p[1].y - p[0].y) * t
		};
	},
	function (p,t) { // quadratic
		var i = 1-t;
		return {
			x:i*i*p[0].x + 2*t*i*p[1].x + t*t*p[2].x,
			y:i*i*p[0].y + 2*t*i*p[1].y + t*t*p[2].y
		};
	},
	function (p, t) { // qubic
		var i = 1-t;
		return {
			x:i*i*i*p[0].x + 3*t*i*i*p[1].x + 3*t*t*i*p[2].x + t*t*t*p[3].x,
			y:i*i*i*p[0].y + 3*t*i*i*p[1].y + 3*t*t*i*p[2].y + t*t*t*p[3].y
		};
	}
];

LibCanvas.Context2D.implement({
	drawCurve:function (obj) {
		var gradient = EC.gradient(obj);   //Getting gradient function
		var widthFn  = EC.width(obj);      //Getting width function
		
		var fn = EC.curves[ obj.points.length ]; //Define function
		
		if (!fn) throw new Error('LibCanvas.Context2D.drawCurve -- unexpected number of points');

		var points = [Point(obj.from)].append( obj.points.map(Point), [Point(obj.to)] );
		
		var step = obj.step || 0.02;
		
		var c = obj.inverted?1:-1;
		
		var pos    , p,
			prevPos, prevP,
			specPos, specP,
			angle  , prevAngle,
			width  , color;
			
        		
		prevPos = fn(points, -step);
		for (var t=-step ; t<1.02 ; t += step) {
			pos = fn(points, t);
			color = gradient(t);
			width = widthFn(t);

			p = EC.getPoints(prevPos, pos, width, c);
						
			if (t >= step) {
				if (Math.abs(p[2] - prevP[2]) > 0.1) {
				
					this.beginPath(prevP[0]);
					
					for (var f=0.002 ; f<0.02 ; f += 0.002) {
						var specPos = fn(points, t - step + f);
						var specP = EC.getPoints(prevPos, specPos, width, c);
						this.lineTo(specP[0]);
					}
					
					this
						.lineTo(p[0])
						.lineTo(p[1]);
					
					for (; f>0.002 ; f -= 0.002) {
						var specPos = fn(points, t - step + f);
						var specP = EC.getPoints(prevPos, specPos, width, c);
						this.lineTo(specP[1]);
					}
					
					this
						.lineTo(prevP[1])
						.fill(color)
						.stroke(color);
						
				} else {
					this
						.beginPath(prevP[0])
						.lineTo(prevP[1])
						.lineTo(p[1])
						.lineTo(p[0])
						.fill(color)
						.stroke(color);
				}
			}
			
			prevP   = p;
			prevPos = pos;
		}

		return this;
	}
});
};