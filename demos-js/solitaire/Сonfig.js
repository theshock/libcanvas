(function () {

var cfg = Solitaire.config = {};

$log()

var view = 'cascade';
if (parseUri().queryKey.view == 'classic') {
	view = 'classic';
}

cfg.cell = {
	shift : {
		h : { classic :  0, cascade :  9}[view],
		v : { classic : 22, cascade : 23}[view]
	},
	closed : 0.5
};
cfg.createCellShape = function (i) {
	var hShift = cfg.cell.shift.h;
	var vShift = cfg.cell.shift.v;
	var xStart = cfg.cellsCoords.x + i * cfg.card.shift;
	var yStart = cfg.cellsCoords.y;
	var clHShift = i*hShift*cfg.cell.closed;
	var clVShift = i*vShift*cfg.cell.closed;
	var polygon = new LibCanvas.Shapes.Polygon([
		[xStart, yStart],
		[xStart + cfg.card.width, yStart],
		[xStart + cfg.card.width + 12*hShift+clHShift, yStart+12*vShift+clVShift],
		[xStart + cfg.card.width + 12*hShift+clHShift, yStart+12*vShift+clVShift+cfg.card.height],
		[xStart + 12*hShift+clHShift, yStart+12*vShift+clVShift+cfg.card.height],
		[xStart, yStart + cfg.card.height]
	]);
	polygon.start = {
		x : xStart,
		y : yStart
	};
	return polygon;
};

Solitaire.createCardShape = function (coords) {
	return new LibCanvas.Shapes.Rectangle(
		coords.x, coords.y,
		cfg.card.width,
		cfg.card.height
	);
};

Solitaire.imagesList = function () {
	return {
		'cardBack'   : 'files/images/solitaire/cardBack.png',
		'fullDeck'   : 'files/images/solitaire/fullDeck.png',
		'updateDeck' : 'files/images/solitaire/updateDeck.png'
	};
};

Solitaire.progressBarStyle = {
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
};

cfg.canvas = {
	background  : '#2d612d',
	images      : Solitaire.imagesList(),
	progressBar : Solitaire.progressBarStyle
};

cfg.cardTplSize = {
	margin : [5,5],
	width  : 59,
	height : 80
};

cfg.card = {
	width  : {classic : 80 , cascade : 74}[view],
	height : {classic : 108, cascade : 100}[view],
	speed  : 800,
	margin : [ 30,
		{classic : 27, cascade : 44 }[view]
	],
};


cfg.card.shift = cfg.card.width + cfg.card.margin[1];

cfg.deckCoords = {
	x : {classic : 40, cascade : 25 }[view],
	y : 10
};

cfg.flipCoords = {
	x : cfg.deckCoords.x + cfg.card.shift,
	y : cfg.deckCoords.y
};

cfg.resultContainersCoords = {
	x : cfg.flipCoords.x + cfg.card.shift * 2,
	y : cfg.flipCoords.y
};

cfg.cellsCoords = {
	x : cfg.deckCoords.x,
	y : cfg.deckCoords.y + cfg.card.height + cfg.card.margin[0]
};

})();