/*jshint esnext: true */

import {MasterWebTorrent} from 'WebTorrent/Prototype/Domain/MasterWebTorrent.js';

export class WebTorrentSeeder extends MasterWebTorrent {
	constructor(container){
		super(container);
		// onerror node error handling global
		this.appended_onerror = 'window.sst_WebTorrentSeeder_blobsRefresh';
		window.sst_WebTorrentSeeder_blobsRefresh = this.blobsRefresh.bind(this);

		// hooks
		this.api = Object.assign(
			this.api, 
			{
				/**
				 * seed (upload) (api hook)
				 * 
				 * @param {File | FileList} files 
				 * @param {string} text 
				 * @param {HtmlNode} node 
				 * @param {Object} [seedOpts=this.seedOpts] 
				 * @param {Object} appendToOpts 
				 * @param {Function} [seedCallback=(torrent) => {return this.appendTo(text, appendToOpts, appendToCallback, torrent);}] 
				 * @param {Function} appendToCallback 
				 * @returns 
				 * @memberof MasterWebTorrent
				 */
				seed: this.seed.bind(this),
				/**
				 * Check if torrents are still loading
				 * 
				 * @returns boolean
				 * @memberof MasterWebTorrent
				 */
				areTorrentsLoading: this.areTorrentsLoading.bind(this)
			}
		);
	}
}