## leaflet browser print plugin

A [leaflet](http://www.leafletjs.com) plugin which allows users to print the map directly from the browser. Compatible with Leaflet v0.7.7.

Check out the [DEMO](https://igor-vladyka.github.io/leaflet.browser.print/).

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
	<link rel="stylesheet" href="dist/leaflet.browser.print.css"/>
	<script src="dist/leaflet.browser.print.js"></script>
```

**Step 2.** Add the following line of code to your map script

``` js
	L.browserPrint().addTo(map)
```

**Step 3.**
You can pass a number of options to the plugin to control various settings.

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| title | string | 'Print map' | Sets the text which appears as the tooltip of the print button |
| position | [Leaflet control position](http://leafletjs.com/reference.html#control-positions) | 'topleft' | Position the print button |
| portraitMode | boolean | true | Displays a portrait button |
| landscapeMode | boolean | true | Displays a landscape button |
| autoBounds | boolean | false | When we have any kind of layers on the map (except of Tiles), we will try to fit those layers |
| printLayer | [Leaflet tile layer](http://leafletjs.com/reference-0.7.7.html#tilelayer) | null | A tiles layer to show instead of all current active tile layers |

Here's an example of passing through some options.
``` js
L.browserPrint({
	title: 'Just print me!',
	printLayer: L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
					attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					maxZoom: 19
				}),
	autoBounds: true
}).addTo(map);
```

### Acknowledgements
Thanks to [Rowan Winsemius](https://github.com/rowanwins/leaflet-easyPrint) for general idea with a map print functionality.

Also thanks to [IcoMoon](http://icomoon.io/) for the print icon.
