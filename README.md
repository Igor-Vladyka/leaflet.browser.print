## leaflet-browserPrint

A [leaflet](http://www.leafletjs.com) plugin which allows users to print the map directly from the browser. Compatible with all versions off Leaflet.js.

Check out the [DEMO](https://igor-vladyka.github.io/leaflet-browserPrint/).

### Usage
**Step 1.** Include the required js and css files in your document.

```html
	<link rel="stylesheet" href="dist/leaflet.browserPrint.css"/>
	<script src="dist/leaflet.browserPrint.js"></script>
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
| Portrait | boolean | true | Displays a portrait button |
| Landscape | boolean | true | Displays a landscape button |
| printLayer | [Leaflet tile layer](http://leafletjs.com/reference-0.7.7.html#tilelayer) | null | A tiles layer to show instead of all current active tile layers |

Here's an example of passing through some options.
``` js
L.browserPrint({
	title: 'Just print me!',
	Landscape: false,
    printLayer: L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'})
}).addTo(map);
```

### Acknowledgements
Thanks to [Rowan Winsemius](https://github.com/rowanwins/leaflet-easyPrint) for general idea with a map print functionality.

Also thanks to [IcoMoon](http://icomoon.io/) for the print icon.
