/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.BrowserPrint.Mode = L.Class.extend({
	options: {
		title: '',
		invalidateBounds: false,
		margin: {},
		enableZoom: true,
		zoom: 0,
		rotate: 0,
		scale: 1,
		orientation: '',
		pageSize: 'A4',
		pageSeries: '',
		pageSeriesSize: '',
		action: null,
		header: {
			enabled: false,
			text: "",
			size: "10mm",
			overTheMap: false,
		},
		footer: {
			enabled: false,
			text: "",
			size: "10mm",
			overTheMap: false,
		},
	},
	initialize: function (mode, options = {}) {
		if (!mode) {
			throw 'Print mode have to be set. Default modes: "Portrait", "Landscape", "Auto" or "Custom". The shortcut functions "L.BrowserPrint.Mode.Portrait" are preferred.';
		}

		this.mode = mode;
		this.setOptions(options);
	},
    setOptions: function(options){
        L.setOptions(this, options);

        if(!this.options.title){
            this.options.title = this.mode;
        }

        if(this.mode === "Portrait" || this.mode === "Landscape"){
            this.options.orientation = this.mode;
        }

        this.options.pageSize = (this.options.pageSize || 'A4').toUpperCase();
        this.options.pageSeries = ["A", "B", "C", "D"].indexOf(this.options.pageSize[0]) !== -1 ? this.options.pageSize[0] : "";
        this.options.pageSeriesSize = this.options.pageSize.substring(this.options.pageSeries.length);
        this.options.action = this.options.action || function (context, element) {
            return function () {
                context._printMode(element)
            };
        };
    }
});

L.browserPrint.mode = function(mode, options){
	return new L.BrowserPrint.Mode(mode,options);
};

L.BrowserPrint.Mode.Name = {
	Landscape: "Landscape",
	Portrait: "Portrait",
	Auto: "Auto",
	Custom: "Custom",
};


L.BrowserPrint.Mode.Portrait = function(pageSize, options = {}) {
	options.pageSize = pageSize;
	options.invalidateBounds = options.invalidateBounds === true || options.invalidateBounds === false ?  options.invalidateBounds : false;
	return new L.BrowserPrint.Mode(L.BrowserPrint.Mode.Name.Portrait, options);
};
L.BrowserPrint.Mode.Landscape = function(pageSize, options = {}) {
	options.pageSize = pageSize;
	options.invalidateBounds = options.invalidateBounds === true || options.invalidateBounds === false ?  options.invalidateBounds : false;
	return new L.BrowserPrint.Mode(L.BrowserPrint.Mode.Name.Landscape, options);
};
L.BrowserPrint.Mode.Auto = function(pageSize, options = {}) {
	options.pageSize = pageSize;
	options.invalidateBounds = options.invalidateBounds === true || options.invalidateBounds === false ?  options.invalidateBounds : true;
	return new L.BrowserPrint.Mode(L.BrowserPrint.Mode.Name.Auto, options);
};
L.BrowserPrint.Mode.Custom = function(pageSize, options = {}) {
	options.pageSize = pageSize;
	options.invalidateBounds = options.invalidateBounds === true || options.invalidateBounds === false ?  options.invalidateBounds : true;
	return new L.BrowserPrint.Mode(L.BrowserPrint.Mode.Name.Custom, options);
};
