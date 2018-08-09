/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.Control.BrowserPrint.Utils = {

	_ignoreArray: [],

	_cloneFactoryArray: [],

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
	},

	initialize: function () {
		// Renderers
		this.registerLayer(L.SVG, 'L.SVG');
		this.registerLayer(L.Canvas, 'L.Canvas');
		this.registerLayer(L.MarkerClusterGroup, 'L.MarkerClusterGroup', function (layer, utils) {
			var cluster = L.markerClusterGroup(layer.options);
			cluster.addLayers(utils.cloneInnerLayers(layer));
			return cluster;
		});
		this.registerLayer(L.TileLayer.WMS, 'L.TileLayer.WMS', function(layer) { 	return L.tileLayer.wms(layer._url, layer.options); });
		this.registerLayer(L.TileLayer, 'L.TileLayer', function(layer) { 			return L.tileLayer(layer._url, layer.options); });
		this.registerLayer(L.GridLayer, 'L.GridLayer', function(layer) { 			return L.gridLayer(layer.options); });
		this.registerLayer(L.ImageOverlay, 'L.ImageOverlay', function(layer) { 		return L.imageOverlay(layer._url, layer._bounds, layer.options); });
		this.registerLayer(L.Marker, 'L.Marker', function(layer) { 					return L.marker(layer.getLatLng(), layer.options); });
		this.registerLayer(L.Popup, 'L.Popup', function(layer) { 					return L.popup(layer.options).setLatLng(layer.getLatLng()).setContent(layer.getContent()); });
		this.registerLayer(L.Circle, 'L.Circle', function(layer) { 					return L.circle(layer.getLatLng(), layer.getRadius(), layer.options); });
		this.registerLayer(L.CircleMarker, 'L.CircleMarker', function(layer) { 		return L.circleMarker(layer.getLatLng(), layer.options); });
		this.registerLayer(L.Rectangle, 'L.Rectangle', function(layer) { 			return L.rectangle(layer.getBounds(), layer.options); });
		this.registerLayer(L.Polygon, 'L.Polygon', function(layer) { 				return L.polygon(layer.getLatLngs(), layer.options); });

		// MultiPolyline is removed in leaflet 1.0.0
		this.registerLayer(L.MultiPolyline, 'L.MultiPolyline', function(layer) { 	return L.polyline(layer.getLatLngs(), layer.options); });
		// MultiPolygon is removed in leaflet 1.0.0
		this.registerLayer(L.MultiPolygon, 'L.MultiPolygon', function(layer) { 		return L.multiPolygon(layer.getLatLngs(), layer.options); });

		this.registerLayer(L.Polyline, 'L.Polyline', function(layer) { 				return L.polyline(layer.getLatLngs(), layer.options); });
		this.registerLayer(L.GeoJSON, 'L.GeoJSON', function(layer) { 				return L.geoJson(layer.toGeoJSON(), layer.options); });

		this.registerIgnoreLayer(L.FeatureGroup, 'L.FeatureGroup');
		this.registerIgnoreLayer(L.LayerGroup, 'L.LayerGroup');

		// There is no point to clone tooltips here;  L.tooltip(options);
		this.registerLayer(L.Tooltip, 'L.Tooltip', function(){	return null; });
	},

	registerLayer: function(type, identifier, layerBuilderFunction) {
		if (type &&
			!this._cloneFactoryArray.filter(function(l){ return l.identifier === identifier; }).length) {

			this._cloneFactoryArray.push({
				type: type,
				identifier: identifier,
				builder: layerBuilderFunction || function (layer) { return new type(layer.options); }
			});
		}
	},

	registerIgnoreLayer: function(type, identifier) {
		if (type &&
			!this._ignoreArray.filter(function(l){ return l.identifier === identifier; }).length) {

			this._ignoreArray.push({
				type: type,
				identifier: identifier
			});
		}
	},

	cloneLayer: function(layer) {

		var factoryObject = this.__getFactoryObject(layer);
		if (factoryObject) {
			factoryObject = factoryObject.builder(layer, this);
		}

		return factoryObject;
	},

	getType: function(layer) {

		var factoryObject = this.__getFactoryObject(layer);
		if (factoryObject) {
			factoryObject = factoryObject.identifier;
		}

		return factoryObject;
	},

	__getFactoryObject: function (layer) {
		if (!layer) return null;

		this.initialize();

		for (var i = 0; i < this._ignoreArray.length; i++) {
			var ignoreObject = this._ignoreArray[i];
			if (ignoreObject.type && layer instanceof ignoreObject.type) {
				return null;
			}
		}

		for (var i = 0; i < this._cloneFactoryArray.length; i++) {
			var factoryObject = this._cloneFactoryArray[i];
			if (factoryObject.type && layer instanceof factoryObject.type) {
				return factoryObject;
			}
		}

		this.__unknownLayer__();

		return null;
	},

	__unknownLayer__: function(){
	   console.warn('Unknown layer, cannot clone this layer. Leaflet-version: ' + L.version);
	   console.info('Please use "L.Control.BrowserPrint.Utils.registerLayer(/*layerFunction*/, "layerIdentifierString", constructorFunction)" to register new layers.');
	   console.info('WMS Layer registration Example: L.Control.BrowserPrint.Utils.registerLayer(L.TileLayer.WMS, "L.TileLayer.WMS", function(layer, utils) { return L.tileLayer.wms(layer._url, layer.options); });');
	   console.info('For additional information please refer to documentation on: https://github.com/Igor-Vladyka/leaflet.browser.print.');
	   console.info('-------------------------------------------------------------------------------------------------------------------');
   }
};
