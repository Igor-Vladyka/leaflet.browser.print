var path = require('path');
var webpack = require('webpack');
var PACKAGE = require('./package.json');
var banner = '\n ' + PACKAGE.name + ' - v' + PACKAGE.version + ' (' + PACKAGE.homepage +') ' +
             '\n ' + PACKAGE.description + '\n ' +
             '\n ' + PACKAGE.license +
             '\n (c) ' + new Date().getFullYear() + '  ' + PACKAGE.author + '\n';

module.exports = {
    entry: ['./src/leaflet.browser.print.js', './src/leaflet.browser.print.utils.js'],
    output: {
        filename: 'leaflet.browser.print.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.BannerPlugin(banner)
    ]
};
