/*
---
description: Useful tool which provides windows with user-defined debug information

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.Trace]
*/

LibCanvas.Utils.Trace = new Class({
	initialize : function (object) {
		if (arguments.length == 1) {
			if (!this.trace) {
				return new LibCanvas.Trace(object);
			}
			this.trace(object);
		}
		this.stopped = false;
		return this;
	},
	stop  : function () {
		this.stopped = true;
		return this;
	},
	trace : function (object) {
		if (this.stopped) {
			return false;
		}
		if (!this.blocked) {
			this.createNode().set('html',
				this.dump(object)
					.safeHTML()
					.replaceAll('\t', '&nbsp;&nbsp;&nbsp;')
					.replaceAll('\n', '<br />')
				|| 'null'
			);
		}
		return this;
	},
	dumpRec : function (obj, level) {
		var callee = arguments.callee;
		var html = '';
		if (level > 5) {
			return '*TOO_DEEP : ' + level + '*';
		}
		var tabs = '\t'.repeat(level);
		if ($type(obj) == 'array') {
			html += tabs + '[\n';
			obj.each(function (key) {
				html += tabs + '\t' + key + ': ' + callee(this, 1+(1*level)) + '\n';
			})
			html += tabs + ']\n';
		} else if ($type(obj) == 'element') {
			var attr = [];
			var meth = [];
			for (var i in obj) {
				(typeof(obj[i]) == 'function') ?
					meth.push(i + '()') : attr.push(i);
			}
			html += obj.toString() + ' {\n';
			if (obj.tagName == 'IMG') {
				try {
					html += tabs + '\tsrc        : ' + obj.src + '\n';
					html += tabs + '\tsize       : ' + obj.width + '×' + obj.height + '\n';
				} catch (ignored) {};
			}
			html += tabs + '\tattributes : ' + meth.join(', ') + '\n';
			html += tabs + '\tmethods    : ' + attr.join(', ') + '\n';
			html += tabs + '}\n'
		} else if (typeof(obj) == 'object') {
			html += '{\n';
			for (var key in obj) {
				html += tabs + '\t' + key + ': ' + callee(obj[key], 1+(1*level)) + '\n';
			}
			html += tabs + '}';
		} else if ($type(obj) === 'boolean') {
			html += obj ? 'true' : 'false';
		} else {
			html += obj;
		}
		return html;
	},
	dump : function (object) {
		return (this.dumpRec(object, [], 0));
	},
	getContainer : function () {
		return $('traceContainer') ||
			new Element('div', {
				'id' : 'traceContainer',
				'styles' :  {
					'position' : 'absolute',
					'top'      : '3px',
					'right'    : '6px',
					'maxWidth' : "70%"
				}
			}).inject($$('body')[0]);
	},
	events : function (remove) {
		var trace = this;
		if (remove) {
			this.node
				.removeEvents('onmouseover')
				.removeEvents('onmouseout')
				.removeEvents('onmousedown')
				.removeEvents('onmouseup');
		} else {
			this.node
				.addEvents({
					mouseover : function () {
						this.setStyle('background', '#222');
					},
					mouseout  : function () {
						this.setStyle('background', '#000');
					},
					mousedown : function () {
						trace.blocked = true;
					},
					mouseup : function () {
						trace.blocked = false;
					}
				});
		}
		return this.node;
	},
	destroy : function () {
		var trace = this;
		this.events(true);
		this.node.setStyle('background', '#300');
		this.timeout = setTimeout (function () {
			if (trace.node) {
				trace.node.destroy();
				trace.node = null;
			}
		}, 500);
		return this;
	},
	createNode : function () {
		var trace = this;
		if (trace.node) {
			if (trace.timeout) {
				clearTimeout(trace.timeout);
				this.events(trace.node);
				trace.node.setStyle('background', '#000');
			}
			return trace.node;
		}

		this.node = new Element('div', {
				'styles' : {
					background : '#000',
					border     : '1px dashed #0c0',
					color      : '#0c0',
					cursor     : 'pointer',
					fontFamily : 'monospace',
					margin     : '1px',
					minWidth   : '200px',
					overflow   : 'auto',
					padding    : '3px 12px',
					whiteSpace : 'pre'
				}
			})
			.inject(trace.getContainer())
			.addEvents({
				click : function () {
					trace.destroy();
				},
				dblclick : function () {
					trace.stop().destroy();
				}
			})
		return this.events();
	}
});

window.trace = function (msg) {
	if (arguments) {
		$A(arguments).each(function (a) {
			new LibCanvas.Utils.Trace(a);
		});
	} else {
		new LibCanvas.Utils.Trace();
	}
	
};