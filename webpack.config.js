var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/leaflet.browser.print.js',
    output: {
        filename: 'leaflet.browser.print.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
