/*!
 * 
 *  leaflet.browser.print - v0.5.14 (https://github.com/Igor-Vladyka/leaflet.browser.print) 
 *  A leaflet plugin which allows users to print the map directly from the browser
 *  
 *  MIT (http://www.opensource.org/licenses/mit-license.php)
 *  (c) 2018  Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/)
 * 
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.Control.BrowserPrint = L.Control.extend({
	options: {
		title: 'Print map',
		documentTitle: '',
		position: 'topleft',
        printLayer: null,
		printModes: ["Portrait", "Landscape", "Auto", "Custom"],
		printModesNames: {Portrait: "Portrait", Landscape: "Landscape", Auto: "Auto", Custom: "Custom"},
		closePopupsOnPrint: true,
		contentSelector: "[leaflet-browser-print-content]",
		pagesSelector: "[leaflet-browser-print-pages]",
		manualMode: false,
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
		if (this.options.title) {
			this.link.title = this.options.title;
		}
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

	_setupPrintPagesWidth: function(pagesContainer, printSize) {
		switch (printSize) {
			case "Landscape":
				pagesContainer.style.width = "1040px";
				break;
			default:
			case "Portrait":
				pagesContainer.style.width = "715px";
				break;
		}
	},

	_setupPrintMapHeight: function(mapContainer, printSize) {
		switch (printSize) {
			case "Landscape":
				mapContainer.style.height = "715px";
				break;
			default:
			case "Portrait":
				mapContainer.style.height = "1040px";
				break;
		}
	},

	/* Intended to cancel next printing*/
	cancel: function(cancelNextPrinting){
		this.cancelNextPrinting = cancelNextPrinting;
	},

	print: function(printSize, autoBounds) {
		if (printSize == "Landscape" || printSize == "Portrait") {
			this._print(printSize, autoBounds);
		}
	},

    _print: function (printSize, autoBounds) {
		var self = this;
        var mapContainer = this._map.getContainer();

        var origins = {
            bounds: autoBounds || this._map.getBounds(),
            width: mapContainer.style.width,
            height: mapContainer.style.height,
			documentTitle: document.title,
			printLayer: L.Control.BrowserPrint.Utils.cloneLayer(this.options.printLayer),
			panes: []
        };

		var mapPanes = this._map.getPanes();
		for (var pane in mapPanes) {
			origins.panes.push({name: pane, container: undefined});
		}

		origins.printObjects = this._getPrintObjects(origins.printLayer);

		this._map.fire(L.Control.BrowserPrint.Event.PrePrint, { printLayer: origins.printLayer, printObjects: origins.printObjects, pageSize: printSize, pageBounds: origins.bounds});

		if (this.cancelNextPrinting) {
			delete this.cancelNextPrinting;
			return;
		}

		var overlay = this._addPrintMapOverlay(printSize, origins);

		if (this.options.documentTitle) {
			document.title = this.options.documentTitle;
		}

		this._map.fire(L.Control.BrowserPrint.Event.PrintStart, { printLayer: origins.printLayer, printMap: overlay.map, printObjects: overlay.objects });

		overlay.map.fitBounds(origins.bounds);

		overlay.map.invalidateSize({reset: true, animate: false, pan: false});

		var interval = setInterval(function(){
			if (!self._isTilesLoading(overlay.map)) {
				clearInterval(interval);
				if (self.options.manualMode) {
					self._setupManualPrintButton(overlay.map, origins, overlay.objects);
				} else {
					self._completePrinting(overlay.map, origins, overlay.objects);
				}
			}
		}, 50);
    },

	_completePrinting: function (overlayMap, origins, printObjects) {
		var self = this;
		setTimeout(function(){
			self._map.fire(L.Control.BrowserPrint.Event.Print, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });
			window.print();
			self._printEnd(origins);
			self._map.fire(L.Control.BrowserPrint.Event.PrintEnd, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });
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

    _printEnd: function (origins) {
		this._clearPrint();

		var overlay = document.getElementById("leaflet-print-overlay");
		document.body.removeChild(overlay);

		document.body.className = document.body.className.replace(" leaflet--printing", "");
		if (this.options.documentTitle) {
			document.title = origins.documentTitle;
		}

		this._map.invalidateSize({reset: true, animate: false, pan: false});
    },

    /*_validatePrintLayer: function() {
		var visualLayerForPrinting = null;

        if (this.options.printLayer) {
			visualLayerForPrinting = this.options.printLayer;
        } else {
            for (var id in this._map._layers){
                var pLayer = this._map._layers[id];
                if (pLayer._url) {
                    visualLayerForPrinting = pLayer;
					break;
                }
            }
		}

		return visualLayerForPrinting;
    },*/

	_getPrintObjects: function(printLayer) {
		var printObjects = {};
		for (var id in this._map._layers){
			var pLayer = this._map._layers[id];
			if (!printLayer || !pLayer._url || printLayer._url !== pLayer._url) {
				var type = L.Control.BrowserPrint.Utils.getType(pLayer);
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
		printStyleSheet.innerHTML += ' @media print { .leaflet-popup-content-wrapper, .leaflet-popup-tip { box-shadow: none; }';
		printStyleSheet.innerHTML += ' @media print { #leaflet-browser-print--manualMode-button { display: none; }';
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
		printControlStyleSheet.innerHTML += " .leaflet-print-overlay { width: 100%; height:auto; min-height: 100%; position: absolute; top: 0; background-color: white!important; left: 0; z-index: 1001; display: block!important; } ";
		printControlStyleSheet.innerHTML += " .leaflet--printing { height:auto; min-height: 100%; margin: 0px!important; padding: 0px!important; } body.leaflet--printing > * { display: none; }";
		printControlStyleSheet.innerHTML += " .grid-print-container { grid-template: 1fr / 1fr; box-sizing: border-box; } .grid-map-print { grid-row: 1; grid-column: 1; } body.leaflet--printing .grid-print-container [leaflet-browser-print-content]:not(style) { display: unset!important; }";
		printControlStyleSheet.innerHTML += " .pages-print-container { box-sizing: border-box; }";

        container.appendChild(printControlStyleSheet);
	},

	_setupManualPrintButton: function(map, origins, objects) {
		var manualPrintButton = document.createElement('button');
		manualPrintButton.id = "leaflet-browser-print--manualMode-button";
		manualPrintButton.innerHTML = "Print";
		manualPrintButton.style.position = "absolute";
		manualPrintButton.style.top = "20px";
		manualPrintButton.style.right = "20px";
		document.querySelector("#leaflet-print-overlay").appendChild(manualPrintButton);

		var self = this;
		L.DomEvent.addListener(manualPrintButton, 'click', function () {
			self._completePrinting(map, origins, objects);
		});
	},

	_addPrintMapOverlay: function (printSize, origins) {
		var overlay = document.createElement("div");
		overlay.id = "leaflet-print-overlay";
		overlay.className = this._map.getContainer().className + " leaflet-print-overlay";
		document.body.appendChild(overlay);

		overlay.appendChild(this._addPrintCss(printSize));

		var gridContainer = document.createElement("div");
		gridContainer.id = "grid-print-container";
		gridContainer.className = "grid-print-container";
		gridContainer.style.width = "100%";
		gridContainer.style.display = "grid";
		this._setupPrintMapHeight(gridContainer, printSize);

		if (this.options.contentSelector) {
			var content = document.querySelectorAll(this.options.contentSelector);
			if (content && content.length) {
				for (var i = 0; i < content.length; i++) {
					var printContentItem = content[i].cloneNode(true);
					gridContainer.appendChild(printContentItem);
				}
			}
		}

		var isMultipage = this.options.pagesSelector && document.querySelectorAll(this.options.pagesSelector).length;
		if (isMultipage) {
			var pagesContainer = document.createElement("div");
			pagesContainer.id = "pages-print-container";
			pagesContainer.className = "pages-print-container";
			pagesContainer.style.margin = "0!important";
			this._setupPrintPagesWidth(pagesContainer, printSize);

			overlay.appendChild(pagesContainer);
			pagesContainer.appendChild(gridContainer);

			var pages = document.querySelectorAll(this.options.pagesSelector);
			if (pages && pages.length) {
				for (var i = 0; i < pages.length; i++) {
					var printPageItem = pages[i].cloneNode(true);
					pagesContainer.appendChild(printPageItem);
				}
			}
		} else {
			this._setupPrintPagesWidth(gridContainer, printSize);
			overlay.appendChild(gridContainer);
		}

		var overlayMapDom = document.createElement("div");
		overlayMapDom.id = this._map.getContainer().id + "-print";
		overlayMapDom.className = "grid-map-print";
		overlayMapDom.style.width = "100%";
		overlayMapDom.style.height = "100%";
		gridContainer.appendChild(overlayMapDom);

		document.body.className += " leaflet--printing";

		return this._setupPrintMap(overlayMapDom.id, L.Control.BrowserPrint.Utils.cloneBasicOptionsWithoutLayers(this._map.options), origins.printLayer, origins.printObjects, origins.panes);
	},

	_setupPrintMap: function (id, options, printLayer, printObjects, panes) {
		options.zoomControl = false;
		var overlayMap = L.map(id, options);

		if (printLayer) {
			printLayer.addTo(overlayMap);
		}

		panes.forEach(function(p) { overlayMap.createPane(p.name, p.container); });

		for (var type in printObjects){
			var closePopupsOnPrint = this.options.closePopupsOnPrint;
			printObjects[type] = printObjects[type].map(function(pLayer){
				var clone = L.Control.BrowserPrint.Utils.cloneLayer(pLayer);

				if (clone) {
					/* Workaround for apropriate handling of popups. */
					if (pLayer instanceof L.Popup){
						if(!pLayer.isOpen) {
							pLayer.isOpen = function () { return this._isOpen; };
						}
						if (pLayer.isOpen() && !closePopupsOnPrint) {
							clone.openOn(overlayMap);
						}
					} else {
						clone.addTo(overlayMap);
					}

					if (pLayer instanceof L.Layer) {
						var tooltip = pLayer.getTooltip();
						if (tooltip) {
							clone.bindTooltip(tooltip.getContent(), tooltip.options);
							if (pLayer.isTooltipOpen()) {
								clone.openTooltip(tooltip.getLatLng());
							}
						}
					}

					return clone;
				}
			});
		}

		return {map: overlayMap, objects: printObjects};
	},

	// Get all layers that is tile layers and is still loading;
	_isTilesLoading: function(overlayMap){
		var isLoading = false;
		var mapMajorVersion = parseFloat(L.version);
		if (mapMajorVersion > 1) {
			isLoading = this._getLoadingLayers(overlayMap);
		} else {
			isLoading = overlayMap._tilesToLoad || overlayMap._tileLayersToLoad;
		}

		return isLoading;
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

L.Control.BrowserPrint.Event =  {
	PrePrint: 'browser-pre-print',
	PrintStart: 'browser-print-start',
	Print: 'browser-print',
	PrintEnd: 'browser-print-end'
},

L.control.browserPrint = function(options) {

	if (options && options.printModes && (!options.printModes.filter || !options.printModes.length)) {
		throw "Please specify valid print modes for Print action. Example: printModes: ['Portrait', 'Landscape', 'Auto', 'Custom']";
	}

	return new L.Control.BrowserPrint(options);
};

L.browserPrint = function(options) {
	console.log("L.browserPrint(options) is obsolete and will be removed shortly, please use L.control.browserPrint(options) instead.");
	return L.control.browserPrint(options);
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.Control.BrowserPrint.Utils = {
	cloneOptions: function(options) {
		var utils = this;
	    var retOptions = {};
	    for (var name in options) {
	        var item = options[name];
			if (item && item.clone) {
				retOptions[name] = item.clone();
			} else if (item && item.onAdd) {
				retOptions[name] = utils.cloneLayer(item);
			} else {
				retOptions[name] = item;
			}
	    }
	    return retOptions;
	},

	cloneBasicOptionsWithoutLayers: function(options) {
	    var retOptions = {};
		var optionNames = Object.getOwnPropertyNames(options);
		if (optionNames.length) {
			for (var i = 0; i < optionNames.length; i++) {
				var optName = optionNames[i];
				if (optName && optName != "layers") {
			        retOptions[optName] = options[optName];
				}
			}

		    return this.cloneOptions(retOptions);
		}

		return retOptions;
	},

	cloneLayer: function(layer) {
		if (!layer) return null;

		var utils = this;
		
		var options = layer.options;

		// Renderers
		if (L.SVG && layer instanceof L.SVG) {
		   return L.svg(options);
		}

		if (L.Canvas && layer instanceof L.Canvas) {
		   return L.canvas(options);
		}

		// Tile layers
		if (L.TileLayer.WMS && layer instanceof L.TileLayer.WMS) {
			  return L.tileLayer.wms(layer._url, options);
		}

		if (layer instanceof L.TileLayer) {
		   return L.tileLayer(layer._url, options);
		}

		if (layer instanceof L.ImageOverlay) {
		   return L.imageOverlay(layer._url, layer._bounds, options);
		}

		// Marker layers
		if (layer instanceof L.Marker) {
		   return L.marker(layer.getLatLng(), options);
		}

		if (layer instanceof L.Popup){
			return L.popup(options).setLatLng(layer.getLatLng()).setContent(layer.getContent());
		}

		if (layer instanceof L.Circle) {
		   return L.circle(layer.getLatLng(), layer.getRadius(), options);
		}

		if (layer instanceof L.CircleMarker) {
		   return L.circleMarker(layer.getLatLng(), options);
		}

		if (layer instanceof L.Rectangle) {
		   return L.rectangle(layer.getBounds(), options);
		}

		if (layer instanceof L.Polygon) {
		   return L.polygon(layer.getLatLngs(), options);
		}

		// MultiPolyline is removed in leaflet 1.0.0
		if (L.MultiPolyline && layer instanceof L.MultiPolyline) {
			return L.polyline(layer.getLatLngs(), options);
		}

		// MultiPolygon is removed in leaflet 1.0.0
		if (L.MultiPolygon && layer instanceof L.MultiPolygon) {
			return L.multiPolygon(layer.getLatLngs(), options);
		}

		if (layer instanceof L.Polyline) {
		   return L.polyline(layer.getLatLngs(), options);
		}

		if (layer instanceof L.GeoJSON) {
		   return L.geoJson(layer.toGeoJSON(), options);
		}

		if (layer instanceof L.FeatureGroup) {
		   return L.featureGroup(utils.cloneInnerLayers(layer));
		}

		if (layer instanceof L.LayerGroup) {
		   return L.layerGroup(utils.cloneInnerLayers(layer));
		}

		if (layer instanceof L.Tooltip) {
            return null;// There is no point to clone tooltips here;  L.tooltip(options);
        }

		console.info('Unknown layer, cannot clone this layer. Leaflet-version: ' + L.version);

		return null;
   },

   getType: function(layer) {
	   if (L.SVG && layer instanceof L.SVG) { return "L.SVG"; } // Renderer
	   if (L.Canvas && layer instanceof L.Canvas) { return "L.Canvas"; } // Renderer
	   if (layer instanceof L.TileLayer.WMS) { return "L.TileLayer.WMS"; } // WMS layers
	   if (layer instanceof L.TileLayer) { return "L.TileLayer"; } // Tile layers
	   if (layer instanceof L.ImageOverlay) { return "L.ImageOverlay"; }
	   if (layer instanceof L.Marker) { return "L.Marker"; }
	   if (layer instanceof L.Popup) { return "L.Popup"; }
	   if (layer instanceof L.Circle) { return "L.Circle"; }
	   if (layer instanceof L.CircleMarker) { return "L.CircleMarker"; }
	   if (layer instanceof L.Rectangle) { return "L.Rectangle"; }
	   if (layer instanceof L.Polygon) { return "L.Polygon"; }
	   if (L.MultiPolyline && layer instanceof L.MultiPolyline) { return "L.MultiPolyline"; } // MultiPolyline is removed in leaflet 1.0.0
	   if (L.MultiPolygon && layer instanceof L.MultiPolygon) { return "L.MultiPolygon"; } // MultiPolygon is removed in leaflet 1.0.0
	   if (layer instanceof L.Polyline) { return "L.Polyline"; }
	   if (layer instanceof L.GeoJSON) { return "L.GeoJSON"; }
	   if (layer instanceof L.FeatureGroup) { return "L.FeatureGroup"; }
	   if (layer instanceof L.LayerGroup) { return "L.LayerGroup"; }
	   if (layer instanceof L.Tooltip) { return "L.Tooltip"; }
	   return null;
   },

	cloneInnerLayers: function (layer) {
		var utils = this;
		var layers = [];

		layer.eachLayer(function (inner) {
			var l = utils.cloneLayer(inner);

			if (l) {
				layers.push(l);
			}
		});

		return layers;
	}
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
module.exports = __webpack_require__(1);


/***/ })
/******/ ]);