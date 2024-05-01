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
	- Leaflet Print Control
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

**SCRIPT**
```html
	<script src="dist/leaflet.browser.print.min.js"></script>
```


### Usage
#### Add a Control
Add the following line of code to your map script

```javascript
var browserControl = L.control.browserPrint(options).addTo(map);
```

You can pass a number of options to the control:

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| position      | [Leaflet control position](http://leafletjs.com/reference-1.5.0.html#control-position) | 'topleft' | Position the print button |
| title         | String       | 'Print map'  | Sets the text which appears as the tooltip of the print button |
| printModes    | Array        | ["Portrait", "Landscape", "Auto", "Custom"] | Collection of page print actions |

Also the options for the [backend](#Use it in the Backend) can passed through.

```javascript
L.control.browserPrint({position: 'topleft', title: 'Print ...'}).addTo(map);
```

To use the same BrowserPrint class in the backend and in the control you can pass it while creating the control:
```javascript
var browserPrint = L.browserPrint(map,backendOptions);
L.control.browserPrint(controlOptions,browserPrint).addTo(map);
```



Here's an example of passing through some options:
```javascript
var customActionToPrint = function(context, mode) {
	return function() {
		window.alert("We are printing the MAP. Let's do Custom print here!");
		context._printMode(mode);
	}
};

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
            L.BrowserPrint.Mode.Landscape("Tabloid",{title: "Tabloid VIEW"}),
            L.browserPrint.mode("Alert",{title:"User specified print action",pageSize: "A6", action: customActionToPrint, invalidateBounds: false}),
            L.BrowserPrint.Mode.Landscape(),
            "Portrait",
            L.BrowserPrint.Mode.Auto("B4",{title: "Auto"}),
            L.BrowserPrint.Mode.Custom("B5",{title:"Select area"})
	],
	manualMode: false
}).addTo(map);
```

To stop printing call `cancel()`:
```javascript
browserControl.cancel();
```


#### Use it in the Backend
Add the following line of code to your map script

```javascript
var browserPrint = L.browserPrint(map, options);
```

And then you can start printing with:
```javascript
browserPrint.print(L.BrowserPrint.Mode.Landscape());
```
To stop printing call `cancel()`:
```javascript
browserPrint.cancel();
```

You can pass a number of options for printing:

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| printModes    | Array        | ["Portrait", "Landscape", "Auto", "Custom"] | Collection of page print actions |
| documentTitle | String       | ''  		  | Sets the text which appears as the print page title |
| printLayer    | [Leaflet tile layer](http://leafletjs.com/reference-1.7.1.html#tilelayer) | null | A tiles layer to show instead of all current active tile layers |
| closePopupsOnPrint | Boolean | true | Indicates if we need to force popup closing for printed map |
| contentSelector | String | "[leaflet-browser-print-content]" | Content selector for printed map, will select and dynamically inject content on printed maps. For full functionality please check "Printing additional content section" |
| pagesSelector | String | "[leaflet-browser-print-pages]" | Pages selector for printed map, will select and dynamically inject additional pages content on printed maps. |
| manualMode | Boolean | false | Adds a button with id='leaflet-browser-print--manualMode-button' for debugging purpose, also can be used to print map with external button. |
| customPrintStyle | [Polyline options](https://leafletjs.com/reference-1.7.1.html#polyline-option) | `{ color: "gray", dashArray: "5, 10", pane: "customPrintPane" }` | Style for rectangle on custom print. 'customPrintPane' - is a custom pane with z-index => 9999 |
| cancelWithEsc    | Boolean        | true | Cancel printing with the ESC key |
| printFunction    | Function | window.print | Function that will be executed for printing. |
| debug    | Boolean        | false | Stops opening the print window. Only for developing use. |


Here's an example of passing through some options:
```javascript
var options = {
    documentTitle: 'Map printed using leaflet.browser.print plugin',
    printLayer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
                    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: 'abcd',
                    minZoom: 1,
                    maxZoom: 16,
                    ext: 'png'
                }),
    closePopupsOnPrint: false,
    manualMode: false
};
var browserPrint = L.browserPrint(map, options);
```


### Print Modes

| Mode          | Description    |
| ------------- | -------------- |
| Portrait      | Print currently visual part of the map with Portrait page dimensions |
| Landscape     | Print currently visual part of the map with Landscape page dimensions |
| Auto          | Track all active map layers (markers, lines, polygons, etc. ) and tries to fit them in print page in Portrait or Landscape page dimensions |
| Custom        | Allows you to select rectangle for printing, and then fit it in Portrait or Landscape page dimensions if it is not explicit set |

General modes:
```javascript
	L.BrowserPrint.Mode.Landscape();
	L.BrowserPrint.Mode.Portrait();
	L.BrowserPrint.Mode.Auto();
	L.BrowserPrint.Mode.Custom();
```

For each general mode the page size and options can be passed. The default page size is `A4`
```javascript
L.BrowserPrint.Mode.Landscape(pageSize,options);
```


| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| title         | String       | The mode name. f.e. "Portrait" | Set the control menu text |
| pageSize      | String       | 'A4'          | Size of page that will be printed |
| orientation   | String       | Mode name or calculation (Auto & Custom) | How the page will be displayed landscape or portrait |
| zoom          | Integer      | 0             | Zoom the map to this level |
| enableZoom    | Boolean      | true          | Zoom the map optimal, else the current zoom is taken. `zoom` have to be `0` |
| action        | Function     | default mode action | [Custom print button action](#Custom print button action) |
| rotate        | Integer      | 0             | Rotate the map x-times by 90° |
| margin        | Object       | automatic     | The default margin are `(height + width) / 39.9`. A number can passed for all margins or set it explicit in a object for `left`, `right`, `top`, `bottom` --> `{left: 10, top: 40}`  |
| scale         | Double       | 1             | Scale the map. Shows all bigger or smaller, with `1` the map looks normal |
| header        | Object       |               | Adds a header section to the top of the page. For the available options look in the "Header / Footer Options" table below |
| footer        | Object       |               | Adds a footer section to the bottom of the page. For the available options look in the "Header / Footer Options" table below |

#### Header / Footer Options
| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| enabled       | Boolean      | false        | Shows the section |
| text          | String / HTML| ""           | The displayed text |
| size          | String       | "10mm"       | The height of the section |
| overTheMap    | Boolean      | false        | The section is displayed over the map|

You can overwrite the CSS or change the DOM over the ids `#print-header` and `#print-footer`

Creating a own mode: `L.BrowserPrint.Mode(name,options);`
```javascript
L.browserPrint.mode("Alert Mode",{pageSize: 'A3',orientation: 'Portrait'});
```

The mode options can be updated with:
```javascript
mode.setOptions(options);
```

### Map Events

| Map Event           | Event Shortcut                          | Value           		 			     | Description 													   | Purpose |
| ------------------- | --------------------------------------- | -------------------------------------- | --------------------------------------------------------------- | ------- |
| browser-print-init  | L.BrowserPrint.Event.PrintInit  | { mode }                               | Fire right after printing was initialized.                      | To support busy indicator of any type to show user loaing status. |
| browser-pre-print   | L.BrowserPrint.Event.PrePrint   | { pageSize, pageBounds, printObjects } | Fire before print started, allows manipulation with map objects.| For DOM manipulation with real map objects.|
| browser-print-start | L.BrowserPrint.Event.PrintStart | { printLayer, printMap, printObjects } | Fire on print started, before all print calculations is done.   | For DOM manipulation with print map and print objects. |
| browser-print       | L.BrowserPrint.Event.Print      | { printLayer, printMap, printObjects } | Fire right before native print. 								   | For DOM manipulation with print map and print objects. |
| browser-print-end   | L.BrowserPrint.Event.PrintEnd   | { printLayer, printMap, printObjects } | Fire on print end, after we refresh map to show initial view.   | For DOM manipulation with real map objects after print |
| browser-print-cancel| L.BrowserPrint.Event.PrintCancel   | { mode } | Fire when printing cancelded   | For DOM manipulation with real map objects after cancel |

Example can be found here: [DEMO with print objects manipulations](https://igor-vladyka.github.io/leaflet.browser.print/examples/manipulations.html);

### Printing additional content section

To add additional printing content (in addition to a map itself) we need to specify content that should be added: [Demo](https://igor-vladyka.github.io/leaflet.browser.print/);
By default contentSelector: '[leaflet-browser-print-content]' so we need a content with an 'leaflet-browser-print-content' attribute.

Code example:

```html
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
```js
L.BrowserPrint.Utils.registerLayer(
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
```js
L.BrowserPrint.Utils.registerRenderer(L.SVG, 'L.SVG');
```

List of registered renderers
* L.SVG
* L.Canvas

If you want to override any of those, please register your own builder for them.

#### MarkerClusterGroup OutOfMemory problem:
If you are facing OutOfMemory problem printing huge amount of objects you may consider next workaround:
```js
// markerClusterGroup to print
var printableObjects = L.markerClusterGroup();

// We are not cloning markercluster to preserve original clasterization behavior and prevent OutOfMemory problems
// This way we will need to invalidate MarkerClusterGroup after printing
L.BrowserPrint.Utils.registerLayer(L.MarkerClusterGroup,
										  'L.MarkerClusterGroup',
											function (layer, utils) {
												return layer;
											});

// On print end we invalidate markercluster to update markers;
map.on(L.BrowserPrint.Event.PrintEnd, function(e) {
	map.removeLayer(printableObjects);
	map.addLayer(printableObjects);
});

// Initial rendering ouf objects
map.addLayer(printableObjects);
```


### Download Map as Image
To download map as PNG you have to use external plugin to do the job. Current plugin will do only 1 job - prepare map for printing.
To print actual map we use in-browser print mechanism:
```js
window.print()
```

You can use the options `printFunction` to implement any other behavior that you want.
Example with [domtoimage](https://github.com/tsayen/dom-to-image) plugin to export map as image.png:

```js
var saveAsImage = function () {
	return domtoimage.toPng(document.body)
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = map.printControl.options.documentTitle || "exportedMap" + '.png';
            link.href = dataUrl;
            link.click();
        });
};

L.control.browserPrint({
    documentTitle: "printImage",
    printModes: [
        L.BrowserPrint.Mode.Auto("Download PNG"),
    ],
    printFunction: saveAsImage
}).addTo(map);
```

Full example you can find [here](https://igor-vladyka.github.io/leaflet.browser.print/examples/savePNG.html).

### Custom print button action
Example of how you can use default button or style/specify your own button to call actual print logic. First of all you need to create print plugin with at least one print option to be able to attach it to the map, later you can use any other, even dynamically created print mode with your custom print button.

Example:
```js
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
		var modeToUse = L.BrowserPrint.Mode.Auto();
		map.printControl.browserPrint.print(modeToUse);
	});
```

And add next css to hide onmap menu:
```CSS
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

Thanks to [Falke-Design](https://github.com/falke-design/) for restructuring the project and adding more functions
