/*
---

name: "Examples Core"

description: "LibCanvas examples initialization"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>
	- Anna Shurubey aka Nutochka <iamnutochka@gmail.com>
	- Nikita Baksalyar <nikita@baksalyar.ru>

provides: Examples

...
*/

new function () {

LibCanvas.Examples = {
	registry: {},
	set: function (name, fn) {
		this.registry[name] = fn;
		return this;
	},
	get: function (name) {
		return this.registry[name] || null;
	},
	has: function (name) {
		return name in this.registry;
	},
	start: function () {
		atom('canvas').each(function (canvas) {
			var app = canvas.getAttribute('data-app'),
				arg = canvas.getAttribute('data-arg');

			if (!this.has(app)) {
				arg = app;
				app = 'Error';
			}
			if (!this.has(app)) throw new Error('No «Error» application');
			
			this.get(app)(canvas, arg);
		}.context(this));

		return this;
	},
	showLinks: function () {
		var links = [];
		for (var name in this.registry) {
			links.push('<li><a href="?app=' + name + '">' + name +'</a></li>');
		}

		atom().create('div')
			.html('<ul>' + links.join('\n') + '</ul>')
			.appendTo('body');

		return this;
	},
	autoStart: function () {
		atom(function () {
			this.start().showLinks();
		}.context(this));
		return this;
	}
};

LibCanvas.Examples.autoStart();

};