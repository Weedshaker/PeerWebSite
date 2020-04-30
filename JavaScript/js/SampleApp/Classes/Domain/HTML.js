/*jshint esnext: true */

import {MasterHTML} from 'SampleApp/Prototype/Domain/MasterHTML.js';

export class HTML extends MasterHTML {
	constructor(WebTorrent, Editor){
		super(WebTorrent);

		this.Editor = Editor;
	}
	createElements(name, attach = '#body', connection = null){
		attach = $(attach).length > 0 ? attach : 'body';
		switch(name){
			case 'open-or-join-room':
				this.idNames = ['txt-roomid', 'open-or-join-room', 'sender', 'receiver'];
				this.containers = [$(`<header>
					<iframe class="gh-button" src="https://ghbtns.com/github-btn.html?user=Weedshaker&amp;repo=PeerWebSite&amp;type=star&amp;count=true&amp;size=large" scrolling="0" width="160px" height="30px" frameborder="0"></iframe>
					<div class="mui-checkbox useWebTorrent">
						<label>
						<input id="useWebTorrent" type="checkbox" value="" ${localStorage.getItem('useWebTorrent') ? localStorage.getItem('useWebTorrent') === 'true' ? 'checked' : '' : ''}>
						<span>Use WebTorrent for files</span><span class="tiny">(supports video streaming)</span>
						</label>
					</div>
				</header>`)];
				// controls
				let controls = $('<div id="controls"></div>')
				let input = $(`<input id="${this.idNames[0]}" class="mui-panel" placeholder="${connection.token()}">`);
				controls.append(input);
				let button = $(`<button id="${this.idNames[1]}" class="mui-btn mui-btn--primary">Auto Open Or Join Room</button>`);
				controls.append(button);
				// webtorrent
				// clipboard
				let clipboard = $(`<input type="text" class="mui-panel" id="clipboardInput"><button class="mui-btn mui-btn--primary" id="clipboardBtn">Copy Room URL</button>`).hide();
				controls.append(clipboard);
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
					button.hide();
					clipboard.show();
					clipboard.click(() => this.copyToCipBoard('clipboardInput'));
					$('#clipboardInput').val(location.href);
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