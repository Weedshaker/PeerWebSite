/*jshint esnext: true */

import {MasterSender} from 'WebRTC/Prototype/Domain/MasterSender.js';

export class Sender extends MasterSender {
	constructor(connection, SentMessage){
		super(connection, SentMessage);
	}
}