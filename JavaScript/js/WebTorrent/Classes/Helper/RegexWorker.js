/*jshint esnext: true */

import {MasterWorker} from 'SharedHelper/Prototype/Helper/MasterWorker.js';

export class RegexWorker extends MasterWorker {
	constructor(){
		super(false);

		this.name = 'RegexWorker';
	}
	getMagnetURL(data){
		let txt = data[0], attributes = data[1][0]; // [txt, [attributes, classes], workerID]
		// regex grabs id, [magnetURL and tagName] (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#Parameters)
		// attributes = ['data-id', 'data-magnetURL', 'data-blobs', 'onerror']
		const re = new RegExp(`<(\\w*?)\\s[^<>]*?${attributes[0]}="(\\d*?)"[^<>]*?${attributes[1]}="([^"]*?)"[^<>]*?${attributes[2]}="([^"]*?)"`, 'gui');
		let match = null;
		let magnetURLs = [];
		while(match = re.exec(txt)){
			let id = match[2]; // id
			let val = [match[3], [match[4].split(','), [/* localBlob */]], match[1]]; // magnetURL, blob's, TagName
			magnetURLs.push([id, val]);
		}
		return [[data, magnetURLs]]; // MasterOption.returnApply needs to receive it wrapped in an array
	}
	replaceBlobURL(data){
		// [[txt, [attributes, classes], workerID], [nonExistingTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]], inProgressTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]], downloadedTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]]]
		let txt = data[0][0], attributes = data[0][1][0], downloadedTorrents = data[1][2];
		// with tag name grab innerHTML
		downloadedTorrents.forEach(e => {
			let id = e[0], remoteBlobs = e[1][1][0], localBlobs = e[1][1][1], onerror = e[1][1][2];
			if(remoteBlobs.length === localBlobs.length){
				for(let i = 0; i < remoteBlobs.length; i++) {
					const re = new RegExp(`${remoteBlobs[i].replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&')}`, 'g'); // escape special characters
					txt = txt.replace(re, localBlobs[i]);
				}
			}else{
				console.warn('remoteBlobs and localBlobs length is uneven:', data);
			}
			// replace onerror
			// attributes = ['data-id', 'data-magnetURL', 'data-blobs', 'onerror']
			const re = new RegExp(`${attributes[3]}="[^"]*?${id}[^"]*?"`, 'gui');
			// classes = ['webTorrent', 'blobLoading', 'torrentLoading']
			txt = txt.replace(re, `${attributes[3]}="${onerror}"`);
		});
		data[0][0] = txt;
		return [data]; // MasterOption.returnApply needs to receive it wrapped in an array
	}
	addProgressBar(data) {
		// [[txt, [attributes, classes], workerID], [nonExistingTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]], inProgressTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]], downloadedTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]]]
		let txt = data[0][0], attributes = data[0][1][0], classes = data[0][1][1], inProgressTorrents = data[1][0].concat(data[1][1]); // nonExistingTorrents + inProgressTorrents;
		// also empty innerHTML
		inProgressTorrents.forEach(e => {
			let id = e[0], val = e[1]; // [[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]
			const re = new RegExp(`(<${val[2]}\\s[^<>]*?class=")[^"]*?("[^<>]*?${attributes[0]}="${id}"[^<>]*?>).*?(<\/${val[2]}>)`, 'gui');
			// classes = ['webTorrent', 'blobLoading', 'torrentLoading']
			txt = txt.replace(re, `$1${classes[0]} ${classes[2]}$2$3`);
		});
		data[0][0] = txt;
		return [data]; // MasterOption.returnApply needs to receive it wrapped in an array
	}
}