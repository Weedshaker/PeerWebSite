/*jshint esnext: true */

import {MasterApp} from 'SampleApp/Prototype/Controller/MasterApp.js';

export class App extends MasterApp {
	constructor(){
		super();
	}
	createElements(name = 'open-or-join-room'){
		let htmlElements = super.createElements(name);
		let sendCont = htmlElements[0];
		this.receiveCont = htmlElements[1];
		this.WebTorrentReceiver.container = this.receiveCont[0]; // set the dom scope for the WebTorrent clients
		let button = htmlElements[2];
		this.Editor.add(sendCont);
		this.WebTorrentSeeder.container = sendCont[0].nextSibling.getElementsByClassName('note-editable')[0]; // dom scope not set for Seeder. 1: SummerNote changes the active container, 2: its only used at removeDeletedNodes
		
		const isViewerOnly = this.viewerOnly();
		this.WebRTC.api.isSender[0] = !isViewerOnly;
		// *** Events Triggert by DOM ***
		// openOrJoinEvent(roomid, message = '', elID = '')
		this.HTML.attachButtonEvent(button, sendCont, this.Editor.getData, this.WebRTC.api.openOrJoinEvent, !isViewerOnly);
		if (!isViewerOnly) {
			// sendEvent(message, elID = 'sst_all', remoteUserId = 'sst_toAll', requestID = '', options = new Map([['diffed', true], ['compressed', 'auto']])
			this.Editor.attachChangeEvent(sendCont, this.WebRTC.api.sendEvent);
			// *** Events Triggert by Connection ***
			// onNewParticipant.add(newMessageFunc, scope = this, args = []) ==> has to return [message = '', elID = '']
			this.WebRTC.api.onNewParticipant.add(function(remoteUserId){return [this.Editor.getData(), this.Editor.container[0].id];}, this);
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
				const data = this.Editor.getData();
				if (data.length >= 30 && location.hash && !location.hash.includes('magnet:')) localStorage.setItem(location.hash, data);
			});
		}
		// onReceive.add(newMessageFunc, scope = this, args = [])
		this.WebRTC.api.onReceive.add(function(dataPack){this.HTML.setData(this.receiveCont, dataPack);}, this);

		// connect by hash
		this.connectHash(false);
		window.addEventListener('hashchange', () => this.connectHash());
	}
	connectHash(reload = true){
		if (location.hash) {
			if (location.hash.includes('magnet:')) {
				const torrent = this.WebTorrentReceiver.add(location.hash.substr(1), undefined, undefined, undefined, undefined, torrent => {
					if (torrent.files && torrent.files[0] && torrent.files[0].name === 'peerWebSite') {
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
				$('#open-or-join-room').click();
			}
			if (reload && !(localStorage.getItem('channels') || '').includes(location.hash)) location.reload();
		}
	}
	viewerOnly(){
		if (location.hash) {
			if ((localStorage.getItem('channels') || '').includes(location.hash)) return false;
			// it is assumed that this is a viewer only
			$('#controls, #sender, .note-editor, .useWebTorrent').hide();
			$('body').addClass('viewer');
			return true;
		}
		return false;
	}
}