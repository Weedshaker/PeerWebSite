/*jshint esnext: true */

import {MasterApp} from 'SampleApp/Prototype/Controller/MasterApp.js';

export class App extends MasterApp {
	constructor(){
		super();
	}
	createElements(name = 'open-or-join-room'){
		this.isSender = !location.hash || (localStorage.getItem('channels') || '').includes(`[${location.hash}]`);
		document.body.setAttribute('isSender', this.isSender);
		this.checkHashType(location.hash); // sets attribute for hash type magnet, ipfs, webrtc
		this.originalHash = location.hash;
		let htmlElements = super.createElements(name, this.isSender);
		let sendCont = htmlElements[0];
		this.receiveCont = htmlElements[1];
		let button = htmlElements[2]; // WebRTC Button
		this.counterWebTorrent = htmlElements[3];

		this.Editor.add(sendCont); // initiate before .WebTorrentSeeder.container 
		this.WebTorrentReceiver.container = this.receiveCont[0]; // set the dom scope for the WebTorrent clients
		// reactivating torrents from save has strange sideeffects
		/*this.WebTorrentReceiver.addByText(this.WebTorrentReceiver.container.innerHTML, [
			// trigger the following, when the worker returns with dataPack.message -> this.Dom.setData(container, oldMessage, dataPack.message);
			new Map([
				['function', ()=>{}],
				['scope', this],
				['attributes', ['none']],
			])
		]);*/
		this.WebTorrentSeeder.container = sendCont[0].nextSibling.getElementsByClassName('note-editable')[0]; // dom scope not set for Seeder. 1: SummerNote changes the active container, 2: its only used at removeDeletedNodes
		// reactivating torrents from save has strange sideeffects
		/*this.WebTorrentSeeder.addByText(this.WebTorrentSeeder.container.innerHTML, [
			// trigger the following, when the worker returns with dataPack.message -> this.Dom.setData(container, oldMessage, dataPack.message);
			new Map([
				['function', ()=>{}],
				['scope', this],
				['attributes', ['none']],
			])
		]);*/
		this.setReceiverOrSender(this.isSender);
		
		this.WebRTC.api.isSender[0] = this.isSender;
		// *** Events Triggert by DOM ***
		// openOrJoinEvent(roomid, message = '', elID = '')
		this.HTML.attachButtonEvent(button, sendCont, this.Editor.getData, this.WebRTC.api.openOrJoinEvent, this.isSender);
		if (this.isSender) {
			// Seeder/Sender
			// sendEvent(message, elID = 'sst_all', remoteUserId = 'sst_toAll', requestID = '', options = new Map([['diffed', true], ['compressed', 'auto']])
			this.Editor.attachChangeEvent(sendCont, this.WebRTC.api.sendEvent);
			// *** Events Triggert by Connection ***
			// onNewParticipant.add(newMessageFunc, scope = this, args = []) ==> has to return [message = '', elID = '']
			this.WebRTC.api.onNewParticipant.add(function(remoteUserId){return [this.Editor.getData(), this.Editor.container[0].id];}, this);
			// expose download all torrents to global scope
			window.getAllTorrents = this.WebTorrentSeeder.api.getAllTorrents;
			window.getAllTorrentFiles = this.WebTorrentSeeder.api.getAllTorrentFiles;
		} else {
			// Receiver
			// expose download all torrents to global scope
			window.getAllTorrents = this.WebTorrentReceiver.api.getAllTorrents;
			window.getAllTorrentFiles = this.WebTorrentReceiver.api.getAllTorrentFiles;
		}
		// onReceive.add(newMessageFunc, scope = this, args = [])
		this.WebRTC.api.onReceive.add(function(dataPack){this.HTML.setData(this.receiveCont, dataPack);}, this);
		// reconnect on tab focus
		let visibilityTimeOutID = null;
		document.addEventListener('visibilitychange', () => {
			clearTimeout(visibilityTimeOutID);
			visibilityTimeOutID = setTimeout(() => {
				// check if active webrtc session
				if (document.visibilityState === 'visible' && this.checkHashType(location.hash) === 'webrtc') {
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
			const data = this.isSender ? this.Editor.getData() : this.receiveCont[0].innerHTML;
			this.HTML.saveData(hash, data);
		});
		// online / offline
		const onlineOffline = event => {
			if (navigator.onLine) {
				$('.offline').hide();
			} else {
				$('.offline').show();
			}
		};
		onlineOffline();
		window.addEventListener('online', onlineOffline);
  		window.addEventListener('offline', onlineOffline);
		// connect by hash
		this.connectHash(false);
		window.addEventListener('hashchange', () => this.connectHash());
	}
	connectHash(reload = true){
		// logic for receiver
		if (!this.isSender) {
			// triggered by hashchange
			if (reload) {
				location.reload();
			// manually triggered
			} else if (this.checkHashType(location.hash) === 'magnet') {
				const torrent = this.WebTorrentReceiver.add(location.hash.substr(1), undefined, undefined, undefined, undefined, torrent => {
					if (torrent.files && torrent.files[0] && torrent.files[0].name.includes('peerWebSite')) {
						torrent.files[0].getBlob((err, blob) => {
							const reader = new FileReader();
							reader.onload = (reader => {
								return () => {
									const contents = reader.result;
									this.HTML.setData(this.receiveCont, {message:contents}, false);
									this.HTML.setTitle(this.HTML.getFirstText(contents));
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
				const webTorrentCounterID = setInterval(() => {
					this.counterWebTorrent[0].textContent = `[${torrent.numPeers} peer${torrent.numPeers === 1 ? '' : 's'}]`;
				}, 1000);
				this.WebTorrentReceiver.client.on('error', () => {
					clearInterval(webTorrentCounterID);
					this.counterWebTorrent[0].textContent = `[ERROR! Please, reload.]`;
				});
				torrent.sst_id = 'peerWebSite';
				if (!localStorage.getItem(location.hash)) {
					const progressBarNode = document.createElement('span');
					$('#receiver').html(progressBarNode);
					torrent.sst_nodes = [progressBarNode];
					this.WebTorrentReceiver.findAllNodes(torrent); // to have nodes where the progressbar can attach to
					this.WebTorrentReceiver.ProgressBar.start();
				}
				$('.headerReceiver > .counterWebRTC').hide();
			} else if (this.checkHashType(location.hash) === 'ipfs') {
				const cid = location.hash.substr(6);
				this.IPFS.raceFetchVsCat(cid, 'text', '?filename=peerWebSite.txt').then(text => {
					this.IPFS.pinCid(cid);
					this.HTML.setData(this.receiveCont, {message: text});
					this.HTML.setTitle(this.HTML.getFirstText(text));
				}).catch(error => $('#receiver').text(`An Error occured! ${error}`));
				$('.headerReceiver > .counterWebRTC').hide();
				$('.headerReceiver > .counterWebTorrent').hide();
			} else {
				$('#txt-roomid').val(location.hash.substr(1));
				// don't change on button click change hash, since this double triggers
				if (this.originalHash === location.hash) $('#open-or-join-room').click();
				this.originalHash = location.hash;
				$('.headerReceiver > .counterWebTorrent').hide();
			}
		// logic for sender
		} else if (reload && location.hash && !(localStorage.getItem('channels') || '').includes(`[${location.hash}]`)) {
			location.reload();
		} else if (this.checkHashType(location.hash) === 'ipfs') {
			if (this.Editor.getData().length < 12) this.Editor.setData(undefined, this.HTML.loadingAnimation, 'code')
			const cid = location.hash.substr(6);
			this.IPFS.raceFetchVsCat(cid, 'text', '?filename=peerWebSite.txt').then(text => {
				this.IPFS.pinCid(cid);
				this.Editor.setData(undefined, text, 'code');
				this.HTML.setTitle();
			}).catch(error => $('#sender').text(`An Error occured! ${error}`));
		}
	}
	setReceiverOrSender(isSender){
		if (!isSender) {
			// it is assumed that this is a viewer only
			$('#controls, #sender, .note-editor, .mui-btn').hide();
			$('body').addClass('viewer');
			return true;
		}else {
			$('.headerReceiver').hide();
		}
	}
	checkHashType(hash = location.hash){
		if (!hash) {
			document.body.removeAttribute('type');
			return false;
		}
		if (hash.includes('magnet:')) {
			document.body.setAttribute('type', 'magnet');
			return 'magnet'; // WebTorrent
		}
		if (hash.includes('ipfs:')) {
			document.body.setAttribute('type', 'ipfs');
			return 'ipfs'; // IPFS
		}
		document.body.setAttribute('type', 'webrtc');
		return 'webrtc'
	}
}