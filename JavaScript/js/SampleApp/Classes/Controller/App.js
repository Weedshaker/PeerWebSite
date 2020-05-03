/*jshint esnext: true */

import {MasterApp} from 'SampleApp/Prototype/Controller/MasterApp.js';

export class App extends MasterApp {
	constructor(){
		super();
	}
	createElements(name = 'open-or-join-room'){
		const isSender = !location.hash || (localStorage.getItem('channels') || '').includes(`[${location.hash}]`);
		this.isSender = isSender;
		this.originalHash = location.hash;
		let htmlElements = super.createElements(name, isSender);
		let sendCont = htmlElements[0];
		this.receiveCont = htmlElements[1];
		let button = htmlElements[2];
		this.Editor.add(sendCont); // initiate before .WebTorrentSeeder.container 
		this.WebTorrentReceiver.container = this.receiveCont[0]; // set the dom scope for the WebTorrent clients
		this.WebTorrentReceiver.addByText(this.WebTorrentReceiver.container.innerHTML, [
			// trigger the following, when the worker returns with dataPack.message -> this.Dom.setData(container, oldMessage, dataPack.message);
			new Map([
				['function', ()=>{}],
				['scope', this],
				['attributes', ['none']],
			])
		]);
		this.WebTorrentSeeder.container = sendCont[0].nextSibling.getElementsByClassName('note-editable')[0]; // dom scope not set for Seeder. 1: SummerNote changes the active container, 2: its only used at removeDeletedNodes
		this.WebTorrentSeeder.addByText(this.WebTorrentSeeder.container.innerHTML, [
			// trigger the following, when the worker returns with dataPack.message -> this.Dom.setData(container, oldMessage, dataPack.message);
			new Map([
				['function', ()=>{}],
				['scope', this],
				['attributes', ['none']],
			])
		]);
		this.setReceiverOrSender(isSender);
		
		this.WebRTC.api.isSender[0] = isSender;
		// *** Events Triggert by DOM ***
		// openOrJoinEvent(roomid, message = '', elID = '')
		this.HTML.attachButtonEvent(button, sendCont, this.Editor.getData, this.WebRTC.api.openOrJoinEvent, isSender);
		if (isSender) {
			// Seeder/Sender
			// sendEvent(message, elID = 'sst_all', remoteUserId = 'sst_toAll', requestID = '', options = new Map([['diffed', true], ['compressed', 'auto']])
			this.Editor.attachChangeEvent(sendCont, this.WebRTC.api.sendEvent);
			// *** Events Triggert by Connection ***
			// onNewParticipant.add(newMessageFunc, scope = this, args = []) ==> has to return [message = '', elID = '']
			this.WebRTC.api.onNewParticipant.add(function(remoteUserId){return [this.Editor.getData(), this.Editor.container[0].id];}, this);
			// expose download all torrents to global scope
			window.getAllTorrents = this.WebTorrentSeeder.api.getAllTorrents;
		} else {
			// Receiver
			// expose download all torrents to global scope
			window.getAllTorrents = this.WebTorrentReceiver.api.getAllTorrents;
		}
		// onReceive.add(newMessageFunc, scope = this, args = [])
		this.WebRTC.api.onReceive.add(function(dataPack){this.HTML.setData(this.receiveCont, dataPack);}, this);
		// reconnect on tab focus
		let visibilityTimeOutID = null;
		document.addEventListener('visibilitychange', () => {
			clearTimeout(visibilityTimeOutID);
			visibilityTimeOutID = setTimeout(() => {
				if (document.visibilityState === 'visible' && location.hash) {
					$('#open-or-join-room').click();
				}
			}, 200);
		});
		// save
		window.addEventListener('beforeunload', (e) => {
			/*
			// Cancel the event
			e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
			// Chrome requires returnValue to be set
			e.returnValue = '';
			*/
			// persist site
			const hash = this.originalHash || location.hash;
			const data = isSender ? this.Editor.getData() : this.receiveCont[0].innerHTML;
			if (data.length >= 30 && hash && !hash.includes('magnet:')) localStorage.setItem(hash, data);
		});
		// connect by hash
		this.connectHash(false);
		window.addEventListener('hashchange', () => this.connectHash());
	}
	connectHash(reload = true){
		if (location.hash) {
			if (reload && (!(localStorage.getItem('channels') || '').includes(`[${location.hash}]`) || !this.isSender)) {
				location.reload();
			} else if (location.hash.includes('magnet:')) {
				const torrent = this.WebTorrentReceiver.add(location.hash.substr(1), undefined, undefined, undefined, undefined, torrent => {
					if (torrent.files && torrent.files[0] && torrent.files[0].name.includes('peerWebSite')) {
						torrent.files[0].getBlob((err, blob) => {
							const reader = new FileReader();
							reader.onload = (reader => {
								return () => {
									const contents = reader.result;
									this.HTML.setData(this.receiveCont, {message:contents});
								}
							})(reader);
							reader.readAsText(blob);
						});
					} else {
						$('#receiver').text('An Error occured!');
					}
					this.WebTorrentReceiver.findAllNodes(torrent);
					if (!this.WebTorrentReceiver.areTorrentsLoading()) this.WebTorrentReceiver.ProgressBar.end();
				});
				const progressBarNode = document.createElement('span');
				$('#receiver').html(progressBarNode);
				torrent.sst_nodes = [progressBarNode];
				torrent.sst_id = 'peerWebSite';
				this.WebTorrentReceiver.findAllNodes(torrent); // to have nodes where the progressbar can attach to
				this.WebTorrentReceiver.ProgressBar.start();
			} else {
				$('#txt-roomid').val(location.hash.substr(1));
				// don't change on button click change hash, since this double triggers
				if (this.originalHash === location.hash) $('#open-or-join-room').click();
				this.originalHash = location.hash;
			}
		}
	}
	setReceiverOrSender(isSender){
		if (!isSender) {
			// it is assumed that this is a viewer only
			$('#controls, #sender, .note-editor, .useWebTorrent').hide();
			$('body').addClass('viewer');
			return true;
		}
	}
}