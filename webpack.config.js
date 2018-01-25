var path = require('path');
var webpack = require('webpack');
var PACKAGE = require('./package.json');
var banner = '\n ' + PACKAGE.name + ' - v' + PACKAGE.version + ' (' + PACKAGE.homepage +') ' +
             '\n ' + PACKAGE.description + '\n ' +
             '\n ' + PACKAGE.license +
             '\n (c) ' + new Date().getFullYear() + '  ' + PACKAGE.author + '\n';

module.exports = {
	entry: {
	    "leaflet.browser.print": ['./src/leaflet.browser.print.js', './src/leaflet.browser.print.utils.js'],
	    "leaflet.browser.print.min": ['./src/leaflet.browser.print.js', './src/leaflet.browser.print.utils.js'],
	},
	output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
	      include: /\.min\.js$/,
	      minimize: true
	    }),
        new webpack.BannerPlugin(banner)
    ]
};
