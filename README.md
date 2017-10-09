## leaflet browser print plugin

A [leaflet](http://www.leafletjs.com) plugin which allows users to print full page map directly from the browser. Compatible with Leaflet v0.7.7 and v1+.

Check out the:
[DEMO v0.7.7](https://igor-vladyka.github.io/leaflet.browser.print/examples/v0.7.7.html),

[DEMO v1.2.0](https://igor-vladyka.github.io/leaflet.browser.print/examples/v1.2.0.html),

[DEMO with localization](https://igor-vladyka.github.io/leaflet.browser.print/examples/localization_v1.2.0.html),

[DEMO with print objects manipulations](https://igor-vladyka.github.io/leaflet.browser.print/examples/manipulations_v1.2.0.html),

[DEMO with map legend printing](https://igor-vladyka.github.io/leaflet.browser.print/examples/print-with-legend_v1.2.0.html),

[DEMO with custom print layer and additional page content](https://igor-vladyka.github.io/leaflet.browser.print/);

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
	L.browserPrint().addTo(map)
```

**Step 3.**
You can pass a number of options to the plugin to control various settings.

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| title         | String       | 'Print map'  | Sets the text which appears as the tooltip of the print button |
| position      | [Leaflet control position](http://leafletjs.com/reference-0.7.7.html#control-position) | 'topleft' | Position the print button |
| printModes    | Array        | ["Portrait", "Landscape", "Auto", "Custom"] | Collection of page print actions |
| printModesNames | Object | { Portrait: "Portrait", Landscape: "Landscape", Auto:"Auto", Custom:"Custom" } | Customize each print mode name |
| printLayer    | [Leaflet tile layer](http://leafletjs.com/reference-0.7.7.html#tilelayer) | null | A tiles layer to show instead of all current active tiles layers |
| closePopupsOnPrint | Boolean | true | Indicates if we need to force popup closing for printed map |

Here's an example of passing through some options.
``` js
L.browserPrint({
	title: 'Just print me!',
	printLayer: L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
					attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					maxZoom: 19
				}),
	printModesNames: {Portrait:"Portrait", Landscape:"Paysage", Auto:"Auto", Custom:"Séléctionnez la zone"}
}).addTo(map);
```

### Print Modes Details

| Mode          | Description    |
| ------------- | -------------- |
| Portrait      | Print currently visual part of the map with Portrait page dimensions |
| Landscape     | Print currently visual part of the map with Landscape page dimensions |
| Auto          | Track all active map layers (markers, lines, polygons, etc. ) and tries to fit them in print page in Portrait or Landscape page dimensions |
| Custom        | Allows you to select rectangle for printing, and then fit it in Portrait or Landscape page dimensions |

````
	Currently 'Custom' mode is not working correctly for Leaflet v.0.7.7 in all IE browsers.
````

### Map Events

| Map Event           | Value           		 			   | Description 													 | Purpose |
| ------------------- | -------------------------------------- | --------------------------------------------------------------- | ------- |
| browser-pre-print   | { printObjects } 		 			   | Fire before print started, allows manipulation with map objects.| For DOM manipulation with real map objects. |
| browser-print-start | { printLayer, printMap, printObjects } | Fire on print started, before all print calculations is done.   | For DOM manipulation with print map and print objects. |
| browser-print       | { printLayer, printMap, printObjects } | Fire right before native print. 								 | For DOM manipulation with print map and print objects. |
| browser-print-end   | { printLayer, printMap, printObjects } | Fire on print end, after we refresh map to show initial view.   | For DOM manipulation with real map objects after print |

Example can be found here: [DEMO with print objects manipulations](https://igor-vladyka.github.io/leaflet.browser.print/examples/manipulations_v1.2.0.html);

### Acknowledgements
Thanks to [Rowan Winsemius](https://github.com/rowanwins/leaflet-easyPrint) for general idea with a map print functionality.

Thanks to [Jan Pieter Waagmeester](https://github.com/jieter/leaflet-clonelayer) for an idea that helped with map print functionality.

Also thanks to [IcoMoon](http://icomoon.io/) for the print icon.
