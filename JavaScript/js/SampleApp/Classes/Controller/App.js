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
			// force DOM to update once receiving connect
			if (!this.isSender && this.checkHashType(location.hash) === 'magnet') {
				this.WebTorrentReceiver.container.querySelectorAll('[src]').forEach(element => (element.src += `?${Date.now()}`));
				this.WebTorrentReceiver.container.querySelectorAll('[href]').forEach(element => (element.href += `?${Date.now()}`));
			}
			const data = this.isSender ? this.Editor.getData() : this.receiveCont[0].innerHTML;
			this.HTML.saveData(hash, data);
		});
		// ******************************************************************
		// below has to be moved into a shared player object*****************
		const checkEvent = event => event.target && event.target.controls;
		const querySelectorAllControls = () => Array.from(document.querySelectorAll('[controls]'));
		const querySelectorAllReadyControls = () => querySelectorAllControls().filter(media => media.readyState >= 1); // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
		const setVolumeAll = (volume = Number(localStorage.getItem('lastVolume') || 1)) => {
			volume = volume > 1 ? 1 : volume < 0 ? 0 : volume;
			querySelectorAllControls().forEach(media => media.volume = volume);
			localStorage.setItem('lastVolume', volume);
		};
		const scrollToEl = el => {
			const rect = el.getBoundingClientRect();
			// check if the element is outside the viewport, otherwise don't scroll
			if (rect && (rect.top < 0 || rect.left < 0 || rect.bottom > (window.innerHeight || document.documentElement.clientHeight) || rect.right > (window.innerWidth || document.documentElement.clientWidth))) {
				setTimeout(() => el.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'}), 500);
			}
		};
		const saveCurrentTime = media => {
			// don't save a tollerance of 10sec
			const currentTime = media.currentTime && media.currentTime > 10 && media.currentTime < media.duration - 10 ? media.currentTime : 0;
			if (currentTime) {
				localStorage.setItem(`currentTime_${media.id}`, currentTime);
			} else if (localStorage.getItem(`currentTime_${media.id}`) !== null) {
				localStorage.removeItem(`currentTime_${media.id}`);
			}
		};
		// loop all audio + video
		document.body.addEventListener('ended', event => {
			if (checkEvent(event)) {
				const media = querySelectorAllReadyControls(); //Array.from(document.querySelectorAll('audio')).concat(Array.from(document.querySelectorAll('video')));
				let index = -1;
				if ((index = media.indexOf(event.target)) !== -1) media[index + 1 >= media.length ? 0 : index + 1].play();
			}
		}, true);
		// stop other audios playing
		document.body.addEventListener('play', event => {
			if (checkEvent(event)) querySelectorAllControls().forEach((media, index) => {
				if (media !== event.target) {
					 media.pause();
				} else {
					localStorage.setItem(`lastPlayed_${location.hash}`, index);
					// only at receiver, otherwise the toolbar will be above the fold
					if (!this.isSender) scrollToEl(media);
					saveCurrentTime(media);
				}
				setVolumeAll();
			});
		}, true);
		document.body.addEventListener('playing', event => {
			if (checkEvent(event)) saveCurrentTime(event.target);
		}, true);
		document.body.addEventListener('pause', event => {
			if (checkEvent(event)) saveCurrentTime(event.target);
		}, true);
		document.body.addEventListener('seeked', event => {
			if (checkEvent(event)) saveCurrentTime(event.target);
		}, true);
		document.body.addEventListener('stalled', event => {
			if (checkEvent(event)) saveCurrentTime(event.target);
		}, true);
		// keep all at same volume
		document.body.addEventListener('volumechange', event => {
			if (checkEvent(event)) {
				setVolumeAll(event.target.volume);
				saveCurrentTime(event.target);
			}
		}, true);
		// read last currentTime
		document.body.addEventListener('loadedmetadata', event => {
			if (checkEvent(event)) event.target.currentTime = Number(localStorage.getItem(`currentTime_${event.target.id}`)) || 0;
		}, true);
		// save last currentTime
		window.addEventListener('beforeunload', event => querySelectorAllReadyControls().forEach(media => saveCurrentTime(media)));
		if (!this.isSender) {
			// keyboard
			document.body.addEventListener('keydown', event => {
				if (event.keyCode === 32 || event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 38 || event.keyCode === 40) {
					event.preventDefault();
					// volume change
					if (event.keyCode === 38 || event.keyCode === 40) {
						setVolumeAll((Number(localStorage.getItem('lastVolume') || 1) + (event.keyCode === 38 ? 0.1 : -0.1)).toFixed(4));
						// prev, next, pause, play
					} else {
						const media = querySelectorAllControls();
						const index = Number(localStorage.getItem(`lastPlayed_${location.hash}`)) || 0;
						let allWerePaused = true;
						// pause all
						media.forEach(el => {
							if (!el.paused) {
								el.pause();
								allWerePaused = false;
							}
						});
						// spacebar
						if (event.keyCode === 32) {
							const lastPlayed = media[index];
							// if all were already paused play last or first song/video
							if (lastPlayed && allWerePaused) lastPlayed.play();
						// left
						} else if (event.keyCode === 37) {
							const prevToPlay = media[index - 1 < 0 ? media.length - 1 : index - 1];
							// if all were already paused play last or first song/video
							if (prevToPlay) prevToPlay.play();
						// right
						} else if (event.keyCode === 39) {
							const nextToPlay = media[index + 1 >= media.length ? 0 : index + 1];
							// if all were already paused play last or first song/video
							if (nextToPlay) nextToPlay.play();
						}
					}
				}
			}, true);
		}
		// ******************************************************************
		// ******************************************************************
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
				this.IPFS.cat(location.hash.substr(6)).then(text => {
					this.HTML.setData(this.receiveCont, {message: text}, false);
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
			this.IPFS.cat(location.hash.substr(6)).then(text => {
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