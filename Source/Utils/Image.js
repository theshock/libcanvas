
// <image> tag
atom.implement(HTMLImageElement, {
	sprite : function () {
		if (!this.isLoaded()) {
			atom.log('Not loaded in Image.sprite: ', this);
			throw 'Not loaded in Image.sprite, logged';
		}
		var buf;
		this.spriteCache = this.spriteCache || {};
		if (arguments.length) {
			var rect = LibCanvas.Shapes.Rectangle.factory(arguments);
			var index = [rect.from.x,rect.from.y,rect.getWidth(),rect.getHeight()].join('.');
			buf = this.spriteCache[index];
			if (!buf) {
				buf = LibCanvas.Buffer(rect.getWidth(), rect.getHeight());
				var bigBuf = LibCanvas.Buffer(this.width*2, this.height*2);
				for (var y = 0; y < 2; y++) {
					for (var x = 0; x < 2; x++) {
						bigBuf.getContext('2d-libcanvas').drawImage({
							image : this,
							from : [this.width*x,this.height*y]
						});
					}
				}
				buf.getContext('2d-libcanvas').drawImage({
					image : bigBuf,
					crop  : rect,
					draw  : [0,0,rect.getWidth(),rect.getHeight()]
				});
				bigBuf.getContext('2d-libcanvas').clearAll();
				this.spriteCache[index] = buf;
			}

		} else {
			buf = this.spriteCache[0];
			if (!buf) {
				this.spriteCache[0] = buf = LibCanvas.Buffer(this.width, this.height);
				buf.getContext('2d-libcanvas').drawImage(this, 0, 0);
			}
		}
		return buf;
	},
	isLoaded : function () {
		if (!this.complete) return false;
		return !Object.isDefined(this.naturalWidth) || this.naturalWidth; // browsers
	}
});