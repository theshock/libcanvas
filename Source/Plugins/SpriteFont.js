/*
 ---

 name: "SpriteFont"

 description: "Plugin, that render font from sprite"

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.SpriteFont

 requires:
 - LibCanvas

 ...
 */

/** @class SpriteFont */
var SpriteFont = LibCanvas.declare(
	'LibCanvas.Plugins.SpriteFont', 'SpriteFont',
	{
		initialize: function (symbols) {
			if (typeof symbols == 'string') {
				symbols = symbols.split('');
			}
			this.symbols = symbols;
			this.normal  = {};
			this.bold    = {};
		},

		make: function (sheet) {
			sheet = new SpriteFont.Sheet(this, sheet);

			var target = sheet.bold ? this.bold : this.normal;

			if (target[sheet.size]) {
				throw new TypeError('Size already exists');
			}

			target[sheet.size] = sheet;

			return sheet;
		},

		get: function (symbol, data) {
			var font = ( data.bold ? this.bold : this.normal )[ data.size ];
			if (font) {
				return font.get(symbol, data.color);
			} else {
				throw new Error('No such sheet in font');
			}
		}
	}
);

/** @class SpriteFont.Sheet */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Sheet', {
	defaultColor: atom.Color.colorNames.black,

	settings: {
		image  : null,
		width  : [],
		symbols: [],
		bold   : false,
		size   : false
	},

	initialize: function (font, data) {
		this.settings = new atom.Settings(this.settings).set(data);
		this.symbols  = font.symbols;
		this.colors   = {};
		this.icons    = {};
	},

	get bold () { return this.settings.get('bold') },
	get size () { return this.settings.get('size') },

	get: function (symbol, color) {
		if (symbol in this.icons) {
			return this.icons[symbol];
		}

		if (!symbol in this.symbols) {
			throw new TypeError('Unknown symbol: ' + symbol);
		}
		if (color == null) {
			color = this.defaultColor;
		}
		color = atom.Color(color).toString('hex');

		var colors = this.colors;

		if (!colors[color]) {
			colors[color] = {};
		}
		if (!colors[color][symbol]) {
			colors[color][symbol] = this.generateSymbol(symbol, color);
		}

		return colors[color][symbol];
	},

	addIcon: atom.core.overloadSetter(function (name, image) {
		this.icons[name] = image;
	}),

	generateSymbol: function (symbol, color) {
		var i, w, h, x, img, buffer,
			width   = this.settings.get('width'),
			found   = false,
			symbols = this.symbols;

		for ( i = 0, x = 0; i < symbols.length; i++ ) {
			w = width[i];
			if (symbols[i] == symbol) {
				found = true;
				break;
			}
			x += w;
		}

		if (!found) {
			throw new Error('No symbol in list: ' + symbol);
		}

		img = this.settings.get('image');
		h   = img.height;
		buffer = LibCanvas.buffer(w, h, true);
		buffer.ctx.drawImage({
			image: img,
			crop : [ x, 0, w, h ],
			draw : buffer.ctx.rectangle
		});

		if (color != this.defaultColor) {
			buffer.ctx
				.save()
				.set({ globalCompositeOperation: Context2D.COMPOSITE.SOURCE_IN })
				.fillAll(color)
				.restore();

		}

		return buffer;
	}
});


/** @class SpriteFont.Render */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Render', {

	/**
	 * @param {object}      ctx
	 * @param {object}      options
	 * @param {number}     [options.size=16]
	 * @param {boolean}    [options.bold=false]
	 * @param {boolean}    [options.tags=true]
	 * @param {string}     [options.text='']
	 * @param {SpriteFont}  options.font
	 * @param {Rectangle}   options.shape
	 * @param {string}     [options.align='left'] - 'left|middle|right'
	 */
	initialize: function (ctx, options) {
		this.ctx = ctx;
		this.options = atom.core.append({
			size : 16,
			bold : false,
			text : '',
			tags : '{*}',
			font : null,
			shape: null,
			color: 'black',
			align: 'left',
			lines: null,
			noWrap: false,
			letterSpacing: 0,
			autoRender: true,
			forceSplit: false
		}, options);

		this.options.text = String( this.options.text );

		if (this.options.autoRender) {
			var completeLines = this.parseAndGetLines();
			this.render(completeLines);
		}
	},

	getLinesHeight: function(lines) {
		var height = 0;
		for (var idx = 0; idx < lines.length; idx++) {
			height += lines[idx].height;
		}
		return height;
	},

	parseAndGetLines: function() {
		var steps = new SpriteFont.Steps(this, new SpriteFont.Lexer(
			this.options.text, this.options.tags
		));

		steps.countSizes(this.options.font, this.options.letterSpacing);

		var lines = this.options.lines;
		if (!lines) lines = new SpriteFont.LinesEnRu();
		lines.setConfig(this.options.font, this.options.noWrap, this.options.forceSplit);

		return lines.run( steps.steps, this.options.shape.width );
	},

	render: function (lines) {
		var x, y, w, l, i, from = this.options.shape.from;

		for (l = 0, y = Math.floor(from.y); l < lines.length; l++) {
			x = Math.floor(from.x);

			if (this.options.align != 'left') {
				w = lines[l].reduce(function (current, elem) { return current + elem.width }, 0);

				if (this.options.align == 'center') {
					x += parseInt((this.options.shape.width - w) / 2);
				}

				if (this.options.align == 'right') {
					x += this.options.shape.width - w;
				}
			}

			for (i = 0; i < lines[l].length; i++) {
				this.ctx.drawImage( lines[l][i].image, x, y );
				x += lines[l][i].width;
			}
			y += lines[l].height;
		}
	}
});

