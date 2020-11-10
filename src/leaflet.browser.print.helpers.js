/**
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)
**/

L.BrowserPrint.Helper = {
	getPageMargin: function (mode,type) {
		var margin = mode.options.margin;
		var size = this.getPaperSize(mode);
		var marginInMm = ((size.Width + size.Height) / 39.9);
		if (!type && type !== 0) {
			type = "";
		}

		if (margin >= 0) {
			margin = {
				top: margin,
				right: margin,
				bottom: margin,
				left: margin
			}
		} else if (!margin) {
			margin = {};
		}

		var faktor = 1;
		if (type === "in") {
			faktor = 25.4;
		}

		var topMargin = margin.top >= 0 ? margin.top : marginInMm;
		var rightMargin = margin.right >= 0 ? margin.right : marginInMm;
		var bottomMargin = margin.bottom >= 0 ? margin.bottom : marginInMm;
		var leftMargin = margin.left >= 0 ? margin.left : marginInMm;


		var top = (topMargin / faktor).toFixed(2) + type;
		var right = (rightMargin / faktor).toFixed(2) + type;
		var bottom = (bottomMargin / faktor).toFixed(2) + type;
		var left = (leftMargin / faktor).toFixed(2) + type;

		return {
			top,
			right,
			bottom,
			left
		};
	},
	getPaperSize: function (mode) {
		if (mode.options.pageSeries) {
			var series = L.BrowserPrint.Size[mode.options.pageSeries];
			var w = series.Width;
			var h = series.Height;
			var switchSides = false;
			if (mode.options.pageSeriesSize && mode.options.pageSeriesSize !== '0') {
				mode.options.pageSeriesSize = +mode.options.pageSeriesSize;
				switchSides = mode.options.pageSeriesSize % 2 === 1;
				if (switchSides) {
					w = w / (mode.options.pageSeriesSize - 1 || 1);
					h = h / (mode.options.pageSeriesSize + 1);
				} else {
					w = w / mode.options.pageSeriesSize;
					h = h / mode.options.pageSeriesSize;
				}
			}

			return {
				Width: switchSides ? h : w,
				Height: switchSides ? w : h
			};
		} else {
			var size = L.BrowserPrint.Size[mode.options.pageSeriesSize];
			return {
				Width: size.Width,
				Height: size.Height
			};
		}
	},
	getSize: function (mode, orientaion = 'Portrait') {
		var size = this.getPaperSize(mode);
		var pageMargin = this.getPageMargin(mode, 0);

		var topbottom = orientaion === 'Portrait' ? parseFloat(pageMargin.top) + parseFloat(pageMargin.bottom) : parseFloat(pageMargin.left) + parseFloat(pageMargin.right);
		var leftright = orientaion === 'Portrait' ? parseFloat(pageMargin.left) + parseFloat(pageMargin.right) : parseFloat(pageMargin.top) + parseFloat(pageMargin.bottom);

		var height = Math.floor(size.Height - topbottom);
		var width = Math.floor(size.Width - leftright);

		size.Width = width * (window.devicePixelRatio || 1) + 'mm';
		size.Height = height * (window.devicePixelRatio || 1) + 'mm';

		return size;
	}
};

