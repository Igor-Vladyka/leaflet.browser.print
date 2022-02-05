/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.Control.BrowserPrint = L.Control.extend({
	options: {
		title: 'Print map',
		position: 'topleft',
		printModes: ["Portrait", "Landscape", "Auto", "Custom"],
	},
	browserPrint: undefined,
	initialize: function(options,browserPrint){
		L.setOptions(this,options);
		if(browserPrint) {
			this.browserPrint = browserPrint;
			L.setOptions(this.browserPrint, options);
		}
	},
	onAdd: function (map) {
		if(!this.browserPrint){
			this.browserPrint = new L.BrowserPrint(map,this.options);
		}

		var container = L.DomUtil.create('div', 'leaflet-control-browser-print leaflet-bar leaflet-control');
		L.DomEvent.disableClickPropagation(container);


		if (this.options.printModes.length > 1) {
			L.DomEvent.on(container, 'mouseover', this._displayPageSizeButtons, this);
			L.DomEvent.on(container, 'mouseout', this._hidePageSizeButtons, this);
		} else {
			container.style.cursor = "pointer";
		}

		if (this.options.position.indexOf("left") > 0) {
			this._createIcon(container);
			this._createMenu(container);
		} else {
			this._createMenu(container);
			this._createIcon(container);
		}

		map.printControl = this; // Make control available from the map object itself;
		return container;
	},
	
	cancel: function () {
		this.browserPrint.cancel();
	},

	_createIcon: function (container) {
		this.__link__ = L.DomUtil.create('a', '', container);
		this.__link__.className = "leaflet-browser-print";
		if (this.options.title) {
			this.__link__.title = this.options.title;
		}
		return this.__link__;
	},

	_createMenu: function (container) {
		var domPrintModes = [];

		for (var i = 0; i < this.options.printModes.length; i++) {
			var mode = this.options.printModes[i];

			/*
				Mode:
					Mode: Portrait/Landscape/Auto/Custom
					Title: 'Portrait'/'Landscape'/'Auto'/'Custom'
					PageSize: 'A3'/'A4'
					Action: '_printPortrait'/...
					InvalidateBounds: true/false
			*/
			if (mode.length) {
				var key = mode[0].toUpperCase() + mode.substring(1).toLowerCase();

				mode = L.BrowserPrint.Mode[mode]('A4',this._getDefaultTitle(key));

			} else if (mode instanceof L.BrowserPrint.Mode) {
				// Looks like everythin is fine.
			} else {
				throw "Invalid Print Mode. Can't construct logic to print current map."
			}

			var clickContainer = container;
			if (this.options.printModes.length === 1) {
				mode.Element = container;
			} else {
				clickContainer = L.DomUtil.create('ul', 'browser-print-holder', container);
				mode.Element = L.DomUtil.create('li', 'browser-print-mode', clickContainer);
				mode.Element.innerHTML = mode.options.title;
			}

			L.DomEvent.on(clickContainer, 'click', mode.options.action(this.browserPrint, mode), this.browserPrint);

			domPrintModes.push(mode);
		}

		this.options.printModes = domPrintModes;
	},

	_getDefaultTitle: function(key) {
		return this.options.printModesNames && this.options.printModesNames[key] || key;
	},

    _displayPageSizeButtons: function() {
		if (this.options.position.indexOf("left") > 0) {
	        this.__link__.style.borderTopRightRadius = "0px";
	    	this.__link__.style.borderBottomRightRadius = "0px";
		} else {
			this.__link__.style.borderTopLeftRadius = "0px";
	    	this.__link__.style.borderBottomLeftRadius = "0px";
		}

		this.options.printModes.forEach(function(mode){
			mode.Element.style.display = "inline-block";
		});
    },

    _hidePageSizeButtons: function () {
		if (this.options.position.indexOf("left") > 0) {
	    	this.__link__.style.borderTopRightRadius = "";
	    	this.__link__.style.borderBottomRightRadius = "";
		} else {
	    	this.__link__.style.borderTopLeftRadius = "";
	    	this.__link__.style.borderBottomLeftRadius = "";
		}

		this.options.printModes.forEach(function(mode){
			mode.Element.style.display = "";
		});
    },
});


L.control.browserPrint = function(options, browserPrint) {
	if (!options || !options.printModes) {
		options = options || {};
		options.printModes = [
			L.BrowserPrint.Mode.Portrait(),
			L.BrowserPrint.Mode.Landscape(),
			L.BrowserPrint.Mode.Auto(),
			L.BrowserPrint.Mode.Custom()
		]
	}

	if (options && options.printModes && (!options.printModes.filter || !options.printModes.length)) {
		throw "Please specify valid print modes for Print action. Example: printModes: [L.BrowserPrint.Mode.Portrait(), L.control.BrowserPrint.Mode.Auto('Automatic'), 'Custom']";
	}

	return new L.Control.BrowserPrint(options,browserPrint);
};
