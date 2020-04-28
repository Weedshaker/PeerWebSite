/*jshint esnext: true */

import {Helper} from 'WebRTC/Classes/Helper/Helper.js';

export class MasterRequestor {
	constructor(Sender, SentMessage){
		this.Sender = Sender;
		this.SentMessage = SentMessage;

		this.Helper = new Helper();
		this.initRequest = '!!!@';
		this.request = {resendMessage:  '-> resendMessage!!!'};
		this.requests = {};
	}
	// requests
	// local
	sendRequest(request, elID, remoteUserId){
		let requestID = this.Helper.getRandomString();
		this.requests[requestID] = request;
		this.Sender.sendEvent(`${this.initRequest}${remoteUserId}${request}`, elID, remoteUserId, requestID, false, new Map([['diffed', false]])); // timeout = false, diffed = false
	}
	// remote
	receiveRequest(request, requestID, elID, remoteUserId, localUserId){
		switch(request){
			case `${this.initRequest}${localUserId}${this.request.resendMessage}`:
				// resend last WHOLE message
				this.Sender.sendEvent(this.SentMessage.getLatestElIDvsToAll(elID, remoteUserId), elID, remoteUserId, requestID, undefined, new Map([['diffed', false]])); // diffed = false
				break;
		}
	}
	// local
	fullFilledRequest(requestID, oldMessage, dataPack){
		switch(this.requests[requestID]){
			case this.request.resendMessage:
				delete this.requests[requestID];
				return dataPack;
		}
		return false;
	}
}