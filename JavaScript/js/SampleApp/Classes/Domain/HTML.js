/*jshint esnext: true */

import {MasterHTML} from 'SampleApp/Prototype/Domain/MasterHTML.js';

export class HTML extends MasterHTML {
	constructor(WebTorrent){
		super(WebTorrent);
	}
	createElements(name, attach = '#body', connection = null){
		attach = $(attach).length > 0 ? attach : 'body';
		switch(name){
			case 'open-or-join-room':
				this.idNames = ['txt-roomid', 'open-or-join-room', 'sender', 'receiver'];
				this.containers = [];
				let controls = $('<div id="controls"></div>')
				let input = $(`<input id="${this.idNames[0]}" class="mui-panel" placeholder="${connection.token()}">`);
				controls.append(input);
				let button = $(`<button id="${this.idNames[1]}" class="mui-btn mui-btn--primary">Auto Open Or Join Room</button>`);
				controls.append(button);
				// clipboard
				let clipboard = $(`<input type="text" class="mui-panel" id="clipboardInput"><button class="mui-btn mui-btn--primary" id="clipboardBtn">Copy URL</button>`).hide();
				controls.append(clipboard);

				this.containers.push(controls);
				let sender = $(`<div id="${this.idNames[2]}">Your message...</div>`);
				this.containers.push(sender);
				let receiver = $(`<div id="${this.idNames[3]}">Waiting for response...</div>`);
				this.containers.push(receiver);
				button.on('click', () => {
					this.disabled = true;
					$('#txt-roomid').val($('#txt-roomid').val().replace(/\s/g, ''));
					location.hash = $('#txt-roomid').val() || $('#txt-roomid').attr('placeholder');
					input.hide();
					button.hide();
					clipboard.show();
					clipboard.click(this.copyToCipBoard);
					$('#clipboardInput').val(location.href);
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
				return [sender, receiver, button];
		}
		return false;
	}
	copyToCipBoard() {
		var copyText = document.getElementById("clipboardInput");
		/* Select the text field */
		copyText.select();
		copyText.setSelectionRange(0, 99999); /*For mobile devices*/

		/* Copy the text inside the text field */
		document.execCommand("copy");
	}
}