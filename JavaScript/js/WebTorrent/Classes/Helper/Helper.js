/*jshint esnext: true */

import {MasterHelper} from 'SharedHelper/Prototype/Helper/MasterHelper.js';

export class Helper extends MasterHelper {
	constructor() {
		super();

		this.saveData = (function () {
			const a = document.createElement('a');
			document.body.appendChild(a);
			a.style = 'display: none';
			return function (data, fileName) {
				const blob = new Blob([data || 'empty'], {type: 'plain/text'}),
					url = window.URL.createObjectURL(blob);
				a.href = url;
				a.download = fileName;
				a.click();
				window.URL.revokeObjectURL(url);
			};
		}());
		this.saveBlobUrl = (function () {
			const a = document.createElement('a');
			document.body.appendChild(a);
			a.style = 'display: none';
			return function (blobUrl, fileName) {
				a.href = blobUrl;
				a.download = fileName;
				a.click();
				window.URL.revokeObjectURL(blobUrl);
			};
		}());
	}
}