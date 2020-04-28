/*jshint esnext: true */

import {MasterConnectionEvent} from 'WebRTC/Prototype/Domain/MasterConnectionEvent.js';

export class ConnectionEvent extends MasterConnectionEvent {
	constructor(connection, Sender, SentMessage){
		super(connection, Sender, SentMessage);
	}
}