/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.BrowserPrint = L.Class.extend({
	options: {
		documentTitle: '',
		printLayer: null,
		closePopupsOnPrint: true,
		contentSelector: "[leaflet-browser-print-content]",
		pagesSelector: "[leaflet-browser-print-pages]",
		manualMode: false,
		customPrintStyle: { color: "gray", dashArray: '5, 10', pane: "customPrintPane" },
		cancelWithEsc: true,
		printFunction: window.print,
		debug: false
	},
	initialize: function(map, options){
		this._map = map;
		L.setOptions(this,options);

		if (this.options.customPrintStyle.pane && !map.getPane(this.options.customPrintStyle.pane)) {
			map.createPane(this.options.customPrintStyle.pane).style.zIndex = 9999;
		}

		if(!document.getElementById('browser-print-css')) {
			this._appendControlStyles(document.head);
		}
	},
	cancel: function(){
		this._printCancel();
	},
	print: function(pageMode) {
		pageMode.options.action(this, pageMode)(pageMode);
	},

	_getMode: function(expectedOrientation, mode) {
		return new L.BrowserPrint.Mode(expectedOrientation, mode.options);
	},

	_printLandscape: function (mode) {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--landscape");
		this._print(mode);
	},

	_printPortrait: function (mode) {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--portrait");
		this._print(mode);
	},

	_printAuto: function (mode) {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--auto");

		var autoBounds = this._getBoundsForAllVisualLayers();
		var orientation;
		if(mode.options.orientation === "Portrait" || mode.options.orientation === "Landscape" ){
			orientation = mode.options.orientation;
		}else {
			orientation = this._getPageSizeFromBounds(autoBounds);
		}
		this._print(this._getMode(orientation, mode), autoBounds);
	},

	_printCustom: function (mode, options) {
		this._addPrintClassToContainer(this._map, "leaflet-browser-print--custom");
		this.options.custom = { mode: mode, options: options};
		this._map.on('mousedown', this._startAutoPolygon, this);
		L.DomEvent.on(this._map._container, 'touchstart', this._startAutoPolygon, this);
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

	_startAutoPolygon: function (e) {
		L.DomEvent.stop(e);

		this._map.dragging.disable();

		let latlng;
		if(e.type === 'touchstart'){
            const p1 = this._map.mouseEventToContainerPoint(e.touches[0]);
            latlng = this._map.containerPointToLatLng(p1);
        } else {
		    latlng = e.latlng
        }

		this.options.custom.start = latlng;

		this._map.getPane(this.options.customPrintStyle.pane).style.display = "initial";

		this._map.off('mousedown', this._startAutoPolygon, this);
        L.DomEvent.off(this._map._container, 'touchstart', this._startAutoPolygon, this);
		this._map.on('mousemove', this._moveAutoPolygon, this);
		this._map.on('mouseup', this._endAutoPolygon, this);
        L.DomEvent.on(this._map._container, 'touchmove', this._moveAutoPolygon, this);
        L.DomEvent.on(this._map._container, 'touchend', this._endAutoPolygon, this);
	},

	_moveAutoPolygon: function (e) {
		if (this.options.custom) {
			L.DomEvent.stop(e);

			let latlng;
            if(e.type === 'touchmove'){
                const p1 = this._map.mouseEventToContainerPoint(e.touches[0]);
                latlng = this._map.containerPointToLatLng(p1);
            } else {
                latlng = e.latlng
            }

			if (this.options.custom.rectangle) {
				this.options.custom.rectangle.setBounds(L.latLngBounds(this.options.custom.start, latlng));
			} else {
				this.options.custom.rectangle = L.rectangle([this.options.custom.start, latlng], this.options.customPrintStyle);
			}
			this.options.custom.rectangle.addTo(this._map);
		}
	},

	_endAutoPolygon: function (e) {
		L.DomEvent.stop(e);
		this._removeAutoPolygon();

		if (this.options.custom && this.options.custom.rectangle) {
			var autoBounds = this.options.custom.rectangle.getBounds();

			this._map.removeLayer(this.options.custom.rectangle);

			var orientation;
			if(this.options.custom.mode.options.orientation === "Portrait" || this.options.custom.mode.options.orientation === "Landscape" ){
				orientation = this.options.custom.mode.options.orientation;
			}else {
				orientation = this._getPageSizeFromBounds(autoBounds);
			}
			this._print(this._getMode(orientation, this.options.custom.mode), autoBounds);

			delete this.options.custom;
		} else {
			this._clearPrint();
            this._map.isPrinting = false;
		}
	},
	_removeAutoPolygon: function(){

		this._map.off('mousedown', this._startAutoPolygon, this);
		this._map.off('mousemove', this._moveAutoPolygon, this);
		this._map.off('mouseup', this._endAutoPolygon, this);

        L.DomEvent.off(this._map._container, 'touchstart', this._startAutoPolygon, this);
        L.DomEvent.off(this._map._container, 'touchmove', this._moveAutoPolygon, this);
        L.DomEvent.off(this._map._container, 'touchend', this._endAutoPolygon, this);

		this._map.dragging.enable();

		// we hide the pane because it destorys sometimes interactions with layers if printing is finished
		this._map.getPane(this.options.customPrintStyle.pane).style.display = "none";
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

	_setupPrintPagesWidth: function(pagesContainer, size, pageOrientation) {
		pagesContainer.style.width = pageOrientation === "Landscape" ? size.Height : size.Width;
	},

	_setupPrintMapHeight: function(mapContainer, size, pageOrientation, options) {
		var header = options.header && options.header.enabled && options.header.size && !options.header.overTheMap ? options.header.size+" - 1mm" : "0mm";
		var footer = options.footer && options.footer.enabled && options.footer.size && !options.footer.overTheMap ? options.footer.size+" - 1mm" : "0mm";

		mapContainer.style.height =  "calc("+(pageOrientation === "Landscape" ? size.Width : size.Height) + " - "+header+" - " +footer+ ")";
	},

	_printCancel: function() {
		clearInterval(self.printInterval);
		L.DomEvent.off(document,'keyup',this._keyUpCancel,this);
		var activeMode = this.activeMode;
		delete this.options.custom;
		this._removeAutoPolygon();
		this.activeMode = null;
		delete this.cancelNextPrinting;
		this._map.fire(L.BrowserPrint.Event.PrintCancel, { mode: activeMode });
		this._printEnd();
	},

	_keyUpCancel: function(e){
		if(e.which === 27){ //ESC
			this.cancel();
		}
	},

	_printMode: function(mode){
		if(this._map.isPrinting){
			console.error("printing is already active");
			return;
		}
		this._map.isPrinting = true;
		this.cancelNextPrinting = false;
		this.activeMode = mode;
		this['_print' + mode.mode](mode);
	},

	_print: function (printMode, autoBounds) {
		this._map.fire(L.BrowserPrint.Event.PrintInit, { mode: printMode });
		if(this.options.cancelWithEsc) {
			L.DomEvent.on(document, 'keyup', this._keyUpCancel, this);
		}
		L.BrowserPrint.Utils.initialize();

		var self = this;
		var mapContainer = this._map.getContainer();
		var options = printMode.options;
		var pageOrientation = options.orientation;

		var origins = {
			bounds: autoBounds || this._map.getBounds(),
			width: mapContainer.style.width,
			height: mapContainer.style.height,
			documentTitle: document.title,
			printLayer: L.BrowserPrint.Utils.cloneLayer(this.options.printLayer),
			panes: []
		};
		this._documentTitle = origins.documentTitle;

		var mapPanes = this._map.getPanes();
		for (var pane in mapPanes) {
			origins.panes.push({name: pane, container: undefined});
		}

		origins.printObjects = this._getPrintObjects(origins.printLayer);

		this._map.fire(L.BrowserPrint.Event.PrePrint, { printLayer: origins.printLayer, printObjects: origins.printObjects, pageOrientation, printMode: options.mode, pageBounds: origins.bounds});

		if (this.cancelNextPrinting) {
			this._printCancel();
			return;
		}

		var overlay = this._addPrintMapOverlay(printMode, pageOrientation, origins);

		if (this.options.documentTitle) {
			document.title = this.options.documentTitle;
		}

		this._map.fire(L.BrowserPrint.Event.PrintStart, { printLayer: origins.printLayer, printMap: overlay.map, printObjects: overlay.objects });

		if (options.invalidateBounds) {
			overlay.map.fitBounds(origins.bounds, overlay.map.options);
			overlay.map.invalidateSize({reset: true, animate: false, pan: false});
		} else {
			overlay.map.setView(this._map.getCenter(), this._map.getZoom());
		}

		if(options.zoom){
			overlay.map.setZoom(options.zoom);
		}else if(!options.enableZoom){
			overlay.map.setZoom(this._map.getZoom());
		}

		if(!this.options.debug) {
			this.printInterval = setInterval(function () {
				if (self.cancelNextPrinting || !self._map.isPrinting) {
					clearInterval(self.printInterval);
				} else if (self._map.isPrinting && !self._isTilesLoading(overlay.map)) {
					clearInterval(self.printInterval);
					if (self.options.manualMode) {
						self._setupManualPrintButton(overlay.map, origins, overlay.objects);
					} else {
						self._completePrinting(overlay.map, origins, overlay.objects);
					}
				}
			}, 50);
		}
	},

	_completePrinting: function (overlayMap, origins, printObjects) {
		var self = this;
		setTimeout(function(){
			if(!self._map.isPrinting){
				return;
			}
			self._map.fire(L.BrowserPrint.Event.Print, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });
			var printFunction = self.options.printFunction || window.print;
			var printPromise = printFunction();
			if (printPromise) {
				Promise.all([printPromise]).then(function(){
					self._printEnd(overlayMap, origins);
					self._map.fire(L.BrowserPrint.Event.PrintEnd, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });
				})
			} else {
				self._printEnd(overlayMap, origins);
				self._map.fire(L.BrowserPrint.Event.PrintEnd, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });
			}
		}, 1000);
	},

	_getBoundsForAllVisualLayers: function () {
		var fitBounds = null;

		// Getting all layers without URL -> not tiles.
		for (var layerId in this._map._layers){
			var layer = this._map._layers[layerId];
			if (!layer._url && !layer._mutant) {
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

		if (!fitBounds || !fitBounds._southWest) {
			fitBounds = this._map.getBounds();
		}

		return fitBounds;
	},

	_clearPrint: function () {
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--landscape");
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--portrait");
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--auto");
		this._removePrintClassFromContainer(this._map, "leaflet-browser-print--custom");
	},

	_printEnd: function (overlayMap, origins) {
		this._clearPrint();

		if (overlayMap) {
			overlayMap.remove();
			overlayMap = null;
		}

		if (this.__overlay__) {
			document.body.removeChild(this.__overlay__);
			this.__overlay__ = null;
		}

		document.body.className = document.body.className.replace(" leaflet--printing", "");
		if (this.options.documentTitle) {
			document.title = this._documentTitle;
		}

		this._map.invalidateSize({reset: true, animate: false, pan: false});
		this._map.isPrinting = false;
	},

	_getPrintObjects: function(printLayer) {
		var printObjects = {};
		for (var id in this._map._layers){
			var layer = this._map._layers[id];
			if (!printLayer || !layer._url || layer instanceof L.ImageOverlay || layer instanceof L.TileLayer.WMS) {
				var type = L.BrowserPrint.Utils.getType(layer);
				if (type) {
					if (!printObjects[type]) {
						printObjects[type] = [];
					}
					printObjects[type].push(layer);
				}
			}
		}

		return printObjects;
	},

	_addPrintCss: function (pageSize, pageMargin, pageOrientation) {

		var printStyleSheet = document.createElement('style');
		printStyleSheet.className = "leaflet-browser-print-css";
		printStyleSheet.setAttribute('type', 'text/css');
		printStyleSheet.innerHTML = ' @media print { .leaflet-popup-content-wrapper, .leaflet-popup-tip { box-shadow: none; }';
		printStyleSheet.innerHTML += ' .leaflet-browser-print--manualMode-button { display: none; }';
		printStyleSheet.innerHTML += ' * { -webkit-print-color-adjust: exact!important; printer-colors: exact!important; color-adjust: exact!important; }';

		if (pageMargin) {
			var margin = pageMargin.top+" "+pageMargin.right+" "+pageMargin.bottom+" "+pageMargin.left;
			printStyleSheet.innerHTML += ' @page { margin: ' + margin + '; }';
		}
		printStyleSheet.innerHTML += ' @page :first { page-break-after: always; }';

		switch (pageOrientation) {
			case "Landscape":
				printStyleSheet.innerText += " @page { size : " + pageSize + " landscape; }";
				break;
			default:
			case "Portrait":
				printStyleSheet.innerText += " @page { size : " + pageSize + " portrait; }";
				break;
		}

		return printStyleSheet;
	},

	_addPrintMapOverlay: function (printMode, pageOrientation, origins) {
		this.__overlay__ = document.createElement("div");
		this.__overlay__.className = this._map.getContainer().className + " leaflet-print-overlay";
		document.body.appendChild(this.__overlay__);

		if(this.options.debug){
			var cancelBtn = L.DomUtil.create("button","",this.__overlay__);
			cancelBtn.innerHTML = "Cancel";
			L.DomEvent.on(cancelBtn,"click",()=>{this.cancel()});
		}

		var options = printMode.options;

		var pageSize = options.pageSize;
		var pageMargin = L.BrowserPrint.Helper.getPageMargin(printMode,"mm");
		var printSize = L.BrowserPrint.Helper.getSize(printMode,pageOrientation);
		var rotate = options.rotate;
		var scale = options.scale;

		this.__overlay__.appendChild(this._addPrintCss(pageSize, pageMargin, pageOrientation));

		if(options.header && options.header.enabled) {
			var headerContainer = document.createElement("div");
			headerContainer.id = "print-header";
			if(options.header.overTheMap){
				headerContainer.className = "over-the-map";
			}
			headerContainer.style.height = options.header.size;
			headerContainer.style.lineHeight = options.header.size;
			var header = document.createElement("span");
			header.innerHTML = options.header.text;
			headerContainer.appendChild(header);
			this._setupPrintPagesWidth(headerContainer, printSize, pageOrientation);
			this.__overlay__.appendChild(headerContainer);
		}

		var gridContainer = document.createElement("div");
		gridContainer.className = "grid-print-container";
		gridContainer.style.width = "100%";
		gridContainer.style.display = "grid";
		this._setupPrintMapHeight(gridContainer, printSize, pageOrientation, options);

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
			pagesContainer.className = "pages-print-container";
			pagesContainer.style.margin = "0!important";
			this._setupPrintPagesWidth(pagesContainer, printSize, pageOrientation);

			this.__overlay__.appendChild(pagesContainer);
			pagesContainer.appendChild(gridContainer);

			var pages = document.querySelectorAll(this.options.pagesSelector);
			if (pages && pages.length) {
				for (var i = 0; i < pages.length; i++) {
					var printPageItem = pages[i].cloneNode(true);
					pagesContainer.appendChild(printPageItem);
				}
			}
		} else {
			this._setupPrintPagesWidth(gridContainer, printSize, pageOrientation);
			this.__overlay__.appendChild(gridContainer);
		}

		var overlayMapDom = document.createElement("div");
		overlayMapDom.id = this._map.getContainer().id + "-print";
		overlayMapDom.className = "grid-map-print";
		overlayMapDom.style.width = "100%";
		overlayMapDom.style.height = "100%";

		if(scale && scale !== 1){
			overlayMapDom.style.transform += " scale("+scale+")";
		}
		if(rotate){
			overlayMapDom.style.transform += " rotate("+(90*rotate)+"deg)";
		}

		gridContainer.appendChild(overlayMapDom);

		if(options.footer && options.footer.enabled) {
			var footerContainer = document.createElement("div");
			footerContainer.id = "print-footer";
			if(options.footer.overTheMap){
				footerContainer.className = "over-the-map";
				footerContainer.style.bottom = "0";
			}
			footerContainer.style.height = options.footer.size;
			footerContainer.style.lineHeight = options.footer.size;
			var footer = document.createElement("span");
			footer.innerHTML = options.footer.text;
			footerContainer.appendChild(footer);
			this._setupPrintPagesWidth(footerContainer, printSize, pageOrientation);
			this.__overlay__.appendChild(footerContainer);
		}

		document.body.className += " leaflet--printing";

		return this._setupPrintMap(overlayMapDom.id, this._combineBasicOptions(origins.printLayer), origins.printLayer, origins.printObjects, origins.panes);
	},

	_combineBasicOptions: function (printLayer) {
		var options = L.BrowserPrint.Utils.cloneBasicOptionsWithoutLayers(this._map.options);

		if (printLayer) {
			options.maxZoom = printLayer.options.maxZoom;
		} else {
			options.maxZoom = this._map.getMaxZoom();
		}

		options.zoomControl = false;
		options.dragging = false;
		options.zoomAnimation = false;
		options.fadeAnimation = false;
		options.markerZoomAnimation = false;
		options.keyboard = false;
		options.scrollWheelZoom = false;
		options.tap = false;
		options.touchZoom = false;

		return options;
	},

	_setupPrintMap: function (id, options, printLayer, printObjects, panes) {
		var overlayMap = L.map(id, options);

		if (printLayer) {
			printLayer.addTo(overlayMap);
		}

		panes.forEach(function(p) { overlayMap.createPane(p.name, p.container); });
		var clones = {};
		var popupsToOpen = [];
		for (var type in printObjects){
			var closePopupsOnPrint = this.options.closePopupsOnPrint;
			printObjects[type] = printObjects[type].map(function(pLayer){
				var clone = L.BrowserPrint.Utils.cloneLayer(pLayer);

				if (clone) {
					/* Workaround for apropriate handling of popups. */
					if (pLayer instanceof L.Popup){
						if(!pLayer.isOpen) {
							pLayer.isOpen = function () { return this._isOpen; };
						}
						if (pLayer.isOpen() && !closePopupsOnPrint) {
							popupsToOpen.push({source: pLayer._source, popup: clone});
						}
					} else {
						clone.addTo(overlayMap);
					}

					clones[pLayer._leaflet_id] = clone;

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

		for (var p = 0; p < popupsToOpen.length; p++) {
			var popupModel = popupsToOpen[p];
			if (popupModel.source) {
				var element = clones[popupModel.source._leaflet_id];
				if (element && element.bindPopup && element.openPopup) {
					clones[popupModel.source._leaflet_id].bindPopup(popupModel.popup).openPopup(popupModel.popup.getLatLng());
				}
			}
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
			if ((layer._url || layer._mutant) && layer._loading) {
				return true;
			}
		}

		return false;
	},

	_appendControlStyles:  function (container) {
		var printControlStyleSheet = document.createElement('style');
		printControlStyleSheet.setAttribute('type', 'text/css');
		printControlStyleSheet.id = "browser-print-css";
		printControlStyleSheet.innerHTML += " .leaflet-control-browser-print { display: flex; } .leaflet-control-browser-print a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gcCCi8Vjp+aNAAAAGhJREFUOMvFksENgDAMA68RC7BBN+Cf/ZU33QAmYAT6BolAGxB+RrrIsg1BpfNBVXcPMLMDI/ytpKozMHWwK7BJJ7yYWQbGdBea9wTIkRDzKy0MT7r2NiJACRgotCzxykFI34QY2Ea7KmtxGJ+uX4wfAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 2px; }";
		printControlStyleSheet.innerHTML += " .leaflet-control-browser-print a.leaflet-browser-print { background-position: center; }";
		printControlStyleSheet.innerHTML += " .browser-print-holder { background-color: #919187; margin: 0px; padding: 0px; list-style: none; white-space: nowrap; align-items: center; display: flex; } .browser-print-holder-left li:last-child { border-top-right-radius: 2px; border-bottom-right-radius: 2px; } .browser-print-holder-right li:first-child { border-top-left-radius: 2px; border-bottom-left-radius: 2px; }";
		printControlStyleSheet.innerHTML += " .browser-print-mode { display: none; color: #FFF; text-decoration: none; padding: 0 10px; text-align: center; } .browser-print-holder:hover { background-color: #757570; cursor: pointer; }";
		printControlStyleSheet.innerHTML += " .leaflet-browser-print--custom, .leaflet-browser-print--custom path { cursor: crosshair!important; }";
		printControlStyleSheet.innerHTML += " .leaflet-print-overlay { width: 100%; height:auto; min-height: 100%; position: absolute; top: 0; background-color: white!important; left: 0; z-index: 1001; display: block!important; } ";
		printControlStyleSheet.innerHTML += " .leaflet--printing { height:auto; min-height: 100%; margin: 0px!important; padding: 0px!important; } body.leaflet--printing > * { display: none; box-sizing: border-box; }";
		printControlStyleSheet.innerHTML += " .grid-print-container { grid-template: 1fr / 1fr; box-sizing: border-box; overflow: hidden; } .grid-map-print { grid-row: 1; grid-column: 1; } body.leaflet--printing .grid-print-container [leaflet-browser-print-content]:not(style) { display: unset!important; }";
		printControlStyleSheet.innerHTML += " .pages-print-container { box-sizing: border-box; }";
		printControlStyleSheet.innerHTML += ' #print-header, #print-footer { text-align: center; font-size: 20px; }';
		printControlStyleSheet.innerHTML += ' .over-the-map { position: absolute; left: 0; z-index: 10000; }';

		container.appendChild(printControlStyleSheet);
	},
	_setupManualPrintButton: function(map, origins, objects) {
		var manualPrintButton = document.createElement('button');
		manualPrintButton.className = "leaflet-browser-print--manualMode-button";
		manualPrintButton.innerHTML = "Print";
		manualPrintButton.style.position = "absolute";
		manualPrintButton.style.top = "20px";
		manualPrintButton.style.right = "20px";
		this.__overlay__.appendChild(manualPrintButton);

		var self = this;
		L.DomEvent.on(manualPrintButton, 'click', function () {
			self._completePrinting(map, origins, objects);
		});
	},
});


L.browserPrint = function(map,options){
	return new L.BrowserPrint(map,options);
};


L.BrowserPrint.Event =  {
	PrintInit: 'browser-print-init',
	PrePrint: 'browser-pre-print',
	PrintStart: 'browser-print-start',
	Print: 'browser-print',
	PrintEnd: 'browser-print-end',
	PrintCancel: 'browser-print-cancel'
};
