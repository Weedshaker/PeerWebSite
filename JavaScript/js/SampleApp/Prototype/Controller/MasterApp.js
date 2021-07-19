/*jshint esnext: true */

import {WebRTC} from 'WebRTC/Classes/Controller/WebRTC.js';
import {HTML} from 'SampleApp/Classes/Domain/HTML.js';
import {WebTorrentSeeder} from 'WebTorrent/Classes/Domain/WebTorrentSeeder.js';
import {WebTorrentReceiver} from 'WebTorrent/Classes/Domain/WebTorrentReceiver.js';
import {IPFS} from 'IPFS/IPFS.js';
import {EncryptDecrypt} from 'EncryptDecrypt/EncryptDecrypt.js';
import {EditorSummernote} from 'Editor/Classes/Domain/EditorSummernote.js';
import {ServiceWorker} from 'ServiceWorker/ServiceWorker.js';

export class MasterApp {
	constructor(){
		this.isSender = !location.hash || (localStorage.getItem('channels') || '').includes(`[${location.hash}]`);
		this.WebRTC = new WebRTC();
		this.WebTorrentReceiver = new WebTorrentReceiver();
		this.WebTorrentSeeder = new WebTorrentSeeder();
		this.IPFS = new IPFS(this.isSender);
		this.EncryptDecrypt = new EncryptDecrypt();
		this.Editor = new EditorSummernote(this.WebTorrentSeeder, this.IPFS);
		this.HTML = new HTML(this.WebTorrentReceiver, this.WebTorrentSeeder, this.Editor, this.WebRTC, this.IPFS, this.EncryptDecrypt, this);
		this.ServiceWorker = new ServiceWorker(undefined, undefined, [this.WebTorrentReceiver.getBlobByFileName.bind(this.WebTorrentReceiver), this.WebTorrentSeeder.getBlobByFileName.bind(this.WebTorrentSeeder)], [this.IPFS.getBlobByFileCID.bind(this.IPFS)], [this.IPFS.pin.bind(this.IPFS)]);
		this.ServiceWorker.run();

		// hot-reloader clear all
		//if(window.sst && window.sst.isDebug){
			window.App = this;
		//}
	}
	createElements(name, isSender){
		return this.HTML.createElements(name, undefined, this.WebRTC.connection, isSender);
	}
}