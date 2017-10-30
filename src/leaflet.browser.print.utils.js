/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.browserPrintUtils = {
	cloneOptions: function(options) {
		var utils = this;
	    var ret = {};
	    for (var i in options) {
	        var item = options[i];
	        if (item && item.clone) {
	            ret[i] = item.clone();
	        } else if (item.onAdd) {
	            ret[i] = utils.cloneLayer(item);
	        } else {
	            ret[i] = item;
	        }
	    }
	    return ret;
	},

	cloneLayer: function(layer, map) {
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
		   return L.featureGroup(); /*utils.cloneInnerLayers(layer)*/
		}

		if (layer instanceof L.LayerGroup) {
		   return L.layerGroup();
	   }

		console.info('Unknown layer, cannot clone this layer. Leaflet-version: ' + L.version);
		
		return null;
   },
   
   getType: function(layer) {	   
	   if (L.SVG && layer instanceof L.SVG) { return "L.SVG"; } // Renderer
	   if (L.Canvas && layer instanceof L.Canvas) { return "L.Canvas"; } // Renderer   
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