/** @class SpriteFont.Steps */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Steps', {
	tags: {
		bold : false,
		size : true,
		color: true
	},

	tagRegExp: /(\w+)(=.*)?/,

	initialize: function (render, lexer) {
		this.steps  = [];
		this.tokens = lexer.tokens;
		this.index  = -1;

		this.split(atom.object.collect(render.options, [ 'color', 'size', 'bold' ]));
	},

	split: function (initialMode) {
		var t,
			i = 0,
			l = this.tokens.length,
			stack = [ initialMode ],
			last  = function () {
				return stack[ stack.length - 1 ];
			};

		for (; i < l; i++) {
			t = this.tokens[i];
			if (t.type == 'string') {
				t.content.split('').forEach(function (l) {
					this.steps.push({ type: 'symbol', content: l, mode: last() });
				}.bind(this));
			} else if (t.type == 'nl') {
				this.steps.push(t);
			} else if (t.type == 'tag') {
				if (this.isCloseModeTag(t)) {
					stack.pop();
				} else if (this.isChangeModeTag(t)) {
					stack.push(this.createMode(t, last()));
				} else {
					this.steps.push({ type: 'icon', content: t.content, mode: last() });
				}
			} else {
				throw new Error('Unknown type: ' + t.type);
			}
		}
	},

	isChangeModeTag: function (t) {
		return t.content.match( this.tagRegExp )[1] in this.tags;
	},

	isCloseModeTag: function (t) {
		return t.content == '/';
	},

	createMode: function (t, currentMode) {
		var
			parts = t.content.match( this.tagRegExp ),
			tag   = parts[1],
			value = parts[2],
			mode  = atom.core.append({}, currentMode);

		if (this.tags[tag]) {
			if (value) value = value.substr(1);
			if (value == '') throw new Error('Value required in tag ' + tag);
		} else {
			value = true;
		}

		mode[tag] = value;
		return mode;
	},

	countSizes: function (font, letterSpacing) {
		var i, s, img;
		for (i = 0; i < this.steps.length; i++) {
			s = this.steps[i];
			if (s.type == 'symbol' || s.type == 'icon') {
				img = font.get( s.content, s.mode );
				s.image  = img;
				s.width  = img.width + letterSpacing;
				s.height = img.height;
			}
		}
	}
});

/** @class SpriteFont.Lexer */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Lexer', {

	initialize: function (string, tags) {
		this.string = string;
		this.tags   = this.parseTags(tags);
		this.tokens = this.tokenize();
	},

	tokenize: function () {
		var t = this.tags, s = this.string;
		return t ?
			this.parseTaggedText(s, t) :
			this.parsePlainText (s);
	},

	parseTaggedText: function (string, tags) {
		var
			i = 0,
			last,
			symbol = '',
			result = [],
			length = string.length;

		for (; i < length; i++) {
			symbol = string[i];
			if (symbol == '\n') {
				if (last && last.type == 'tag') {
					throw new Error('Tag started, but not finished at symbol ' + i);
				}
				result.push({ type: 'nl' });
				last = null;
			} else if (symbol == tags[0]) {
				if (last && last.type == 'tag') {
					throw new Error('Wrong tag opening at symbol ' + i);
				}
				result.push(last = { type: 'tag'   , content: '' });
			} else if (!last) {
				result.push(last = { type: 'string', content: string[i] });
			} else if (symbol == tags[1] && last.type == 'tag') {
				last = null;
			} else {
				last.content += string[i];
			}
		}

		return result;
	},

	parsePlainText: function (string) {
		var
			i = 0,
			last,
			result = [],
			length = string.length;
		for (; i < length; i++) {
			if (string[i] == '\n') {
				last = null;
				result.push({ type: 'nl' });
			} else if (!last) {
				last = { type: 'string', content: string[i] };
				result.push(last);
			} else {
				last.content += string[i];
			}
		}
		return result;
	},

	parseTags: function (tags) {
		if (tags == null) return null;

		function wrong (part) {
			throw new TypeError('String like "[*]" required (' + part + ')');
		}

		if (typeof tags != 'string') wrong('typeof');

		tags = tags.split('*');

		if (tags   .length != 2) wrong('split');
		if (tags[0].length != 1) wrong('left' );
		if (tags[1].length != 1) wrong('right');

		return tags;
	}
});

