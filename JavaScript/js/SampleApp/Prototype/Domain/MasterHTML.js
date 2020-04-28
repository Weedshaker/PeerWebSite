/*jshint esnext: true */

import $ from 'jquery';
import {Dom} from 'Dom/Classes/Domain/Dom.js';

export class MasterHTML {
	constructor(WebTorrent){
		this.Dom = new Dom();
		this.WebTorrent = WebTorrent;
	}
	removeElements(){
		this.idNames.forEach((e) => {
			$(`#${e}`).remove();
		});
	}
	getData(container){
		return container.html();
	}
	setData(container, dataPack){
		let oldMessage = this.getData(container);
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
		]);
	}
	attachButtonEvent(button, sendCont, getDataFunc, event){
		button.on('click', () => {
			event($(`#${this.idNames[0]}`).val(), getDataFunc(sendCont), this.idNames[2]);
		});
	}
}