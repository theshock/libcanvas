/*
---

name: "LibCanvas.Utils.Trace"

description: "Useful tool which provides windows with user-defined debug information"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas

provides: LibCanvas.Utils.Trace

...
*/

new function () {

var Trace = LibCanvas.namespace('Utils').Trace = atom.Class({
	initialize : function (object) {
		if (arguments.length == 1) this.trace(object);
		this.stopped = false;
		return this;
	},
	stop  : function () {
		this.stopped = true;
		return this;
	},
	trace : function (object) {
		if (this.stopped) return false;
		if (!this.blocked) {
			this.createNode().html(
				this.dump(object)
					.safeHtml()
					.replaceAll({
						'\t': '&nbsp;'.repeat(3),
						'\n': '<br />'
					})
				|| 'null'
			);
		}
		return this;
	},
	dumpRec : function (obj, level) {
		var callee = arguments.callee;
		var html = '', type = atom.typeOf(obj);
		if (level > 5) return '*TOO_DEEP : ' + level + '*';
		var tabs = '\t'.repeat(level);
		if (Array.isArray(obj)) {
			html += tabs + '[\n';
			obj.forEach(function (key) {
				html += tabs + '\t' + key + ': ' + callee(this, 1+(1*level)) + '\n';
			});
			html += tabs + ']\n';
		} else if (type == 'element') {
			var attr = [], meth = [];
			for (var i in obj) (typeof(obj[i]) == 'function') ?
				meth.push(i + '()') : attr.push(i);
			html += obj.toString() + ' {\n';
			if (obj.tagName == 'IMG') try {
				html += tabs + '\tsrc        : ' + obj.src + '\n';
				html += tabs + '\tsize       : ' + obj.width + '×' + obj.height + '\n';
			} catch (ignored) {}
			html += tabs + '\tattributes : ' + meth.join(', ') + '\n';
			html += tabs + '\tmethods    : ' + attr.join(', ') + '\n';
			html += tabs + '}\n'
		} else if (type == 'object') {
			html += '{\n';
			for (var key in obj) {
				html += tabs + '\t' + key + ': ' + callee(obj[key], 1+(1*level)) + '\n';
			}
			html += tabs + '}';
		} else if (type == 'null') {
			html += 'null';
		} else if (type === 'boolean') {
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
		var cont = atom('#traceContainer');
		return cont.length ? cont :
			atom().create('div', { 'id' : 'traceContainer'})
				.css({
					'position' : 'absolute',
					'top'      : '3px',
					'right'    : '6px',
					'maxWidth' : "70%"
				})
				.appendTo('body');
	},
	events : function (remove) {
		var trace = this;
		if (remove) {
			return this.node;
			this.node
				.unbind('onmouseover')
				.unbind('onmouseout')
				.unbind('onmousedown')
				.unbind('onmouseup');
		} else {
			this.node.bind({
				mouseover : function () {
					this.css('background', '#222');
				},
				mouseout  : function () {
					this.css('background', '#000');
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
		this.node.css('background', '#300');
		this.timeout = setTimeout (function () {
			if (trace.node) {
				trace.node.destroy();
				trace.node = null;
			}
		}, 500);
		return this;
	},
	createNode : function () {
		if (this.node) {
			if (this.timeout) {
				this.timeout.stop();
				this.events(this.node);
				this.node.css('background', '#000');
			}
			return this.node;
		}

		this.node = atom()
			.create('div')
			.css({
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
			})
			.appendTo(this.getContainer())
			.bind({
				click    : this.destroy.context(this),
				dblclick : function () { this.stop().destroy(); }.context(this)
			});
		return this.events();
	}
});

window.trace = function (msg) {
	if (arguments.length) {
		Array.from(arguments).forEach(function (a) {
			new Trace(a);
		})
	} else return new Trace();
};

}();