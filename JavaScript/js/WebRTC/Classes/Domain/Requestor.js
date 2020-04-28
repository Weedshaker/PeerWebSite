/*jshint esnext: true */

import {MasterRequestor} from 'WebRTC/Prototype/Domain/MasterRequestor.js';

export class Requestor extends MasterRequestor {
	constructor(Sender, SentMessage){
		super(Sender, SentMessage);
	}
}