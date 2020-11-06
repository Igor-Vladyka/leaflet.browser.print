var path = require('path');
var webpack = require('webpack');
var PACKAGE = require('./package.json');
var banner = '\n ' + PACKAGE.name + ' - v' + PACKAGE.version + ' (' + PACKAGE.homepage +') ' +
             '\n ' + PACKAGE.description + '\n ' +
             '\n ' + PACKAGE.license +
             '\n (c) ' + new Date().getFullYear() + '  ' + PACKAGE.author + '\n';

var pluginFiles = ['./src/leaflet.browser.print.js', './src/leaflet.browser.print.control.js', './src/leaflet.browser.print.utils.js', './src/leaflet.browser.print.sizes.js', './src/leaflet.browser.print.modes.js', './src/leaflet.browser.print.helpers.js'];

module.exports = [
	{
		mode: "development",
		entry: {
		    "leaflet.browser.print": pluginFiles,
		},
		output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') },
	    plugins: [
	        new webpack.BannerPlugin(banner)
	    ]
	},
	{
		mode: "production",
		entry: {
		    "leaflet.browser.print.min": pluginFiles,
		},
		output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') },
	    plugins: [
	        new webpack.BannerPlugin(banner)
	    ]
	}
];
