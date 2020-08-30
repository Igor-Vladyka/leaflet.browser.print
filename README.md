# Map Print Plugin for Leaflet.js
[![npm version](https://badge.fury.io/js/leaflet.browser.print.svg)](https://www.npmjs.com/package/leaflet.browser.print)

## General information

A [leaflet](http://www.leafletjs.com) plugin which allows users to [print full page map](https://igor-vladyka.github.io/leaflet.browser.print/) directly from the browser
* Pros:
	- Compatible with Leaflet v1+.
	- Any page size from range A0-A10, B0-B10, C0-C10, D0-D10 can se used.
	- North American paper sizes available as well: Letter, HalfLetter, Legal, JuniorLegal, Tabloid, Ledger
	- Available 4 print modes, you can chose any you want and even create your own.
	- Everything in browser, no external apps or dependencies, print your map in one click.
	- You can even override default browser print behavior and export map as image, more details you can find [here](https://github.com/Igor-Vladyka/leaflet.browser.print#download-map-as-image).
	- Any additional page content can be printed together with a map.
	- And many more...just ask!

* Cons:
	- Doesn't change page orientation automatically in IE and FF, due to [The @page rule and forcing Landscape orientation](http://css-discuss.incutio.com/wiki/Print_Stylesheets#The_.40page_rule_and_forcing_Landscape_orientation)

[Changelog](https://github.com/Igor-Vladyka/leaflet.browser.print/blob/master/CHANGELOG.md)

### Other examples:
Check out the:
* [General example](https://igor-vladyka.github.io/leaflet.browser.print/)
* [Localization](https://igor-vladyka.github.io/leaflet.browser.print/examples/localization.html)
* [Print objects manipulations](https://igor-vladyka.github.io/leaflet.browser.print/examples/manipulations.html)
* [Map legend printing](https://igor-vladyka.github.io/leaflet.browser.print/examples/print-with-legend.html)
* [Export map as Image](https://igor-vladyka.github.io/leaflet.browser.print/examples/savePNG.html)

### Be careful when printing map legend
Common problem with printing map with a legend is external CSS plugins that ruins everything, [here is an actual good answer why it is like that with Bootstrap plugin](https://stackoverflow.com/questions/33410724/bootstrap-print-css-removes-background-color). Please read it carefully.

### Downloads
**NPM**
````
	npm install --save leaflet.browser.print
````

**YARN**
````
	yarn add leaflet.browser.print
````

### Usage
**Step 1.** Include the required js and css files in your document.

```html
	<script src="dist/leaflet.browser.print.min.js"></script>
```

**Step 2.** Add the following line of code to your map script

``` js
	L.control.browserPrint().addTo(map)
```

**Step 3.**
You can pass a number of options to the plugin to control various settings.

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| title         | String       | 'Print map'  | Sets the text which appears as the tooltip of the print button |
| documentTitle | String       | ''  		  | Sets the text which appears as the print page title |
| position      | [Leaflet control position](http://leafletjs.com/reference-1.5.0.html#control-position) | 'topleft' | Position the print button |
| printModes    | Array        | ["Portrait", "Landscape", "Auto", "Custom"] | Collection of page print actions |
| printLayer    | [Leaflet tile layer](http://leafletjs.com/reference-1.5.0.html#tilelayer) | null | A tiles layer to show instead of all current active tile layers |
| closePopupsOnPrint | Boolean | true | Indicates if we need to force popup closing for printed map |
| contentSelector | String | "[leaflet-browser-print-content]" | Content selector for printed map, will select and dynamically inject content on printed maps. For full functionality please check "Printing additional content section" |
| pagesSelector | String | "[leaflet-browser-print-pages]" | Pages selector for printed map, will select and dynamically inject additional pages content on printed maps. |
| manualMode | Boolean | false | Adds a button with id='leaflet-browser-print--manualMode-button' for debugging purpose, also can be used to print map with external button. |
| customPrintStyle | [Polyline options](https://leafletjs.com/reference-1.5.0.html#polyline-option)] | { color: "gray", dashArray: "5, 10", pane: "customPrintPane" } | Style for rectangle on custom print. 'customPrintPane' - is a custom pane with z-index => 9999 |

Here's an example of passing through some options:
``` js
var customActionToPrint = function(context, mode) {
	return function() {
		window.alert("We are printing the MAP. Let's do Custom print here!");
		context._printCustom(mode);
	}
}

L.control.browserPrint({
	title: 'Just print me!',
	documentTitle: 'Map printed using leaflet.browser.print plugin',
	printLayer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
					attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					subdomains: 'abcd',
					minZoom: 1,
					maxZoom: 16,
					ext: 'png'
				}),
	closePopupsOnPrint: false,
	printModes: [
		L.control.browserPrint.mode.landscape("TABLOID VIEW", "tabloid"),
		L.control.browserPrint.mode("Alert", "User specified print action", "A6", customActionToPrint, false),
		L.control.browserPrint.mode.landscape(),
		"Portrait",
		L.control.browserPrint.mode.auto("Automatico", "B4"),
		L.control.browserPrint.mode.custom("Séléctionnez la zone", "B5")
	],
	manualMode: false
}).addTo(map);
```

### Print Mode Details

| Mode          | Description    |
| ------------- | -------------- |
| Portrait      | Print currently visual part of the map with Portrait page dimensions |
| Landscape     | Print currently visual part of the map with Landscape page dimensions |
| Auto          | Track all active map layers (markers, lines, polygons, etc. ) and tries to fit them in print page in Portrait or Landscape page dimensions |
| Custom        | Allows you to select rectangle for printing, and then fit it in Portrait or Landscape page dimensions |

General mode and shortcuts:
``` js
	L.control.browserPrint.mode(
		/*Mode from table above*/,
		/*Text to represent mode on button*/,
		/*Page Size that can basically be in range A0-A10 and B0-B10.*/
		/*Custom function that can be executed to print map*/,
		/*Indicates if we need to force bounds invalidation(true) or just center the map and use current zoom lvl(false)*/
	);

	L.control.browserPrint.mode.landscape();
	L.control.browserPrint.mode.portrait();
	L.control.browserPrint.mode.auto();
	L.control.browserPrint.mode.custom();
```

### Map Events

| Map Event           | Event Shortcut                          | Value           		 			     | Description 													   | Purpose |
| ------------------- | --------------------------------------- | -------------------------------------- | --------------------------------------------------------------- | ------- |
| browser-print-init  | L.Control.BrowserPrint.Event.PrintInit  | { mode }                               | Fire right after printing was initialized.                      | To support busy indicator of any type to show user loaing status. |
| browser-pre-print   | L.Control.BrowserPrint.Event.PrePrint   | { pageSize, pageBounds, printObjects } | Fire before print started, allows manipulation with map objects.| For DOM manipulation with real map objects.|
| browser-print-start | L.Control.BrowserPrint.Event.PrintStart | { printLayer, printMap, printObjects } | Fire on print started, before all print calculations is done.   | For DOM manipulation with print map and print objects. |
| browser-print       | L.Control.BrowserPrint.Event.Print      | { printLayer, printMap, printObjects } | Fire right before native print. 								   | For DOM manipulation with print map and print objects. |
| browser-print-end   | L.Control.BrowserPrint.Event.PrintEnd   | { printLayer, printMap, printObjects } | Fire on print end, after we refresh map to show initial view.   | For DOM manipulation with real map objects after print |

Example can be found here: [DEMO with print objects manipulations](https://igor-vladyka.github.io/leaflet.browser.print/examples/manipulations.html);

### Printing additional content section

To add additional printing content (in addition to a map itself) we need to specify content that should be added: [Demo](https://igor-vladyka.github.io/leaflet.browser.print/);
By default contentSelector: '[leaflet-browser-print-content]' so we need a content with an 'leaflet-browser-print-content' attribute.

Code example:

``` html
<style leaflet-browser-print-content>
	.grid-print-container { // grid holder that holds all content (map and any other content)
		grid-template: auto 1fr auto / 1fr;
		background-color: orange;
	}
	.grid-map-print { // map container itself
		grid-row: 2;
	}
	.title { // Dynamic title styling
		grid-row: 1;
		justify-self: center;
		color: white;
	}
	.sub-content { // Dynamic sub content styling
		grid-row: 5;
		padding-left: 10px;
	}
</style>
<h1 class="title" leaflet-browser-print-content>Leaflet Browser print TITLE</h1>
<h3 class="sub-content" leaflet-browser-print-content>Leaflet Browser print SUB TITLE text</h3>
```

On print, plugin will scan DOM by contentSelector, and will add content to print may.

````
We are using CSS-GRID to position all controls on a print page.
Therefor it's not supportable in all browsers, for more information please visit [caniuse.com](https://caniuse.com/#feat=css-grid).
````

### Angular 2+
````
See chapter 4 of https://github.com/Asymmetrik/ngx-leaflet-tutorial-plugins/tree/master/Leaflet.BrowserPrint
````

### New print layers/renderers registration
To add missing print layers you need to explicitly indicate layer, it's identifier and construction function that will return actual layer object.

Example of L.MarkerClusterGroup registration:
``` js
L.Control.BrowserPrint.Utils.registerLayer(
	// Actual typeof object to compare with
	L.MarkerClusterGroup,
	// Any string you would like for current function for print events
	'L.MarkerClusterGroup',
	function (layer, utils) {
		// We need to recreate cluster object with available options
		// Here we use function, but we can use object aswell,
		// example: new L.MarkerClusterGroup(layer._group.options);
		var cluster = L.markerClusterGroup(layer._group.options);

		// And we clone all inner layers to our new cluster
		// to properly recalculate/recreate position for print map
		cluster.addLayers(utils.cloneInnerLayers(layer._group));

		return cluster;
	});
```

List of pre-registered layers available for printing:
* L.TileLayer.WMS
* L.TileLayer
* L.ImageOverlay
* L.Marker
* L.Popup
* L.Circle
* L.CircleMarker
* L.Rectangle
* L.Polygon
* L.MultiPolyline
* L.MultiPolygon
* L.Polyline
* L.GeoJSON
* L.FeatureGroup
* L.LayerGroup
* L.Tooltip


Example of renderer registration:
``` js
L.Control.BrowserPrint.Utils.registerRenderer(L.SVG, 'L.SVG');
```

List of registered renderers
* L.SVG
* L.Canvas

If you want to override any of those, please register your own builder for them.

#### MarkerClusterGroup OutOfMemory problem:
If you are facing OutOfMemory problem printing huge amount of objects you may consider next workaround:
``` js
// markerClusterGroup to print
var printableObjects = L.markerClusterGroup();

// We are not cloning markercluster to preserve original clasterization behavior and prevent OutOfMemory problems
// This way we will need to invalidate MarkerClusterGroup after printing
L.Control.BrowserPrint.Utils.registerLayer(L.MarkerClusterGroup,
										  'L.MarkerClusterGroup',
											function (layer, utils) {
												return layer;
											});

// On print end we invalidate markercluster to update markers;
map.on(L.Control.BrowserPrint.Event.PrintEnd, function(e) {
	map.removeLayer(printableObjects);
	map.addLayer(printableObjects);
});

// Initial rendering ouf objects
map.addLayer(printableObjects);
```


### Download Map as Image
To download map as PNG you have to use external plugin to do the job. Current plugin will do only 1 job - prepare map for printing.
To print actual map we use in-browser print mechanism:
``` js
window.print()
```

You can override it to support any other behavior as you want.
Example with [domtoimage](https://github.com/tsayen/dom-to-image) plugin to export map as image.png:

``` js
window.print = function () {
	return domtoimage.toPng(document.body)
				.then(function (dataUrl) {
					var link = document.createElement('a');
					link.download = map.printControl.options.documentTitle || "exportedMap" + '.png';
					link.href = dataUrl;
					link.click();
				});
};
```

Full example you can find [here](https://igor-vladyka.github.io/leaflet.browser.print/examples/savePNG.html).

### Custom print button action
Example of how you can use default button or style/specify your own button to call actual print logic. First of all you need to create print plugin with at least one print option to be able to attach it to the map, later you can use any other, even dynamically created print mode with your custom print button.

Example:
``` js
    L.control.browserPrint({
        printLayer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
                    	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    	subdomains: 'abcd',
                    	minZoom: 1,
                    	maxZoom: 16,
                    	ext: 'png'
                    }),
		printModes: [ "Landscape" ],
		manualMode: true // use true if it's debug and/or default button is okay for you, otherwise false.
    }).addTo(map);

	document.querySelector("#custom_print_button").addEventListener("click", function(){
		var modeToUse = L.control.browserPrint.mode.auto();
		map.printControl.print(modeToUse);
	});
```

And add next css to hide onmap menu:
``` CSS
	.leaflet-control-browser-print {display: none;}
```
### Important notes
````
Unfortunately 'Custom' mode is not working correctly for Leaflet v.0.7.7 in all IE browsers.
````

### Acknowledgements
Thanks to [Rowan Winsemius](https://github.com/rowanwins/leaflet-easyPrint) for general idea with a map print functionality.

Thanks to [Jan Pieter Waagmeester](https://github.com/jieter/leaflet-clonelayer) for an idea that helped with map print functionality.

Also thanks to [IcoMoon](http://icomoon.io/) for the print icon.
