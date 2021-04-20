/*jshint esnext: true */

import $ from 'jquery';
import {Dom} from 'Dom/Classes/Domain/Dom.js';

export class MasterHTML {
	constructor(WebTorrent){
		this.Dom = new Dom();
		this.WebTorrent = WebTorrent;
		// when properly solved, this should be removed, see TODO below
		this.someTorrentContainsVideo = false
	}
	removeElements(){
		this.idNames.forEach((e) => {
			$(`#${e}`).remove();
		});
	}
	getData(container){
		return container.html();
	}
	setData(container, dataPack, domDiffing = true){
		this.lastData = [container, dataPack];
		// don't dom diff if it is not already webrtc diffed, send empty string to set full html without dom diffing
		let oldMessage = domDiffing ? dataPack.result && dataPack.result.includes('receiveDiff:true') ? this.getData(container) : '' : '';
		this.WebTorrent.api.addByText(dataPack.message, [
			// trigger the following, when the worker returns with dataPack.message -> this.Dom.setData(container, oldMessage, dataPack.message);
			new Map([
				['function', this.Dom.setData],
				['scope', this],
				['attributes', [container, oldMessage]],
			]),
			new Map([
				['function', this.WebTorrent.api.removeDeletedNodes],
				['scope', this.WebTorrent],
				['attributes', [this.WebTorrent.api.container]], // needs to get this as attribute, eventhough default val, otherwise it gets overwritten by returned txt
			])
		], undefined, undefined, undefined, torrent => this.reTriggerSetData(torrent));
	}
	reTriggerSetData(torrent) {
		// re-trigger to set certain attributes like style on images after they were appended
		// TODO: Solve it properly by reading those attributes out at RegexWorker and set when torrent gets appended
		// TODO: this process breaks webtorrent video streaming, so only use it for none videos
		// WEBTORRENT pictures will be unformated when there is a video with this hack!!! Term: unformated, unresponsive webtorrent images
		if (torrent.sst_containsVideo) this.someTorrentContainsVideo = true;
		if (!this.someTorrentContainsVideo) {
			clearTimeout(this.reTriggerTimeOutID);
			this.reTriggerTimeOutID = setTimeout(() => {
				if (this.lastData) this.setData.apply(this, this.lastData);
			}, 1000);
		}
	}
	attachButtonEvent(button, sendCont, getDataFunc, event, send){
		button.on('click', () => {
			event($(`#${this.idNames[0]}`).val() || $(`#${this.idNames[0]}`).attr('placeholder'), getDataFunc(sendCont), this.idNames[2], send);
		});
	}
}