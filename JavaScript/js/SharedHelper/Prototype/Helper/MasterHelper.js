/*jshint esnext: true */

export class MasterHelper {
	constructor(){
		this.baseURL = window.sst && window.sst.karma ? window.sst.karma : '';
	}
	addBaseURL(url = [], relative = true){
		let locOrigin = relative ? '.' : location.origin;
		return url.map((e) => {
			if (!this.baseURL && relative && e.includes('./')) return e;
			return `${locOrigin}/${this.baseURL}${e.replace(':', '/')}`;
		});
	}
	getRandomString() {
		if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
			var a = window.crypto.getRandomValues(new Uint32Array(3)),
			token = '';
			for (var i = 0, l = a.length; i < l; i++) {
				token += a[i].toString(36);
			}
			return token;
		} else {
			return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
		}
	}
}