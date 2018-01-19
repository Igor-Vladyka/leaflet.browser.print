/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.Control.BrowserPrint = L.Control.extend({
	options: {
		title: 'Print map',
		position: 'topleft',
        printLayer: null,
		printModes: ["Portrait", "Landscape", "Auto", "Custom"],
		printModesNames: {Portrait: "Portrait", Landscape: "Landscape", Auto: "Auto", Custom: "Custom"},
		closePopupsOnPrint: true,
		contentSelector: "[leaflet-browser-print-content]",
	},

	onAdd: function (map) {

		var container = L.DomUtil.create('div', 'leaflet-control-browser-print leaflet-bar leaflet-control');
		L.DomEvent.disableClickPropagation(container);

		this._appendControlStyles(container);

		L.DomEvent.addListener(container, 'mouseover', this._displayPageSizeButtons, this);
		L.DomEvent.addListener(container, 'mouseout', this._hidePageSizeButtons, this);

		if (this.options.position.indexOf("left") > 0) {
			this._createIcon(container);
			this._createMenu(container);
		} else {
			this._createMenu(container);
			this._createIcon(container);
		}

		setTimeout( function () {
			container.className += parseInt(L.version) ? " v1" : " v0-7"; // parseInt(L.version) returns 1 for v1.0.3 and 0 for 0.7.7;
		}, 10);

		map.printControl = this; // Make control available from the map object itself;
		return container;
	},

	_createIcon: function (container) {
		var icon = L.DomUtil.create('a', '', container);
		this.link = icon;
		this.link.id = "leaflet-browser-print";
		this.link.title = this.options.title;
		return this.link;
	},

	_createMenu: function (container) {
		this.holder = L.DomUtil.create('ul', 'browser-print-holder', container);

		var domPrintModes = [];

		for (var i = 0; i < this.options.printModes.length; i++) {
			var mode = this.options.printModes[i];
			var normalizedName = mode[0].toUpperCase() + mode.substring(1).toLowerCase();

			if (this["_print" + normalizedName]) {
				var domMode = L.DomUtil.create('li', 'browser-print-mode', this.holder);

				if (this.options.printModesNames && this.options.printModesNames[normalizedName]) {
					domMode.innerHTML = this.options.printModesNames[normalizedName];
				} else {
					domMode.innerHTML = normalizedName;
				}

				L.DomEvent.addListener(domMode, 'click', this["_print" + normalizedName], this);

				domPrintModes.push(domMode);
			}
		}

		this.options.printModes = domPrintModes;
	},

    _displayPageSizeButtons: function() {
		if (this.options.position.indexOf("left") > 0) {
	        this.link.style.borderTopRightRadius = "0px";
	    	this.link.style.borderBottomRightRadius = "0px";
		} else {
			this.link.style.borderTopLeftRadius = "0px";
	    	this.link.style.borderBottomLeftRadius = "0px";
		}

		this.options.printModes.forEach(function(mode){
			mode.style.display = "inline-block";
		});
    },

    _hidePageSizeButtons: function (){
		if (this.options.position.indexOf("left") > 0) {
	    	this.link.style.borderTopRightRadius = "";
	    	this.link.style.borderBottomRightRadius = "";
		} else {
	    	this.link.style.borderTopLeftRadius = "";
	    	this.link.style.borderBottomLeftRadius = "";
		}

		this.options.printModes.forEach(function(mode){
			mode.style.display = "";
		});
    },

    _printLandscape: function () {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--landscape");
        this._print("Landscape");
    },

    _printPortrait: function () {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--portrait");
        this._print("Portrait");
    },

    _printAuto: function () {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--auto");

		var autoBounds = this._getBoundsForAllVisualLayers();
		this._print(this._getPageSizeFromBounds(autoBounds), autoBounds);
    },

    _printCustom: function () {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--custom");
		this._map.on('mousedown', this._startAutoPoligon, this);
    },

	_addPrintClassToContainer: function (map, printClassName) {
		var container = map.getContainer();

		if (container.className.indexOf(printClassName) === -1) {
			container.className += " " + printClassName;
		}
	},

	_removePrintClassFromContainer: function (map, printClassName) {
		var container = map.getContainer();

		if (container.className && container.className.indexOf(printClassName) > -1) {
			container.className = container.className.replace(" " + printClassName, "");
		}
	},

	_startAutoPoligon: function (e) {
		e.originalEvent.preventDefault();
		e.originalEvent.stopPropagation();

		this._map.dragging.disable();

		this.options.custom = { start: e.latlng };

		this._map.off('mousedown', this._startAutoPoligon, this);

		this._map.on('mousemove', this._moveAutoPoligon, this);
		this._map.on('mouseup', this._endAutoPoligon, this);
	},

	_moveAutoPoligon: function (e) {
		if (this.options.custom) {
			e.originalEvent.preventDefault();
			e.originalEvent.stopPropagation();
			if (this.options.custom.rectangle) {
				this.options.custom.rectangle.setBounds(L.latLngBounds(this.options.custom.start, e.latlng));
			} else {
				this.options.custom.rectangle = L.rectangle([this.options.custom.start, e.latlng], { color: "gray", dashArray: '5, 10' });
				this.options.custom.rectangle.addTo(this._map);
			}
		}
	},

	_endAutoPoligon: function (e) {

		e.originalEvent.preventDefault();
		e.originalEvent.stopPropagation();

		this._map.off('mousemove', this._moveAutoPoligon, this);
		this._map.off('mouseup', this._endAutoPoligon, this);

		this._map.dragging.enable();

		if (this.options.custom && this.options.custom.rectangle) {
			var autoBounds = this.options.custom.rectangle.getBounds();

			this._map.removeLayer(this.options.custom.rectangle);
			this.options.custom = undefined;

			this._print(this._getPageSizeFromBounds(autoBounds), autoBounds);
		} else {
			this._clearPrint();
		}
	},

	_getPageSizeFromBounds: function(bounds) {
		var height = Math.abs(bounds.getNorth() - bounds.getSouth());
		var width = Math.abs(bounds.getEast() - bounds.getWest());
		if (height > width) {
			return "Portrait";
		} else {
			return "Landscape";
		}
	},

    _setupMapSize: function (mapContainer, printSize) {
        switch (printSize) {
            case "Landscape":
                mapContainer.style.width = "1040px";
                mapContainer.style.height = "715px";
                break;
            default:
            case "Portrait":
                mapContainer.style.width = "715px";
                mapContainer.style.height = "1040px";
                break;
        }
    },

    _print: function (printSize, autoBounds) {
		var self = this;
        var mapContainer = this._map.getContainer();

        var origins = {
            bounds: this._map.getBounds(),
            width: mapContainer.style.width,
            height: mapContainer.style.height,
			printLayer: L.browserPrintUtils.cloneLayer(this._validatePrintLayer())
        };

		this._map.fire("browser-pre-print", { printObjects: this._getPrintObjects() });

		var overlay = this._addPrintMapOverlay(this._map, printSize, origins);

		this._map.fire("browser-print-start", { printLayer: origins.printLayer, printMap: overlay.map, printObjects: overlay.objects });

		overlay.map.fitBounds(autoBounds || origins.bounds);

		overlay.map.invalidateSize({reset: true, animate: false, pan: false});

		var interval = setInterval(function(){
			if (!overlay.map.isLoading()) {
				clearInterval(interval);
				self._completePrinting(overlay.map, origins.printLayer, overlay.objects);
			}
		}, 50);
    },

	_completePrinting: function (overlayMap, printLayer, printObjects) {
		var self = this;
		setTimeout(function(){
			self._map.fire("browser-print", { printLayer: printLayer, printMap: overlayMap, printObjects: printObjects });
			window.print();
			self._printEnd(overlayMap, printLayer, printObjects);
		}, 1000);
	},

    _getBoundsForAllVisualLayers: function () {
	    var fitBounds = null;

        // Getting all layers without URL -> not tiles.
        for (var layerId in this._map._layers){
            var layer = this._map._layers[layerId];
            if (!layer._url) {
                if (fitBounds) {
                    if (layer.getBounds) {
                        fitBounds.extend(layer.getBounds());
                    } else if(layer.getLatLng){
                        fitBounds.extend(layer.getLatLng());
                    }
                } else {
                    if (layer.getBounds) {
                        fitBounds = layer.getBounds();
                    } else if(layer.getLatLng){
                        fitBounds = L.latLngBounds(layer.getLatLng(), layer.getLatLng());
                    }
                }
            }
        }

		return fitBounds;
    },

	_clearPrint: function () {
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--landscape");
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--portrait");
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--auto");
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--custom");
	},

    _printEnd: function (overlayMap, printLayer, printObjects, printCss) {
		this._clearPrint();

		var overlay = document.getElementById("leaflet-print-overlay");
		document.body.removeChild(overlay);

		document.body.className = document.body.className.replace(" leaflet--printing", "");

		this._map.invalidateSize({reset: true, animate: false, pan: false});
		this._map.fire("browser-print-end", { printLayer: printLayer, printMap: overlayMap, printObjects: printObjects });
    },

    _validatePrintLayer: function() {
			var visualLayerForPrinting = null;

        if (this.options.printLayer) {
					visualLayerForPrinting = this.options.printLayer;
        } else {
            for (var id in this._map._layers){
                var pLayer = this._map._layers[id];
                if (pLayer._url) {
                    visualLayerForPrinting = pLayer;
                }
            }
		}

		return visualLayerForPrinting;
    },

	_getPrintObjects: function() {
		var printObjects = {};
		for (var id in this._map._layers){
			var pLayer = this._map._layers[id];
			if (!pLayer._url) {
				var type = L.browserPrintUtils.getType(pLayer);
				if (type) {
					if (!printObjects[type]) {
						printObjects[type] = [];
					}
					printObjects[type].push(pLayer);
				}
			}
		}

		return printObjects;
	},

    _addPrintCss: function (printSize) {

        var printStyleSheet = document.createElement('style');
		printStyleSheet.id = "leaflet-browser-print-css";
        printStyleSheet.setAttribute('type', 'text/css');
		printStyleSheet.innerHTML = '@media print { .leaflet-control-container > .leaflet-bottom.leaflet-left, .leaflet-control-container > .leaflet-top.leaflet-left, .leaflet-control-container > .leaflet-top.leaflet-right { display: none!important; } }';
		printStyleSheet.innerHTML += ' @media print { .leaflet-popup-content-wrapper, .leaflet-popup-tip { box-shadow: none; }';
		printStyleSheet.innerHTML += ' * { -webkit-print-color-adjust: exact!important; }';

        switch (printSize) {
            case "Landscape":
                printStyleSheet.innerText += "@media print { @page { size : landscape; }}";
                break;
            default:
            case "Portrait":
                printStyleSheet.innerText += "@media print { @page { size : portrait; }}";
                break;
        }

        return printStyleSheet;
    },

	_appendControlStyles:  function (container) {
		var printControlStyleSheet = document.createElement('style');
		printControlStyleSheet.setAttribute('type', 'text/css');

		printControlStyleSheet.innerHTML += " .leaflet-control-browser-print { display: flex; } .leaflet-control-browser-print a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gcCCi8Vjp+aNAAAAGhJREFUOMvFksENgDAMA68RC7BBN+Cf/ZU33QAmYAT6BolAGxB+RrrIsg1BpfNBVXcPMLMDI/ytpKozMHWwK7BJJ7yYWQbGdBea9wTIkRDzKy0MT7r2NiJACRgotCzxykFI34QY2Ea7KmtxGJ+uX4wfAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 4px; }";

		printControlStyleSheet.innerHTML += " .v0-7.leaflet-control-browser-print a#leaflet-browser-print { width: 26px; height: 26px; } .v1.leaflet-control-browser-print a#leaflet-browser-print { background-position-x: 7px; }";
		printControlStyleSheet.innerHTML += " .browser-print-holder { margin: 0px; padding: 0px; list-style: none; white-space: nowrap; } .browser-print-holder-left li:last-child { border-top-right-radius: 2px; border-bottom-right-radius: 2px; } .browser-print-holder-right li:first-child { border-top-left-radius: 2px; border-bottom-left-radius: 2px; }";
		printControlStyleSheet.innerHTML += " .browser-print-mode { display: none; background-color: #919187; color: #FFF; font: 11px/19px 'Helvetica Neue', Arial, Helvetica, sans-serif; text-decoration: none; padding: 4px 10px; text-align: center; } .v1 .browser-print-mode { padding: 6px 10px; } .browser-print-mode:hover { background-color: #757570; cursor: pointer; }";
		printControlStyleSheet.innerHTML += " .leaflet-browser-print--custom, .leaflet-browser-print--custom path { cursor: crosshair!important; }";
		printControlStyleSheet.innerHTML += " .leaflet-print-overlay { width: 100%; height: 100%; position: absolute; top: 0; background-color: white!important; left: 0; z-index: 1001; display: block!important; } ";
		printControlStyleSheet.innerHTML += " .leaflet--printing { overflow: hidden!important; margin: 0px!important; padding: 0px!important; } body.leaflet--printing > * { display: none; }";
		printControlStyleSheet.innerHTML += " .grid-print-container { grid-template: 1fr / 1fr; } .grid-map-print { grid-row: 1; grid-column: 1; } body.leaflet--printing [leaflet-browser-print-content]:not(style) { display: unset!important; }";

        container.appendChild(printControlStyleSheet);
	},

	_addPrintMapOverlay: function (map, printSize, origins) {
		var overlay = document.createElement("div");
		overlay.id = "leaflet-print-overlay";
		overlay.className = map.getContainer().className + " leaflet-print-overlay";
		document.body.appendChild(overlay);

		overlay.appendChild(this._addPrintCss(printSize));

		var gridContainer = document.createElement("div");
		gridContainer.id = "grid-print-container";
		gridContainer.className = "grid-print-container";
		gridContainer.style.width = origins.width;
		gridContainer.style.height = origins.height;
		gridContainer.style.display = "grid";

		this._setupMapSize(gridContainer, printSize);

		if (this.options.contentSelector) {
			var content = document.querySelectorAll(this.options.contentSelector);
			if (content && content.length) {
				for (var i = 0; i < content.length; i++) {
					var printContentItem = content[i].cloneNode(true);
					gridContainer.appendChild(printContentItem);
				}
			}
		}

		overlay.appendChild(gridContainer);

		var overlayMapDom = document.createElement("div");
		overlayMapDom.id = map.getContainer().id + "-print";
		overlayMapDom.className = "grid-map-print";
		overlayMapDom.style.width = "100%";
		overlayMapDom.style.height = "100%";
		gridContainer.appendChild(overlayMapDom);

		document.body.className += " leaflet--printing";

		return this._setupPrintMap(overlayMapDom.id, L.browserPrintUtils.cloneBasicOptionsWithoutLayers(map.options), origins.printLayer, map._layers);
	},

	_setupPrintMap: function (id, options, printLayer, allLayers, map) {
		options.zoomControl = false;
		var overlayMap = L.map(id, options);
		var printObjects = {};

		printLayer.addTo(overlayMap);

		for (var layerId in allLayers){
			var pLayer = allLayers[layerId];
			if (!pLayer._url) {
				var clone = L.browserPrintUtils.cloneLayer(pLayer, map);

				if (clone) {

					/* Workaround for propriate handling of popups. */
					if (pLayer instanceof L.Popup){
						if(!pLayer.isOpen) {
							pLayer.isOpen = function () { return this._isOpen; };
						}
						if (pLayer.isOpen() && !this.options.closePopupsOnPrint) {
							clone.openOn(overlayMap);
						}
					} else {
						clone.addTo(overlayMap);
					}

					var type = L.browserPrintUtils.getType(clone);
					if (!printObjects[type]) {
						printObjects[type] = [];
					}
					printObjects[type].push(clone);
				}
			}
		}

		if (!overlayMap.isLoading) {
			if (L.version == "1.2.0") {
				var self = this;
				overlayMap.isLoading = function () { return self._getLoadingLayers(this); }; // Get all layers that is tile layers and is still loading;
			} else {
				overlayMap.isLoading = function () { return this._tilesToLoad || this._tileLayersToLoad; };
			}
		}

		return {map: overlayMap, objects: printObjects};
	},

	_getLoadingLayers: function(map) {
		for (var l in map._layers) {
			var layer = map._layers[l];
			if (layer._url && layer._loading) {
				return true;
			}
		}

		return false;
	}
});

L.control.browserPrint = function(options) {

	if (options && options.printModes && (!options.printModes.filter || !options.printModes.length)) {
		throw "Please specify valid print modes for Print action. Example: printModes: ['Portrait', 'Landscape', 'Auto', 'Custom']";
	}

	return new L.Control.BrowserPrint(options);
};
