/*jshint esnext: true */

import {MasterReceiver} from 'WebRTC/Prototype/Domain/MasterReceiver.js';

export class Receiver extends MasterReceiver {
	constructor(connection, Requestor, ReceivedMessage){
		super(connection, Requestor, ReceivedMessage);
	}
}