/*
---

name: "Asteroids.Config"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- Asteroids

authors:
	- "Shock <shocksilien@gmail.com>"

provides: Asteroids.Config

...
*/

Asteroids.config = {
	canvas: {
		background  : '#2d612d',
		images      : {
			explosion : '/files/asteroids/explosion-150.png',
			ship      : '/files/asteroids/ship-120-blue.png',
			stars     : '/files/asteroids/stars.jpg',
			shot      : '/files/asteroids/shot-300-100.png',
			stones    : '/files/asteroids/stones-400.png',
			shipFire  : '/files/asteroids/fire.png'
		},
		progressBar : {
			width  : 600,
			height :  28,

			bgColor     : '#2d612d',
			borderColor : '#442007',
			barColor    : '#3ba12a',
			barBgColor  : '#689b63',

			strips     : true,
			stripColor : '#65300a',
			stripWidth : 25,
			stripShift : 20,
			stripStep  : 50,

			blend        : true,
			blendColor   : '#ffffff',
			blendHeight  : 10,
			blendVAlign  : 5,
			blendOpacity : 0.2
		},
		size        : [1280, 800]
	},
	speed: {
		asteroid     :  70.0,
		ship         :  10.0,
		shipFriction :   0.95,
		bullet       : 500.0
	},
	bullets: {
		lifetime : 1000,
		penalty  : 400
	},
	text: {
		padding : [10,20],
		family  : 'monospace',
		size    : 16,
		color   : '#fff'
	},
	boundsDistance: 30,
	deathPenalty: 10
};