/** @class SpriteFont.MorphemesFinder */
atom.declare( 'LibCanvas.Plugins.SpriteFont.MorphemesFinder', {
	vowels: 'AEIOUYaeiouyАОУЮИЫЕЭЯЁаоуюиыеэяёьЄІЇЎєіїў',

	initialize: function () {
	},

	isLetter: function(str) {
		return (str >= 'a' && str <= 'z') || (str >= 'A' && str <= 'я') ||
			(str >= 'A' && str <= 'Z') || (str >= '\u00c0' && str <= '\u02a8') ||
			(str >= '0' && str <= '9') || (str >= '\u0386' && str <= '\u04ff');
	},

	isVowel: function(str) {
		return str && str.length == 1 && this.vowels.indexOf(str) > -1;
	},

	isMorpheme: function (str) {
		if (!str || str.length <= 1) return false;

		for (var i = str.length; i--;) if (this.isVowel(str[i])) return true;

		return false;
	},

	findMorphemes: function (line) {
		var i = 0, c, morphemes = [], lastStr = '', last = [], prev;

		var pushLast = function () {
			prev = morphemes[ morphemes.length - 1 ];
			if (Array.isArray(prev)) {
				atom.array.append( prev, last );
			} else {
				morphemes.push(last);
			}
			last = [];
			lastStr = '';

			if (!this.isLetter(c)) {
				morphemes.push( line[i] );
			}
		}.bind(this);

		for (; i < line.length; i++) {
			c = line[i].content;

			if (line[i].type == 'icon') {
				morphemes.push(last);
				last = [];
				lastStr = '';
				morphemes.push( line[i] );
			} else if (line[i].type == 'symbol' && this.isLetter(c)) {
				lastStr += c;
				last.push(line[i]);
				if (this.isMorpheme(lastStr)) {
					morphemes.push(last);
					last = [];
					lastStr = '';
				}
			} else if (lastStr) {
				pushLast();
			} else {
				morphemes.push( line[i] );
			}
		}

		if (lastStr) pushLast();

		return morphemes;
	}
});

/** @class SpriteFont.LinesEnRu */
atom.declare( 'LibCanvas.Plugins.SpriteFont.LinesEnRu', {
	setConfig: function (font, noWrap, forceSplit) {
		this.font = font;
		this.noWrap = noWrap;
		this.forceSplit = forceSplit;
		this.morphemesFinder = new SpriteFont.MorphemesFinder();
	},

	run: function (steps, maxWidth) {
		var i, line = [], morphemes = [], tmpMark = false;

		for (i = 0; i < steps.length; i++) {

			if (this.forceSplit) {
				line.push(steps[i]);
			} else {
				if (steps[i].type == 'icon') tmpMark = true;

				if (steps[i].type == 'nl' || i == steps.length - 1) {
					if (steps[i].type != 'nl') {
						line.push(steps[i]);
					}

					morphemes.push( this.morphemesFinder.findMorphemes(line) );
					line = [];
				} else {
					line.push(steps[i]);
				}
			}
		}

		if (this.forceSplit) {
			morphemes.push(line);
		}

		return this.countLines(morphemes, maxWidth);

	},

	countLines: function (mLines, maxWidth) {
		var lines = [], l, i, line = [], width = 0, mWidth;

		function add (data) {
			if (!Array.isArray(data)) data = [ data ];
			for (var i = 0; i < data.length; i++) {
				line.push(data[i]);
				width += data[i].width;
			}
		}

		for (l = 0; l < mLines.length; l++) {
			for (i = 0; i < mLines[l].length; i++) {
				mWidth = this.countLength(mLines[l][i]);

				if (mWidth > maxWidth) {
					throw new Error('Morpheme too long');
				}

				if (!this.noWrap && (width + mWidth > maxWidth || (i == 0 && l > 0))) {
					lines.push(line);
					line  = [];
					width = 0;
				}

				add(mLines[l][i]);
			}
		}

		if (line.length > 0) lines.push(line);

		lines.forEach(function (l) {
			l.height = 0;

			l.forEach(function (obj) {
				l.height = Math.max( l.height, obj.height );
			});
		});

		return lines;
	},

	countLength: function (m) {
		if (Array.isArray(m)) {
			return atom.array.reduce(
				m, function (value, sym) { return value + sym.width }, 0
			);
		} else {
			return m.width;
		}
	}
});
