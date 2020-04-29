/*jshint esnext: true */

import {MasterApp} from 'SampleApp/Prototype/Controller/MasterApp.js';

export class App extends MasterApp {
	constructor(){
		super();
	}
	createElements(name = 'open-or-join-room'){
		let htmlElements = super.createElements(name);
		let sendCont = htmlElements[0];
		let receiveCont = htmlElements[1];
		this.WebTorrentReceiver.container = receiveCont[0]; // set the dom scope for the WebTorrent clients
		let button = htmlElements[2];
		this.Editor.add(sendCont);
		this.WebTorrentSeeder.container = sendCont[0].nextSibling.getElementsByClassName('note-editable')[0]; // dom scope not set for Seeder. 1: SummerNote changes the active container, 2: its only used at removeDeletedNodes
		// *** Events Triggert by DOM ***
		// openOrJoinEvent(roomid, message = '', elID = '')
		this.HTML.attachButtonEvent(button, sendCont, this.Editor.getData, this.WebRTC.api.openOrJoinEvent);
		// sendEvent(message, elID = 'sst_all', remoteUserId = 'sst_toAll', requestID = '', options = new Map([['diffed', true], ['compressed', 'auto']])
		if (!this.viewerOnly()) this.Editor.attachChangeEvent(sendCont, this.WebRTC.api.sendEvent);
		// *** Events Triggert by Connection ***
		// onNewParticipant.add(newMessageFunc, scope = this, args = []) ==> has to return [message = '', elID = '']
		this.WebRTC.api.onNewParticipant.add(function(remoteUserId){return [this.Editor.getData(), this.Editor.container[0].id];}, this);
		// onReceive.add(newMessageFunc, scope = this, args = [])
		this.WebRTC.api.onReceive.add(function(dataPack){this.HTML.setData(receiveCont, dataPack);}, this);

		// connect by hash
		this.connectHash();
		window.addEventListener('hashchange', this.connectHash);
		$('#txt-roomid').focus();
	}
	connectHash(){
		if (location.hash) {
			$('#txt-roomid').val(location.hash.substr(1));
			$('#open-or-join-room').click();
		}
	}
	viewerOnly(){
		if (location.hash) {
			// it is assumed that this is a viewer only
			$('#controls, #sender, .note-editor').hide();
			$('body').addClass('viewer');
			return true;
		}
		return false;
	}
}