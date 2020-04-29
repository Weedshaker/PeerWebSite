/*jshint esnext: true */

import {Helper} from 'WebRTC/Classes/Helper/Helper.js';

export class MasterConnectionEvent {
	constructor(connection, Sender, SentMessage){
		this.connection = connection;
		this.Sender = Sender;
		this.SentMessage = SentMessage;

		this.openOrJoinEventDelay = 5000;
		this.newParticipantDelay = 1000;
		// newParticipantEvent
		this.connection.onNewParticipant = (participantId, userPreferences) => {
			this.newParticipant(participantId, userPreferences);
		};
		this.Helper = new Helper();
		this.onNewParticipant = this.Helper.getEventHandler(); // event handler (api hook)
	}
	/**
	 * called from dom
	 * openOrJoinEvent (api hook)
	 * 
	 * @param {string} roomid 
	 * @param {string} [message=''] 
	 * @param {string} [elID=''] 
	 * @memberof MasterConnectionEvent
	 */
	openOrJoinEvent(roomid, message = '', elID = '', send = true){
		this.connection.openOrJoin(roomid || 'predefiend-roomid');
		if (send) {
			setTimeout(() => {
				if(!this.connection.isInitiator){
					this.Sender.sendEvent(message, elID, undefined, undefined, false, new Map([['diffed', false]]));
				}
			}, this.openOrJoinEventDelay); // timeout = false, diffed = false
		}
	}
	// called from connection
	// newParticipant
	newParticipant(remoteUserId, userPreferences){
		this.connection.acceptParticipationRequest(remoteUserId, userPreferences);
		let msgElID = false;
		this.onNewParticipant.container.forEach((e) => {
			let result = e.func.apply(e.scope, [remoteUserId].concat(e.args));
			msgElID = result.constructor === Array && result[0] && result[1] ? result : msgElID;
		});
		setTimeout(() => {
			if(this.connection.isInitiator){
				if(msgElID){
					this.Sender.sendEvent(msgElID[0], msgElID[1], remoteUserId, undefined, false, new Map([['diffed', false]])); // timeout = false, diffed = false
				}else{
					this.SentMessage.getAll().forEach((message) => {
						this.Sender.sendEvent(message[0], message[1], remoteUserId, undefined, false, new Map([['diffed', false]])); // timeout = false, diffed = false
					});
				}
			}
		}, this.newParticipantDelay);
	}
}