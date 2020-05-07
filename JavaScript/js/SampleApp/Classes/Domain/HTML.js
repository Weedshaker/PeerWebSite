/*jshint esnext: true */

import {MasterHTML} from 'SampleApp/Prototype/Domain/MasterHTML.js';

export class HTML extends MasterHTML {
	constructor(WebTorrentReceiver, WebTorrentSeeder, Editor, WebRTC){
		super(WebTorrentReceiver);

		this.WebTorrentSeeder = WebTorrentSeeder;
		this.Editor = Editor;
		this.WebRTC = WebRTC;
	}
	createElements(name, attach = '#body', connection = null, isSender = true){
		attach = $(attach).length > 0 ? attach : 'body';
		switch(name){
			case 'open-or-join-room':
				this.idNames = ['txt-roomid', 'open-or-join-room', 'sender', 'receiver'];
				this.containers = [$(`<header>
					<div id="info" class="flex">
						<iframe class="gh-button" src="https://ghbtns.com/github-btn.html?user=Weedshaker&amp;repo=PeerWebSite&amp;type=star&amp;count=true&amp;size=large" scrolling="0" width="160px" height="30px" frameborder="0"></iframe><a href="https://github.com/Weedshaker/PeerWebSite" class="tiny" style="color:white">v. beta 0.4.1; Visit Github for more Infos!</a> <a href="${location.href.replace(location.hash, '')}" class="recycle">&#9851;&nbsp;<span class="tiny">Start Over!</span></a>
					</div>
					<button class="mui-btn">
						<div class="mui-checkbox useWebTorrent">
							<label>
							<input id="useWebTorrent" type="checkbox" value="" ${localStorage.getItem('useWebTorrent') ? localStorage.getItem('useWebTorrent') === 'true' ? 'checked' : '' : 'checked'}>
							<span>Use WebTorrent for files</span><span class="tiny">(supports video streaming, big files plus multiple files. Preferably use Chrome with this feature!)</span>
							</label>
						</div>
					</button>
				</header>`)];
				// specific only for receiver
				const headerReceiver = $('<div class="headerReceiver"></div>');
				// controls
				let controls = $('<div id="controls"></div>')
				let input = $(`<input id="${this.idNames[0]}" class="mui-panel" placeholder="${connection.token()}">`);
				controls.append(input);
				// clipboard
				let clipboard = $(`<input dir="rtl" type="text" class="mui-panel" id="clipboardInput">`).hide();
				clipboard.keypress(function (e) {
					e.preventDefault();
					e.target.blur();
				});
				controls.append(clipboard);
				let button = $(`<button id="${this.idNames[1]}" class="mui-btn mui-btn--primary">Activate Live Session & Copy Link</button>`);
				let counterWebRTC = $('<span class="counter counterWebRTC">[0 connected]</span>');
				if (isSender) {
					button.append(counterWebRTC);
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
				// webtorrent
				let inputWebTorrent = $(`<input tabindex="-1" id="inputWebTorrent" class="mui-panel" placeholder="WebTorrent MagnetURI...">`);
				inputWebTorrent.keypress(function (e) {
					e.preventDefault();
					e.target.blur();
				});
				controls.append(inputWebTorrent);
				let buttonWebTorrent = $(`<button id="buttonWebTorrent" class="mui-btn mui-btn--accent">Take Snapshot & Copy Link</button>`);
				let counterWebTorrent = $('<span class="counter counterWebTorrent">[0 peers]</span>');
				if (isSender) {
					buttonWebTorrent.append(counterWebTorrent);
				}else{
					headerReceiver.append(counterWebTorrent);
				}
				controls.append(buttonWebTorrent);
				let webTorrentCounterID = null;
				let torrentCreatedData = [];
				buttonWebTorrent.click(() => {
					this.copyToCipBoard('inputWebTorrent');
					// must always be same file name 'peerWebSite' otherwise webtorrent gives us a new magicURI
					const data = this.Editor.getData();
					if (!torrentCreatedData.includes(data)) this.WebTorrentSeeder.api.seed(new File([data], 'peerWebSite', { type: 'plain/text', endings: 'native' }), undefined, undefined, undefined, undefined, (torrent) => {
						inputWebTorrent.val(`${location.href.replace(location.hash, '')}#${torrent.magnetURI}`);
						this.copyToCipBoard('inputWebTorrent');
						clearInterval(webTorrentCounterID);
						webTorrentCounterID = setInterval(() => {
							counterWebTorrent[0].textContent = `[${torrent.numPeers} peer${torrent.numPeers === 1 ? '' : 's'}]`;
						}, 1000);
						torrentCreatedData.push(data);
					});
				});
				this.WebTorrentSeeder.client.on('error', () => {
					clearInterval(webTorrentCounterID);
					counterWebTorrent[0].textContent = `[ERROR! Please, reload.]`;
				});
				this.containers.push(controls);
				// main containers
				let sender = $(`<div id="${this.idNames[2]}">${window.sst && window.sst.karma ? '' : isSender ? localStorage.getItem(location.hash) || '' : ''}</div>`);
				this.containers.push(sender);
				let receiver = $(`<div id="${this.idNames[3]}">${window.sst && window.sst.karma ? '' : !isSender ? localStorage.getItem(location.hash) || '<span class="blobLoading"></span>' : 'response...'}</div>`);
				this.containers.push(receiver);
				button.on('click', () => {
					this.disabled = true;
					$('#txt-roomid').val($('#txt-roomid').val().replace(/\s/g, '') || $('#txt-roomid').attr('placeholder'));
					const hash = $('#txt-roomid').val();
					if (!location.hash) localStorage.setItem('channels', `[#${hash}]` + localStorage.getItem('channels') || '');
					location.hash = hash;
					input.hide();
					clipboard.show();
					$('#clipboardInput').val(location.href);
					this.copyToCipBoard('clipboardInput');
					// persist site
					const data = this.Editor.getData();
					if (data.length >= 30) localStorage.setItem(location.hash, data);
				});
				// hot-reloader
				if(window.sst && window.sst.isDebug){
					input.val($(`#${this.idNames[0]}`).val());
					button.disabled = connection.sessionid == $(`#${this.idNames[0]}`).val();
					if($.summernote){
						$(`#${this.idNames[2]}`).summernote('destroy');
					}
					this.removeElements();
				}
				this.containers.forEach((e) => {
					$(attach).append(e);
				});

				$('#info').append(headerReceiver);

				$('#useWebTorrent').on('click', (e) => {
					localStorage.setItem('useWebTorrent', e.target.checked);
				});

				return [sender, receiver, button, counterWebTorrent];
		}
		return false;
	}
	copyToCipBoard(name) {
		var copyText = document.getElementById(name);
		/* Select the text field */
		copyText.select();
		copyText.setSelectionRange(0, 99999); /*For mobile devices*/

		/* Copy the text inside the text field */
		document.execCommand("copy");
	}
}