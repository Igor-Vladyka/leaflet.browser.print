L.Control.BrowserPrint = L.Control.extend({
	options: {
		title: 'Print map',
		position: 'topleft',
        printLayer: null,
        landscapeMode: true,
        portraitMode: true,
		autoBounds: false,
	},

	onAdd: function () {

		var container = L.DomUtil.create('div', 'leaflet-control-browserPrint leaflet-bar leaflet-control');

		this.link = L.DomUtil.create('a', 'leaflet-control-browserPrint-button leaflet-bar-part', container);
		this.link.id = "leafletBrowserPrint";
		this.link.title = this.options.title;

        if (this.options.landscapeMode === true && this.options.portraitMode === true) {

    		L.DomEvent.addListener(container, 'mouseover', this._displayPageSizeButtons, this);
    		L.DomEvent.addListener(container, 'mouseout', this._hidePageSizeButtons, this);

            this.holder = L.DomUtil.create('ul', 'browserPrintHolder', container );

            this.landscape = L.DomUtil.create('li', 'browserPrintLandscape leaflet-bar-part', this.holder);
			this.landscape.innerHTML = "Landscape";
			L.DomEvent.addListener(this.landscape, 'click', this._printLandscape, this);

            this.portrait = L.DomUtil.create('li', 'browserPrintPortrait leaflet-bar-part', this.holder);
			this.portrait.innerHTML = "Portrait";
			L.DomEvent.addListener(this.portrait, 'click', this._printPortrait, this);

        } else {

			L.DomEvent.addListener(this.link, 'click', this._printAuto, this);

        }

		return container;
	},

    _displayPageSizeButtons: function() {
        this.link.style.borderTopRightRadius = "0px";
    	this.link.style.borderBottomRightRadius = "0px";

    	if(this.options.portraitMode){
    		this.portrait.style.display = "inline-block";
    	}
    	if(this.options.landscapeMode){
    		this.landscape.style.display = "inline-block";
    	}

    	this.holder.style.marginTop = "-"+this.link.clientHeight-1+"px";
    	this.holder.style.marginLeft = this.link.clientWidth+"px";
    },

    _hidePageSizeButtons: function (){
    	this.link.style.borderTopRightRadius = "";
    	this.link.style.borderBottomRightRadius = "";

    	if(this.options.portraitMode){
    		this.portrait.style.display = "";
    	}
    	if(this.options.landscapeMode){
    		this.landscape.style.display = "";
    	}

    	this.holder.style.marginTop = "";
    	this.holder.style.marginLeft = "";
    },

    _printLandscape: function () {
        this._print("Landscape");
    },

    _printPortrait: function () {
        this._print("Portrait");
    },

    _printAuto: function () {
        if (this.options.landscapeMode) {
            this._print("Landscape");
        } else {
            this._print("Portrait");
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
                mapContainer.style.width = "850px";
                mapContainer.style.height = "1100px";
                break;
        }
    },

    _print: function (printSize) {

        var mapContainer = this._map.getContainer();

        this.options.origins = {
            bounds: this._map.getBounds(),
            width: mapContainer.style.width,
            height: mapContainer.style.height,
            printCss: this._addPrintCss(printSize)
        };

        this._setupMapSize(mapContainer, printSize);

        this._validatePrintLayer();

        this._map.invalidateSize();
        this._map.on("moveend", this._onPrintBoundsLoaded, this);

        var boundsToFitForPrint = this.options.origins.bounds;
        if (this.options.autoBounds) {
            boundsToFitForPrint = this._getBoundsForAllVisualLayers() || boundsToFitForPrint;
        }

        this._map.fitBounds(boundsToFitForPrint);
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

    _onCustomPrintLayerLoaded: function () {

        if (this.options.printLayer) {
            this.options.printLayer.off("load", this._onCustomPrintLayerLoaded, this);
        }

        window.print();
        this._printEnd();
    },

    _onPrintBoundsLoaded: function () {
        this._map.off("moveend", this._onPrintBoundsLoaded);

        if (this.options.printLayer) {
            this.options.printLayer.on("load", this._onCustomPrintLayerLoaded, this);
        } else {
            this._onCustomPrintLayerLoaded();
        }
    },

    _printEnd: function () {

        var self = this;

        if (this.options.prevLayers) {
            this.options.prevLayers.forEach(function(l) { self._map.addLayer(l); });
        }

        if (self.options.printLayer) {
            self._map.removeLayer(self.options.printLayer);
        }

        var mapContainer = this._map.getContainer();

        mapContainer.style.width = this.options.origins.width;
        mapContainer.style.height = this.options.origins.height;

        self._map.invalidateSize();
        self._map.fitBounds(this.options.origins.bounds);

        this.options.origins.printCss.remove();

        this.options.origins = undefined;
    },

    _validatePrintLayer: function() {
        var map = this._map;
        var allLayers = map._layers;

        this.options.prevLayers = [];

        if (this.options.printLayer) {

            for (var layerId in allLayers){
                var layer = allLayers[layerId];
                if (layer._url) {
                    this.options.prevLayers.push(layer);
                }
            }

            map.addLayer(this.options.printLayer);
        }

        this.options.prevLayers.forEach(function(l){ map.removeLayer(l); });
    },

    _addPrintCss: function (printSize) {

        var printStyleSheet = document.createElement('style');
        printStyleSheet.setAttribute('type', 'text/css');

        switch (printSize) {
            case "Landscape":
                printStyleSheet.innerText = "@media print { @page { size : landscape; }}";
                break;
            default:
            case "Portrait":
                printStyleSheet.innerText = "@media print { @page { size : portrait; }}";
                break;
        }

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(printStyleSheet);

        return printStyleSheet;
    }
});

L.browserPrint = function(options) {

    if (options.landscapeMode === false && options.portraitMode === false) {
        options.landscapeMode = true;
        options.portraitMode = true;
    }

	return new L.Control.BrowserPrint(options);
};
