/*jshint esnext: true */

import {MasterHTML} from 'SampleApp/Prototype/Domain/MasterHTML.js';

export class HTML extends MasterHTML {
	constructor(WebTorrentReceiver, WebTorrentSeeder, Editor){
		super(WebTorrentReceiver);

		this.WebTorrentSeeder = WebTorrentSeeder;
		this.Editor = Editor;
	}
	createElements(name, attach = '#body', connection = null){
		attach = $(attach).length > 0 ? attach : 'body';
		switch(name){
			case 'open-or-join-room':
				this.idNames = ['txt-roomid', 'open-or-join-room', 'sender', 'receiver'];
				this.containers = [$(`<header>
					<iframe class="gh-button" src="https://ghbtns.com/github-btn.html?user=Weedshaker&amp;repo=PeerWebSite&amp;type=star&amp;count=true&amp;size=large" scrolling="0" width="160px" height="30px" frameborder="0"></iframe><span class="tiny" style="color:white">Visit Github for more Infos!</span>
					<button class="mui-btn">
						<div class="mui-checkbox useWebTorrent">
							<label>
							<input id="useWebTorrent" type="checkbox" value="" ${localStorage.getItem('useWebTorrent') ? localStorage.getItem('useWebTorrent') === 'true' ? 'checked' : '' : ''}>
							<span>Use WebTorrent for files</span><span class="tiny">(supports video streaming. Preferably use Chrome with this feature! It likely does not work with other browsers.)</span>
							</label>
						</div>
					</button>
				</header>`)];
				// controls
				let controls = $('<div id="controls"></div>')
				let input = $(`<input id="${this.idNames[0]}" class="mui-panel" placeholder="${connection.token()}">`);
				controls.append(input);
				// clipboard
				let clipboard = $(`<input type="text" class="mui-panel" id="clipboardInput">`).hide();
				clipboard.keypress(function (e) {
					e.preventDefault();
					e.target.blur();
				});
				controls.append(clipboard);
				let button = $(`<button id="${this.idNames[1]}" class="mui-btn mui-btn--primary">Start/Resume Live Session & Copy URL</button>`);
				input.keypress(function (e) {
					if (e.keyCode == 13) {
						e.preventDefault();
						e.target.blur();
						button.click();
					}
				});
				controls.append(button);
				// webtorrent
				let inputWebTorrent = $(`<input tabindex="-1" id="inputWebTorrent" class="mui-panel" placeholder="MagnetURI...">`);
				inputWebTorrent.keypress(function (e) {
					e.preventDefault();
					e.target.blur();
				});
				controls.append(inputWebTorrent);
				let buttonWebTorrent = $(`<button id="buttonWebTorrent" class="mui-btn mui-btn--accent">Make WebTorrent & Copy URL</button>`);
				controls.append(buttonWebTorrent);
				buttonWebTorrent.click(() => {
					this.copyToCipBoard('inputWebTorrent');
					this.WebTorrentSeeder.api.seed(new File([this.Editor.getData()], 'peerWebSite', { type: 'plain/text', endings: 'native' }), undefined, undefined, undefined, undefined, (torrent) => {
						inputWebTorrent.val(`${location.href.replace(location.hash, '')}#${torrent.magnetURI}`);
						this.copyToCipBoard('inputWebTorrent');
					});
				});
				this.containers.push(controls);
				// main containers
				let sender = $(`<div id="${this.idNames[2]}">${localStorage.getItem(location.hash) || ''}</div>`);
				this.containers.push(sender);
				let receiver = $(`<div id="${this.idNames[3]}">${window.sst && window.sst.karma ? '' : '<span class="blobLoading"></span>'}</div>`);
				this.containers.push(receiver);
				button.on('click', () => {
					this.disabled = true;
					$('#txt-roomid').val($('#txt-roomid').val().replace(/\s/g, ''));
					const hash = $('#txt-roomid').val() || $('#txt-roomid').attr('placeholder');
					if (!location.hash) localStorage.setItem('channels', `#${hash}` + localStorage.getItem('channels') || '');
					location.hash = hash;
					input.hide();
					clipboard.show();
					$('#clipboardInput').val(location.href);
					this.copyToCipBoard('clipboardInput');
					// persist site
					localStorage.setItem(location.hash, this.Editor.getData());
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

				$('#useWebTorrent').on('click', (e) => {
					localStorage.setItem('useWebTorrent', e.target.checked);
				});

				return [sender, receiver, button];
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