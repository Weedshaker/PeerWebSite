/*jshint esnext: true */

import {MasterWebTorrent} from 'WebTorrent/Prototype/Domain/MasterWebTorrent.js';
import {ProgressBar} from 'WebTorrent/Classes/Helper/ProgressBar.js';

export class WebTorrentReceiver extends MasterWebTorrent {
	constructor(container){
		super(container);

		this.ProgressBar = new ProgressBar(this.torrents, this.add.bind(this), this.remove.bind(this));
		// onerror node error handling global
		this.appended_onerror = 'window.sst_WebTorrentReceiver_blobsRefresh';
		window.sst_WebTorrentReceiver_blobsRefresh = this.blobsRefresh.bind(this);

		// hooks
		this.api = Object.assign(
			this.api,
			{
				/**
				 * Searching text for torrents to add
				 * 
				 * @param {string} txt 
				 * @param {Map([['function', Function], ['scope', Object], ['attributes', []])} arrayReturnMap
				 * @param {Object} addOpts 
				 * @param {Object} appendToOpts 
				 * @param {Function} addCallback 
				 * @param {Function} appendToCallback 
				 * @memberof MasterWebTorrent
				 */
				addByText: this.addByText.bind(this)
			}
		);
	}
	// called only on new torrent INIT (once only)
	// 1) add find node which trigger this torrent to be added
	appendTo(text, appendToOpts, appendToCallback, torrent){
		this.findAllNodes(torrent);
		super.appendTo(text, appendToOpts, appendToCallback, torrent);
	}
	// 2) after delay file.appendTo make sure to once more search for more nodes
	appended(torrent, appendToCallback){
		this.findAllNodes(torrent);
		super.appended(torrent, appendToCallback);
		if (!this.areTorrentsLoading()) this.ProgressBar.end();
	}
	// loading (progressbar) hooks
	add(magnetURL, id, node, addOpts, appendToOpts, addCallback, appendToCallback){
		let torrent = super.add(magnetURL, id, node, addOpts, appendToOpts, addCallback, appendToCallback);
		this.findAllNodes(torrent); // to have nodes where the progressbar can attach to
		this.ProgressBar.start();
		return torrent;
	}
}