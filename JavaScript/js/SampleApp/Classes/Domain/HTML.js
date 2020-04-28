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
				this.containers.push(controls);
				let sender = $(`<div id="${this.idNames[2]}"></div>`);
				this.containers.push(sender);
				let receiver = $(`<div id="${this.idNames[3]}"></div>`);
				this.containers.push(receiver);
				button.on('click', () => {
					this.disabled = true;
					$('#txt-roomid').val($('#txt-roomid').val().replace(/\s/g, ''));
					location.hash = $('#txt-roomid').val() || $('#txt-roomid').attr('placeholder');
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
}