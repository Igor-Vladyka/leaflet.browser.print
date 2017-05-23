## leaflet browser print plugin

A [leaflet](http://www.leafletjs.com) plugin which allows users to print full page map directly from the browser. Compatible with Leaflet v0.7.7 and v1.0.3.

Check out the [DEMO v0.7.7](https://igor-vladyka.github.io/leaflet.browser.print/v0.7.7.html), [DEMO v1.0.3](https://igor-vladyka.github.io/leaflet.browser.print/v1.0.3.html) and a [DEMO with custom print layer and additional page content](https://igor-vladyka.github.io/leaflet.browser.print/);

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
| printLayer    | [Leaflet tile layer](http://leafletjs.com/reference-0.7.7.html#tilelayer) | null | A tiles layer to show instead of all current active tile layers |

Here's an example of passing through some options.
``` js
L.browserPrint({
	title: 'Just print me!',
	printLayer: L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
					attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					maxZoom: 19
				})
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

| Map Event           | Value           		 | Description 													 |
| ------------------- | ------------------------ | ------------------------------------------------------------- |
| browser-print-start | { printLayer, printMap } | Fire on print started, before all print calculations is done. |
| browser-print       | { printLayer, printMap } | Fire right before native print. 								 |
| browser-print-end   | { printLayer, printMap } | Fire on print end, after we refresh map to show initial view. |

### Acknowledgements
Thanks to [Rowan Winsemius](https://github.com/rowanwins/leaflet-easyPrint) for general idea with a map print functionality.
Thanks to [Jan Pieter Waagmeester](https://github.com/jieter/leaflet-clonelayer) for an idea that helped with map print functionality.

Also thanks to [IcoMoon](http://icomoon.io/) for the print icon.
