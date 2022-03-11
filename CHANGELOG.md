# Changelog

## [2.0.2] - 2022-03-11
- Fixed maxZoom validation on print when switching underlying layers dynamically. Now maxZoom will be used from printLayer if exists.
- Fixed map memory leak after printing. 

## [2.0.0] - 2020-11-06
### !!Breaking Changes!!
The complete code has changed! It's now more readable and more structured.

Now it is possible to use BrowserPrint without a Control.

### Added
- `L.browserPrint(map, options)`
- More options added:
  - `margin: {left: 10, top: 10, right: 10, bottom: 10`
  - `enableZoom`
  - `zoom`
  - `rotate`
  - `scale`
  - `orientation`
- `.cancel()` to stop printing
- `browser-print-cancel` event added
- NPM Scripts: `npm run build` and `npm run watch`
### Changed
- Changed the namespace from `L.Control.BrowserPrint` to `L.BrowserPrint`
- Default modes have to called now like: `L.BrowserPrint.Mode.Custom(pageSize, options)`
- Replaced in the example Leaflet-Draw with [Leaflet-Geoman](https://github.com/geoman-io/leaflet-geoman), a more modern drawing plugin

## [1.0.7] - 2020-08-30

### Added
- Added changelog :)
- Handled empty map printing in a correct way.

### Changed
- Fixed print button styling to comply with latest leaflet version.
