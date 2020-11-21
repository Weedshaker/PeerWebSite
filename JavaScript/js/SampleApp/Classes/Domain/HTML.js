/*jshint esnext: true */

import {MasterHTML} from 'SampleApp/Prototype/Domain/MasterHTML.js';
import Player from 'Player/Player.js';

export class HTML extends MasterHTML {
	constructor(WebTorrentReceiver, WebTorrentSeeder, Editor, WebRTC, IPFS, parent){
		super(WebTorrentReceiver);

		this.WebTorrentSeeder = WebTorrentSeeder;
		this.Editor = Editor;
		this.WebRTC = WebRTC;
		this.IPFS = IPFS;
		this.parent = parent; // ref to App.js

		this.Player = new Player();
	}
	createElements(name, attach = '#body', connection = null, isSender = true){
		attach = $(attach).length > 0 ? attach : 'body';
		switch(name){
			case 'open-or-join-room':
				this.idNames = ['txt-roomid', 'open-or-join-room', 'sender', 'receiver'];
				const header = $(`<header class="down isTop">
					<div id="info" class="flex">
						<div class="offline">YOU ARE OFFLINE!!!</div>
						<iframe class="gh-button" src="https://ghbtns.com/github-btn.html?user=Weedshaker&amp;repo=PeerWebSite&amp;type=star&amp;count=true&amp;size=large" scrolling="0" width="160px" height="30px" frameborder="0"></iframe><a href="https://github.com/Weedshaker/PeerWebSite" class="tiny" style="color:white">v. beta 0.7.76<span id="sw-version"></span>; Visit Github for more Infos!</a> <a href="${location.href.replace(location.hash, '')}" class="recycle">&#9851;&nbsp;<span class="tiny">Start Over!</span></a>
					</div>
				</header>`);
				// add edit and player htmlelements
				header.find('#info').append(`<a href="#" class="edit">&#9997;&nbsp;<span class="tiny">${!isSender ? 'Edit!' : 'Abort Editing!'}</span></a><section id="player"></section>`);
				header.find('.edit').click(event => {
					event.preventDefault();
					if (!isSender) {
						this.setHash(location.hash.substr(1));
						this.saveData(undefined, this.parent.receiveCont[0].innerHTML);
						if(this.parent.checkHashType(location.hash) === 'ipfs' || this.confirmData(undefined, this.parent.receiveCont[0].innerHTML)){
							location.reload();
						}else{
							this.removeHashFromChannels(location.hash.substr(1));
							header.find('.edit').remove();
						}
					} else {
						this.removeHashFromChannels(location.hash.substr(1));
						location.reload();
					}
				});
				this.containers = [header];
				this.stickyHeader(header);
				// specific only for receiver
				const headerReceiver = $('<div class="headerReceiver"><span class="qr"></span></div>');
				if (!isSender) this.addQrCode(headerReceiver, undefined, 'receiverLoading');
				// controls
				let controls = $('<div id="controls"></div>')
				this.createIpfsControls(controls);
				const webrtcButton = this.createWebrtcControls(controls, connection, isSender, headerReceiver);
				const counterWebTorrent = this.createWebtorrentControls(controls, isSender, headerReceiver);
				this.containers.push(controls);
				// main containers
				this.loadingAnimation = `<span class="blobLoading ${this.parent.checkHashType(location.hash) === 'magnet' ? 'torrentLoading' : this.parent.checkHashType(location.hash) === 'ipfs' ? 'ipfsLoading' : ''}"></span>`;
				let sender = $(`<div id="${this.idNames[2]}">${window.sst && window.sst.karma ? '' : isSender && (this.parent.checkHashType(location.hash) !== 'ipfs' || !/="http.*?gateway\.ipfs\.io.*?#js.*?"/g.test(localStorage.getItem(location.hash)) /* ipfs javascript does not get triggered else */) ? localStorage.getItem(location.hash) || '' : ''}</div>`);
				this.containers.push(sender);
				let receiver = $(`<div id="${this.idNames[3]}">${window.sst && window.sst.karma ? '' : isSender ? 'WEBRTC response...' : this.parent.checkHashType(location.hash) !== 'ipfs' || !/="http.*?gateway\.ipfs\.io.*?#js.*?"/g.test(localStorage.getItem(location.hash)) /* ipfs javascript does not get triggered else */ ? localStorage.getItem(location.hash) || this.loadingAnimation : this.loadingAnimation}</div>`);
				this.containers.push(receiver);
				// hot-reloader
				/*
				// TODO: hot-reloader does not work anymore, better to fix when discarding jspm
				if(window.sst && window.sst.isDebug){
					input.val($(`#${this.idNames[0]}`).val());
					button.disabled = connection.sessionid == $(`#${this.idNames[0]}`).val();
					if($.summernote){
						$(`#${this.idNames[2]}`).summernote('destroy');
					}
					this.removeElements();
				}
				*/
				this.containers.forEach((e) => {
					$(attach).append(e);
				});

				$('#info').append(headerReceiver);

				this.Player.connect(isSender, header.get(0));

				return [sender, receiver, webrtcButton, counterWebTorrent];
		}
		return false;
	}
	createWebrtcControls(controls, connection, isSender, headerReceiver) {
		// webrtc
		let input = $(`<input id="${this.idNames[0]}" class="mui-panel" placeholder="${this.parent.checkHashType() === 'webrtc' ? location.hash.substr(1) : connection.token()}">`);
		controls.append(input);
		// clipboard
		let clipboard = $(`<input dir="rtl" type="text" class="mui-panel" id="clipboardInput">`).hide();
		clipboard.keypress(function (e) {
			e.preventDefault();
			e.target.blur();
		});
		controls.append(clipboard);
		let button = $(`<button id="${this.idNames[1]}" class="mui-btn mui-btn--webRTC"><span class="btnText">WebRTC (temporary):<br>Activate Live Session & Copy Link</span><span class="qr"></span></button>`);
		let counterWebRTC = $('<span class="counter counterWebRTC">[0 connected]</span>');
		if (isSender) {
			$(button).find('.btnText').append(counterWebRTC);
		}else{
			headerReceiver.append(counterWebRTC);
		}
		this.WebRTC.api.peerCounterElements.push(counterWebRTC[0]);
		input.keypress(function (e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				e.target.blur();
				button.click();
			}
		});
		controls.append(button);
		if (isSender) button.click(event => {
			// fix and define roomid aka link aka hash
			$('#txt-roomid').val($('#txt-roomid').val().replace(/\s/g, '') || $('#txt-roomid').attr('placeholder'));
			// switch input field with clipboard field
			input.hide();
			clipboard.show();
			// default behavior
			this.setHash($('#txt-roomid').val());
			this.saveData();
			this.addQrCode($(button));
			this.setTitle();
			// update the clipboard
			clipboard.val(location.href);
			this.copyToClipBoard('clipboardInput');
			this.informOnce('buttonWebRTC');
		});
		return button;
	}
	createIpfsControls(controls) {
		// ipfs
		let input = $(`<input tabindex="-1" id="inputIPFS" class="mui-panel" placeholder="CID...">`);
		input.keypress(function (e) {
			e.preventDefault();
			e.target.blur();
		});
		controls.append(input);
		let button = $(`<button id="buttonIPFS" class="mui-btn mui-btn--primary"><span class="btnText">IPFS (rather permanent):<br>Take Snapshot & Copy Link</span><span class="qr"></span></button>`);
		controls.append(button);
		button.click(event => {
			this.copyToClipBoard('inputIPFS');
			const data = this.Editor.getData(undefined, true);
			this.IPFS.add('peerWebSite.txt', data).then(file => {
				// default behavior
				this.setHash(`ipfs:${file.cid}`);
				this.saveData();
				this.addQrCode($(button), undefined, 'ipfsLoading');
				this.setTitle();
				// update the clipboard
				input.val(location.href);
				this.copyToClipBoard('inputIPFS');
			}).catch(error => input.val(`IPFS failed: ${error}`));
		});
		return button;
	}
	createWebtorrentControls(controls, isSender, headerReceiver) {
		// webtorrent
		let inputWebTorrent = $(`<input tabindex="-1" id="inputWebTorrent" class="mui-panel" placeholder="MagnetURI...">`);
		inputWebTorrent.keypress(function (e) {
			e.preventDefault();
			e.target.blur();
		});
		controls.append(inputWebTorrent);
		let buttonWebTorrent = $(`<button id="buttonWebTorrent" class="mui-btn mui-btn--accent"><span class="btnText">WebTorrent (transitory):<br>Take Snapshot & Copy Link</span><span class="qr"></span></button>`);
		let counterWebTorrent = $('<span class="counter counterWebTorrent">[0 peers]</span>');
		if (isSender) {
			$(buttonWebTorrent).find('.btnText').append(counterWebTorrent);
		}else{
			headerReceiver.append(counterWebTorrent);
		}
		controls.append(buttonWebTorrent);
		let webTorrentCounterID = null;
		let torrentCreatedData = [];
		buttonWebTorrent.click(event => {
			this.copyToClipBoard('inputWebTorrent'); // must kopie when multiple times clicked on same button
			// must always be same file name 'peerWebSite' otherwise webtorrent gives us a new magicURI
			const data = this.Editor.getData(undefined, true);
			if (!torrentCreatedData.includes(data)) this.WebTorrentSeeder.api.seed(new File([data], 'peerWebSite.txt', { type: 'plain/text', endings: 'native' }), undefined, undefined, undefined, undefined, (torrent) => {
				// clear interval
				clearInterval(webTorrentCounterID);
				webTorrentCounterID = setInterval(() => {
					counterWebTorrent[0].textContent = `[${torrent.numPeers} peer${torrent.numPeers === 1 ? '' : 's'}]`;
				}, 1000);
				// avoid creating the torrent twice
				torrentCreatedData.push(data);
				// default behavior
				this.setHash(torrent.magnetURI);
				this.saveData();
				this.addQrCode($(buttonWebTorrent), undefined, 'torrentLoading');
				this.setTitle();
				// update the clipboard
				inputWebTorrent.val(location.href);
				this.copyToClipBoard('inputWebTorrent');
				torrent.on('error', error => inputWebTorrent.val(`WebTorrent failed: ${error}`));
				this.informOnce('buttonWebTorrent');
			});
		});
		this.WebTorrentSeeder.client.on('error', () => {
			clearInterval(webTorrentCounterID);
			counterWebTorrent[0].textContent = `[ERROR! Please, reload.]`;
		});
		return counterWebTorrent;
	}
	setHash(hash){
		if (hash) {
			if (!(localStorage.getItem('channels') || '').includes(`[#${hash}]`)) localStorage.setItem('channels', `[#${hash}]` + (localStorage.getItem('channels') || ''));
			location.hash = hash;
			this.parent.checkHashType(); // sets attribute for hash type magnet, ipfs, webrtc
		}
	}
	removeHashFromChannels(hash){
		if (hash && (localStorage.getItem('channels') || '').includes(`[#${hash}]`)) {
			localStorage.setItem('channels', (localStorage.getItem('channels') || '').replace(`[#${hash}]`, ''));
		}
	}
	saveData(key = location.hash, data = this.Editor.getData(), retry = true){
		if (key && data && data.length >= 15) {
			try {
				localStorage.setItem(key, data);
			} catch (error) {
				localStorage.clear();
				if (retry) this.saveData(key, data, false);
				console.warn(`SST: LocalStorage ran ${!retry ? 'a second time ' : ''}into error and got cleared:` + error);
			}
		}
	}
	confirmData(key = location.hash, data = this.Editor.getData()){
		return localStorage.getItem(key) === data;
	}
	copyToClipBoard(name) {
		var copyText = document.getElementById(name);
		/* Select the text field */
		copyText.select();
		copyText.setSelectionRange(0, 99999); /*For mobile devices*/

		/* Copy the text inside the text field */
		document.execCommand("copy");
	}
	shareApi(url = location.href, text = this.getFirstText()) {
		if (text && navigator.share) {
			navigator.share({
				title: 'PeerWebSite',
				text,
				url,
			}).then(() => console.log('Share was successful.')).catch(error => console.log('Sharing failed', error));
		}
	}
	setTitle(text = this.getFirstText()) {
		document.title = text || document.title;
	}
	getFirstText(text = this.Editor.getData()) {
		const textNode = document.createElement('textarea');
    	textNode.innerHTML = text;
		text = textNode.textContent.match(/>.*?([a-zA-Z\d]{1}[^>]*?)</);
		return text && text.length && text[1] ? text[1] : '';
	}
	addQrCode($el, text = location.href, loadingClass = 'blobLoading') {
		const $oldImg = $el.find('img');
		const src = `https://api.qrserver.com/v1/create-qr-code/?data="${this.encode(text)}"`;
		if (!$oldImg || !$oldImg.length || $oldImg.attr('src') !== src) {
			const img = document.createElement('img');
			img.src = src;
			img.classList.add(loadingClass);
			img.addEventListener('load', event => img.classList.remove(loadingClass));
			let errorCounter = 0;
			img.onerror = error => {
				if (errorCounter < 3) {
					img.src = img.src;
				} else {
					$span.html('');
				}
				errorCounter++;
			};
			const $span = $el.find('.qr');
			$span.html(img);
			$el.addClass('hasQr');
			$span.off('click').click(event => {
				if($span.hasClass('open')){
					event.stopPropagation();
				}else{
					this.shareApi();
				}
				$span.toggleClass('open');
			});
			this.addTinyUrl($el, text);
		}
	}
	addTinyUrl($el, text = location.href) {
		const $oldLink = $el.find('a');
		const resource = `https://tinyurl.com/api-create.php?url=${this.encode(text)}`;
		if (!$oldLink || !$oldLink.length || $oldLink.attr('resource') !== resource) {
			fetch(resource).then(res => res.text()).then(tinyUrl => {
				const link = document.createElement('a');
				link.href = tinyUrl;
				link.setAttribute('resource', resource);
				link.textContent = tinyUrl;
				const $span = $el.find('.qr');
				$span.append(link);
			});
		}
	}
	encode(text) {
		return encodeURIComponent(text.trim());
	}
	informOnce(name = 'warn', text = 'Use a VPN or IPFS, if your network blocks WebRTC/WebTorrent connections! Especially 3g/4g networks tend to block ice servers.') {
		if (!localStorage.getItem(name)) {
			alert(text)
			localStorage.setItem(name, 'informed')
		}
	}
	stickyHeader($header) {
		const listenToScroll = () => {
			const lastScroll = window.scrollY;
			setTimeout(() => {
				// is top
				if (window.scrollY <= $header.height() + 5) {
					$header.addClass('down');
					$header.addClass('isTop');
				} else {
					// if header sub window (eg. player) is open || direction scroll && min 30 pixel scrolled
					if (!!document.querySelector('header > div > section > section.open') || (Math.abs(window.scrollY - lastScroll) > 30 && window.scrollY <= lastScroll)) {
						$header.addClass('down');
					} else if (Math.abs(window.scrollY - lastScroll) > 30) {
						$header.removeClass('down');
					}
					$header.removeClass('isTop');
				}
				window.addEventListener('scroll', listenToScroll, {once: true});
			}, 200);
		};
		window.addEventListener('scroll', listenToScroll, {once: true});
	}
}