/*
---

name: "EC"

description: "Curves with dynamic width and color"

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
EC.getColor = function (color) {
	return new Color(color || [0,0,0,1]);
};

EC.getPoints = function (prevPos, pos, width, inverted) {
	var w    = pos.x-prevPos.x,
	    h    = pos.y-prevPos.y,
	    dist = Math.hypotenuse(w, h);
		
	var sin = h / dist,
	    cos = w / dist;
		
	var dx = sin * width,
	    dy = cos * width;
		
	return [new Point(pos.x + dx, pos.y + dy*inverted),
	        new Point(pos.x - dx, pos.y - dy*inverted)];
};

EC.getGradientFunction = function (attr) {	
	switch (typeof attr.gradient) {
		case 'undefined' : 
			return Function.lambda( EC.getColor(attr.color) );
			break;
		
		case 'function' :
			return attr.gradient;
			break;
		
		default :
			var gradient = { fn: attr.gradient.fn || 'linear' };
			
			if (typeof gradient.fn != 'string') {
				throw new Error('LibCanvas.Context2D.drawCurve -- unexpected type of gradient function');
			}
			
			gradient.from = EC.getColor(attr.gradient.from);
			gradient.to   = EC.getColor(attr.gradient.to  );
			
			var diff = gradient.from.diff( gradient.to );
			
			return function (t) {
				var factor = TimingFunctions.count(gradient.fn, t);
				return gradient.from.shift( diff.clone().mul(factor) ).toString();
			};
			break;
	}
};

EC.getWidthFunction = function (attr) {
	attr.width = attr.width || 1;
	switch (typeof attr.width) {
		case 'number'  : return Function.lambda(attr.width);
		case 'function': return attr.width;
		case 'object'  : return EC.getWidthFunction.range( attr.width );
		default: throw new Error('LibCanvas.Context2D.drawCurve -- unexpected type of width');
	}
};

EC.getWidthFunction.range = function (width) {
	if(!width.from || !width.to){
		throw new Error('LibCanvas.Context2D.drawCurve -- width.from or width.to undefined');
	}
	var diff = width.to - width.from;
	return function(t){
		return width.from + diff * TimingFunctions.count(width.fn || 'linear', t);
	}
};

EC.curvesFunctions = [
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
	console.time('curve')
		var points = [Point(obj.from)].append( obj.points.map(Point), [Point(obj.to)] );
		
		var gradientFunction = EC.getGradientFunction(obj),             //Getting gradient function
			widthFunction    = EC.getWidthFunction(obj),                //Getting width function
			curveFunction    = EC.curvesFunctions[ obj.points.length ]; //Getting curve function
		
		if (!curveFunction) throw new Error('LibCanvas.Context2D.drawCurve -- unexpected number of points');
		
		var step = obj.step || 0.02;
		
		var invertedMultipler = obj.inverted ? 1 : -1;
		
		var controlPoint, prevContorolPoint,
			drawPoints  , prevDrawPoints   ,
			width , color, prevColor, style;
		
		var add = function (a, b) {
			return a + b;
		};
        
		prevContorolPoint = curveFunction(points, -step);
		
		for (var t=-step ; t<1.02 ; t += step) {
			controlPoint = curveFunction(points, t);
			color = gradientFunction(t);
			width = widthFunction(t) / 2;

			drawPoints = EC.getPoints(prevContorolPoint, controlPoint, width, invertedMultipler);
			
			if (t >= step) {			
				if ( EC.getColor(prevColor).diff(color).reduce(add) > 150 ) {
					style = this.createLinearGradient(prevContorolPoint, controlPoint);
					style.addColorStop(0, prevColor);
					style.addColorStop(1,     color);
				} else {
					style = color;
				}
				
					this
						.set("lineWidth",1)
						.beginPath(prevDrawPoints[0])
						.lineTo   (prevDrawPoints[1])
						.lineTo   (drawPoints[1])
						.lineTo   (drawPoints[0])
						.fill  (style)
						.stroke(style);
			}
			prevDrawPoints    = drawPoints;
			prevContorolPoint = controlPoint;
			prevColor         = color;
		}
	console.timeEnd('curve');
		return this;
	}
});

};