/*jshint esnext: true */

import {MasterOption} from 'SharedHelper/Prototype/Helper/MasterOption.js';
import {RegexWorker} from 'WebTorrent/Classes/Helper/RegexWorker.js';

export class OptionRegex extends MasterOption {
	constructor(WebTorrent, client, returnMap, addByTextReturn){
		super(returnMap);

		this.WebTorrent = WebTorrent;
		this.client = client;
		this.addByTextReturn = addByTextReturn;
		// workers
		this.RegexWorker = new RegexWorker();
		// this.RegexWorker.workers[0]
		this.RegexWorker.create(
			this.RegexWorker.getMagnetURL,
			(result) => {
				this.returnApply('getMagnetURL', result);
			}
		);
		// this.RegexWorker.workers[1]
		this.RegexWorker.create(
			this.RegexWorker.replaceBlobURL,
			(result) => {
				this.returnApply('replaceBlobURL', result);
			}
		);
		// this.RegexWorker.workers[2]
		this.RegexWorker.create(
			this.RegexWorker.addProgressBar,
			(result) => {
				this.returnApply('addProgressBar', result);
			}
		);
	}
	getMagnetURL(txt = '', attributes, workerID = 1){
		this.RegexWorker.run([txt, attributes, workerID]);
		return true;
	}
	mapFoundMagnetURL(data){
		// data = [[txt, [attributes, classes], workerID], [[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]
		// check if torrent exists
		let magnetURLs = data[1], nonExistingTorrents = [], inProgressTorrents = [], downloadedTorrents = [];
		// let in
		magnetURLs.forEach(e => {
			let torrent = this.client.get(e[1][0]);
			if(torrent){
				this.WebTorrent.findAllLocalBlobs(torrent);
				if (torrent.sst_localBlobs.length > 0){
					e[1][1][1] = torrent.sst_localBlobs;
					e[1][1][2] = torrent.sst_onerror;
					if (downloadedTorrents.indexOf(e) === -1) downloadedTorrents.push(e);
				}else{
					if (inProgressTorrents.indexOf(e) === -1) inProgressTorrents.push(e);
				}
			}else{
				if (nonExistingTorrents.indexOf(e) === -1) nonExistingTorrents.push(e);
			}
		});
		data[1] = [nonExistingTorrents, inProgressTorrents, downloadedTorrents]; // [nonExistingTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]], inProgressTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]], downloadedTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]]
		this.returnApply('mapFoundMagnetURL', [data]);
	}
	replaceBlobURL(data){
		// downloadedTorrents replace remoteBlobs with localBlobs
		// data[1][2] = downloadedTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]
		this.RegexWorker.run(data, this.RegexWorker.workers[1], this.RegexWorker.callbacks[1]);
		return true;
	}
	addProgressBar(data){
		// data[1][0] = nonExistingTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]
		// data[1][1] = inProgressTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]
		this.RegexWorker.run(data, this.RegexWorker.workers[2], this.RegexWorker.callbacks[2]);
		return true;
	}
	addTorrent(data){
		let workerID = data[0][2]
		// nonExistingTorrents
		// !!! IMPORTANT !!! gets executed at _resultAddByText -> this appendto function must be executed after the new text has been applied to dom and settled for 100ms otherwise nodes get mixed up -> see appendTo workaround bug
		let returnAndOptions = this.addByTextReturn.get(workerID); // [arrayReturnMap, [addOpts, appendToOpts, addCallback, appendToCallback]]
		if (returnAndOptions) returnAndOptions[0].push(
			new Map([
				['function', function(){
					// data[1][0] = nonExistingTorrents[[id, [magnetURL, [remoteBlobs, localBlobs, onerror], TagName]]]
					data[1][0].forEach((nonExistingTorrent) => {
						let torrent = this.WebTorrent.add(nonExistingTorrent[1][0].replace(/amp;/g, ''), nonExistingTorrent[0], undefined, returnAndOptions[1][0], returnAndOptions[1][1], /* addCallback */ typeof returnAndOptions[1][2] === 'function' ? torrent => {
								setTimeout(() => {
									returnAndOptions[1][2](torrent);
								}, 100);
							} : 100, returnAndOptions[1][3]);
							if (torrent) torrent.sst_remoteBlobs = nonExistingTorrent[1][1][0];
						});
				}],
				['scope', this],
				['attributes', []],
			])
		);
		this.returnApply('addTorrent', [data]);
	}
}