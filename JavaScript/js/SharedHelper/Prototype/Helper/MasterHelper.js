/*jshint esnext: true */

export class MasterHelper {
	constructor(){
		this.baseURL = window.sst && window.sst.karma ? window.sst.karma : location.host.includes('github') ? 'PeerWebSite/' : '';

		// helper node for saveData / saveUrl / saveBlobUrl
		if (!(this.a = document.querySelector('#downloadHelperLink'))) {
			this.a = document.createElement('a');
			this.a.setAttribute('id', 'downloadHelperLink')
			document.body.appendChild(this.a);
			this.a.style = 'display: none';
		}
	}
	addBaseURL(url = [], relative = true){
		let locOrigin = relative ? '.' : location.origin;
		return url.map((e) => {
			if (!this.baseURL && relative && e.includes('./')) return e;
			return `${locOrigin}/${location.host.includes('github') && relative ? '' : this.baseURL}${e.replace(':', '/')}`;
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
	/**
	 * creates id's from files (api Hook)
	 * 
	 * @param {FileList} files 
	 * @returns {number}
	 * @memberof Helper
	 */
	createFilesId(files){
		if (!files.length) return this.createFileId(files[0] || files);
		let str = 0;
		for(let file of files){
			str += this.createFileId(file);
		}
		return str;
	}
	/**
	 * creates id's from files (api Hook)
	 * 
	 * @param {File | FileList} file 
	 * @returns {number}
	 * @memberof Helper
	 */
	createFileId(file){
		return this.getHash(`${file.lastModified}${file.name}${file.size}`);
	}
	getHash(str){
		let hash = 0, i, chr;
		for(i = 0; i < str.length; i++){
			chr   = str.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return Math.abs(hash);
	}
	// save text
	saveText(text, fileName){
		this.saveBlob(new Blob([text || 'empty'], {type: 'plain/text'}), fileName);
	}
	saveBlob(blob, fileName){
		const url = window.URL.createObjectURL(blob);
		this.saveBlobUrl(url, fileName);
	}
	saveBlobUrl(blobUrl, fileName, revoke = true){
		this.saveUrl(blobUrl, fileName);
		if (revoke) window.URL.revokeObjectURL(blobUrl);
	}
	saveUrl(url, fileName){
		this.a.href = url;
		this.a.download = fileName;
		this.a.click();
	}
}