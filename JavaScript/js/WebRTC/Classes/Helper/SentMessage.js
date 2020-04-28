/*jshint esnext: true */

import {MasterLastMessage} from 'WebRTC/Prototype/Helper/MasterLastMessage.js';

export class SentMessage extends MasterLastMessage {
	constructor(elID, remoteUserId){
		super(elID, remoteUserId);
	}
}