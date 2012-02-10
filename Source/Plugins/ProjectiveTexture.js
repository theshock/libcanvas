/*
---

name: "Plugins.ProjectiveTexture"

description: "Provides testing projective textures rendering (more info: http://acko.net/files/projective/index.html)"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Context2D

provides: Plugins.ProjectiveTexture

source: "http://acko.net/blog/projective-texturing-with-canvas"

...
*/

var ProjectiveTexture = function () {

Context2D.prototype.projectiveImage = function (arg) {
	// test
	new ProjectiveTexture(arg.image)
		.setContext(this.ctx2d)
		.setQuality(arg.patchSize, arg.limit)
		.render( arg.to );
	return this;
};

var ProjectiveTexture = declare( 'LibCanvas.Plugins.ProjectiveTexture', {
	initialize : function (image) {
		if (typeof image == 'string') {
			this.image = new Image;
			image.src = image
		} else {
			this.image = image;
		}
		this.patchSize = 64;
		this.limit = 4;
	},
	setQuality : function (patchSize, limit) {
		this.patchSize = patchSize == null ? 64 : patchSize;
		this.limit = limit == null ? 4 : limit;
		return this;
	},
	setContext : function (ctx) {
		this.ctx = ctx;
		return this;
	},
	render : function (polygon) {

		var points = polygon.points;
		points = [
			[points[0].x, points[0].y],
			[points[1].x, points[1].y],
			[points[3].x, points[3].y],
			[points[2].x, points[2].y]
		];
		
		var tr = getProjectiveTransform(points);

		// Begin subdivision process.
		var ptl = tr.transformProjectiveVector([0, 0, 1]);
		var ptr = tr.transformProjectiveVector([1, 0, 1]);
		var pbl = tr.transformProjectiveVector([0, 1, 1]);
		var pbr = tr.transformProjectiveVector([1, 1, 1]);

		this.transform = tr;
		divide.call(this, 0, 0, 1, 1, ptl, ptr, pbl, pbr, this.limit);

		return this;
	}
});

var divide = function (u1, v1, u4, v4, p1, p2, p3, p4, limit) {

	 // See if we can still divide.
	if (limit) {
		// Measure patch non-affinity.
		var d1 = [p2[0] + p3[0] - 2 * p1[0], p2[1] + p3[1] - 2 * p1[1]];
		var d2 = [p2[0] + p3[0] - 2 * p4[0], p2[1] + p3[1] - 2 * p4[1]];
		var d3 = [d1[0] + d2[0], d1[1] + d2[1]];
		var r = Math.abs((d3[0] * d3[0] + d3[1] * d3[1]) / (d1[0] * d2[0] + d1[1] * d2[1]));

		// Measure patch area.
		d1 = [p2[0] - p1[0] + p4[0] - p3[0], p2[1] - p1[1] + p4[1] - p3[1]];
		d2 = [p3[0] - p1[0] + p4[0] - p2[0], p3[1] - p1[1] + p4[1] - p2[1]];
		var area = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);

		// Check area > patchSize pixels (note factor 4 due to not averaging d1 and d2)
		// The non-affinity measure is used as a correction factor.
		if ((u1 == 0 && u4 == 1) || ((.25 + r * 5) * area > (this.patchSize * this.patchSize))) {
			// Calculate subdivision points (middle, top, bottom, left, right).
			var umid = (u1 + u4) / 2;
			var vmid = (v1 + v4) / 2;
			var tr   = this.transform;
			var pmid = tr.transformProjectiveVector([umid, vmid, 1]);
			var pt   = tr.transformProjectiveVector([umid, v1, 1]);
			var pb   = tr.transformProjectiveVector([umid, v4, 1]);
			var pl   = tr.transformProjectiveVector([u1, vmid, 1]);
			var pr   = tr.transformProjectiveVector([u4, vmid, 1]);
			
			// Subdivide.
			limit--;
			divide.call(this,   u1,   v1, umid, vmid,   p1,   pt,   pl, pmid, limit);
			divide.call(this, umid,   v1,   u4, vmid,   pt,   p2, pmid,   pr, limit);
			divide.call(this,  u1,  vmid, umid,   v4,   pl, pmid,   p3,   pb, limit);
			divide.call(this, umid, vmid,   u4,   v4, pmid,   pr,   pb,   p4, limit);

			return;
		}
	}
	
	var ctx = this.ctx;

	// Render this patch.
	ctx.save();
	// Set clipping path.
	ctx.beginPath();
	ctx.moveTo(p1[0], p1[1]);
	ctx.lineTo(p2[0], p2[1]);
	ctx.lineTo(p4[0], p4[1]);
	ctx.lineTo(p3[0], p3[1]);
	ctx.closePath();
	//ctx.clip();

	// Get patch edge vectors.
	var d12 = [p2[0] - p1[0], p2[1] - p1[1]];
	var d24 = [p4[0] - p2[0], p4[1] - p2[1]];
	var d43 = [p3[0] - p4[0], p3[1] - p4[1]];
	var d31 = [p1[0] - p3[0], p1[1] - p3[1]];

	// Find the corner that encloses the most area
	var a1 = Math.abs(d12[0] * d31[1] - d12[1] * d31[0]);
	var a2 = Math.abs(d24[0] * d12[1] - d24[1] * d12[0]);
	var a4 = Math.abs(d43[0] * d24[1] - d43[1] * d24[0]);
	var a3 = Math.abs(d31[0] * d43[1] - d31[1] * d43[0]);
	var amax = Math.max(Math.max(a1, a2), Math.max(a3, a4));
	var dx = 0, dy = 0, padx = 0, pady = 0;

	// Align the transform along this corner.
	switch (amax) {
		case a1:
			ctx.transform(d12[0], d12[1], -d31[0], -d31[1], p1[0], p1[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
			break;
		case a2:
			ctx.transform(d12[0], d12[1],  d24[0],  d24[1], p2[0], p2[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
			dx = -1;
			break;
		case a4:
			ctx.transform(-d43[0], -d43[1], d24[0], d24[1], p4[0], p4[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
			dx = -1;
			dy = -1;
			break;
		case a3:
			// Calculate 1.05 pixel padding on vector basis.
			ctx.transform(-d43[0], -d43[1], -d31[0], -d31[1], p3[0], p3[1]);
			if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
			dy = -1;
			break;
	}

	// Calculate image padding to match.
	var du = (u4 - u1);
	var dv = (v4 - v1);
	var padu = padx * du;
	var padv = pady * dv;


	var iw = this.image.width;
	var ih = this.image.height;

	ctx.drawImage(
		this.image,
		u1 * iw,
		v1 * ih,
		Math.min(u4 - u1 + padu, 1) * iw,
		Math.min(v4 - v1 + padv, 1) * ih,
		dx, dy,
		1 + padx, 1 + pady
	);
	ctx.restore();
}

/**
 * Generic matrix class. Built for readability, not for speed.
 *
 * (c) Steven Wittens 2008
 * http://www.acko.net/
 */
var Matrix = function (w, h, values) {
  this.w = w;
  this.h = h;
  this.values = values || allocate(h);
};

var allocate = function (w, h) {
  var values = [];
  for (var i = 0; i < h; ++i) {
    values[i] = [];
    for (var j = 0; j < w; ++j) {
      values[i][j] = 0;
    }
  }
  return values;
}

var cloneValues = function (values) {
	var clone = [];
	for (var i = 0; i < values.length; ++i) {
		clone[i] = [].concat(values[i]);
	}
	return clone;
}

function getProjectiveTransform(points) {
  var eqMatrix = new Matrix(9, 8, [
    [ 1, 1, 1,   0, 0, 0, -points[3][0],-points[3][0],-points[3][0] ],
    [ 0, 1, 1,   0, 0, 0,  0,-points[2][0],-points[2][0] ],
    [ 1, 0, 1,   0, 0, 0, -points[1][0], 0,-points[1][0] ],
    [ 0, 0, 1,   0, 0, 0,  0, 0,-points[0][0] ],

    [ 0, 0, 0,  -1,-1,-1,  points[3][1], points[3][1], points[3][1] ],
    [ 0, 0, 0,   0,-1,-1,  0, points[2][1], points[2][1] ],
    [ 0, 0, 0,  -1, 0,-1,  points[1][1], 0, points[1][1] ],
    [ 0, 0, 0,   0, 0,-1,  0, 0, points[0][1] ]

  ]);

  var kernel = eqMatrix.rowEchelon().values;
  var transform = new Matrix(3, 3, [
    [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
    [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
    [-kernel[6][8], -kernel[7][8],             1]
  ]);
  return transform;
}

Matrix.prototype = {
	add : function (operand) {
		if (operand.w != this.w || operand.h != this.h) {
			throw new Error("Matrix add size mismatch");
		}

		var values = allocate(this.w, this.h);
		for (var y = 0; y < this.h; ++y) {
			for (var x = 0; x < this.w; ++x) {
			  values[y][x] = this.values[y][x] + operand.values[y][x];
			}
		}
		return new Matrix(this.w, this.h, values);
	},
	transformProjectiveVector : function (operand) {
		var out = [], x, y;
		for (y = 0; y < this.h; ++y) {
			out[y] = 0;
			for (x = 0; x < this.w; ++x) {
				out[y] += this.values[y][x] * operand[x];
			}
		}
		var iz = 1 / (out[out.length - 1]);
		for (y = 0; y < this.h; ++y) {
			out[y] *= iz;
		}
		return out;
	},
	multiply : function (operand) {
		var values, x, y;
		if (+operand !== operand) {
			// Matrix mult
			if (operand.h != this.w) {
				throw new Error("Matrix mult size mismatch");
			}
			values = allocate(this.w, this.h);
			for (y = 0; y < this.h; ++y) {
				for (x = 0; x < operand.w; ++x) {
					var accum = 0;
					for (var s = 0; s < this.w; s++) {
						accum += this.values[y][s] * operand.values[s][x];
					}
					values[y][x] = accum;
				}
			}
			return new Matrix(operand.w, this.h, values);
		}
		else {
			// Scalar mult
			values = allocate(this.w, this.h);
			for (y = 0; y < this.h; ++y) {
				for (x = 0; x < this.w; ++x) {
					values[y][x] = this.values[y][x] * operand;
				}
			}
			return new Matrix(this.w, this.h, values);
		}
	},
	rowEchelon : function () {
		if (this.w <= this.h) {
			throw new Error("Matrix rowEchelon size mismatch");
		}

		var temp = cloneValues(this.values);

		// Do Gauss-Jordan algorithm.
		for (var yp = 0; yp < this.h; ++yp) {
			// Look up pivot value.
			var pivot = temp[yp][yp];
			while (pivot == 0) {
				// If pivot is zero, find non-zero pivot below.
				for (var ys = yp + 1; ys < this.h; ++ys) {
					if (temp[ys][yp] != 0) {
						// Swap rows.
						var tmpRow = temp[ys];
						temp[ys] = temp[yp];
						temp[yp] = tmpRow;
						break;
					}
				}
				if (ys == this.h) {
					// No suitable pivot found. Abort.
					return new Matrix(this.w, this.h, temp);
				}
				else {
					pivot = temp[yp][yp];
				}
			}
			// Normalize this row.
			var scale = 1 / pivot;
			for (var x = yp; x < this.w; ++x) {
				temp[yp][x] *= scale;
			}
			// Subtract this row from all other rows (scaled).
			for (var y = 0; y < this.h; ++y) {
				if (y == yp) continue;
				var factor = temp[y][yp];
				temp[y][yp] = 0;
				for (x = yp + 1; x < this.w; ++x) {
					temp[y][x] -= factor * temp[yp][x];
				}
			}
		}

		return new Matrix(this.w, this.h, temp);
	},
	invert : function () {
		var x, y;

		if (this.w != this.h) {
			throw new Error("Matrix invert size mismatch");
		}

		var temp = allocate(this.w * 2, this.h);

		// Initialize augmented matrix
		for (y = 0; y < this.h; ++y) {
			for (x = 0; x < this.w; ++x) {
				temp[y][x] = this.values[y][x];
				temp[y][x + this.w] = (x == y) ? 1 : 0;
			}
		}

		temp = new Matrix(this.w * 2, this.h, temp);
		temp = temp.rowEchelon();

		// Extract right block matrix.
		var values = allocate(this.w, this.h);
		for (y = 0; y < this.w; ++y) {
			// @todo check if "x < this.w;" is mistake
			for (x = 0; x < this.w; ++x) {
				values[y][x] = temp.values[y][x + this.w];
			}
		}
		return new Matrix(this.w, this.h, values);
	}
};

return ProjectiveTexture;
}();