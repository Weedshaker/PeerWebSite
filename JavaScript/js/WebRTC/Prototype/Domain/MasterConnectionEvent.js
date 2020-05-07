/*jshint esnext: true */

import {Helper} from 'WebRTC/Classes/Helper/Helper.js';

export class MasterConnectionEvent {
	constructor(connection, Sender, SentMessage){
		this.connection = connection;
		this.Sender = Sender;
		this.SentMessage = SentMessage;

		this.isSender = [true]; // App defines this by looking at hash
		this.openOrJoinEventDelay = 5000;
		this.newParticipantDelay = 1000;
		this.openOrJoinEventID = null;
		// https://www.rtcmulticonnection.org/
		this.connection.onNewParticipant = (participantId, userPreferences) => {
			this.newParticipant(participantId, userPreferences, true);
		};
		this.connection.onReConnecting = (event) => {
			this.newParticipant(event.userid, undefined, true);
		};
		/*this.connection.onUserStatusChanged = (event) => {
			this.newParticipant(event.userid);
		};*/
		/*this.connection.onPeerStateChanged = (state) => {
			this.newParticipant(state.userid);
		};*/
		/*this.connection.onopen = (event) => {
			this.newParticipant(event.userid);
		};*/
		/*this.connection.onSettingLocalDescription = (event) => {
			this.newParticipant(event.userid);
		};*/
		this.connection.onclose = (event) => {
			setTimeout(() => {
				this.updatePeerCounter();
			}, this.openOrJoinEventDelay);
		};
		this.connection.onleave = (event) => {
			setTimeout(() => {
				this.updatePeerCounter();
			}, this.openOrJoinEventDelay);
		};
		this.connection.onerror = (event) => {
			setTimeout(() => {
				this.updatePeerCounter('[ERROR! Please, reload.]');
			}, this.openOrJoinEventDelay);
		};
		this.Helper = new Helper();
		this.onNewParticipant = this.Helper.getEventHandler(); // event handler (api hook)

		this.peerCounterElements = [];
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
		clearTimeout(this.openOrJoinEventID);
		this.openOrJoinEventID = setTimeout(() => {
			if(this.isSender[0] && send){
				this.Sender.sendEvent(message, elID, undefined, undefined, false, new Map([['diffed', false]]), true);
			}
			this.updatePeerCounter();
		}, this.openOrJoinEventDelay); // timeout = false, diffed = false
	}
	// called from connection
	// newParticipant
	newParticipant(remoteUserId, userPreferences, force = false){
		if (remoteUserId !== 'sst_toAll' && userPreferences !== undefined) this.connection.acceptParticipationRequest(remoteUserId, userPreferences);
		let msgElID = false;
		this.onNewParticipant.container.forEach((e) => {
			let result = e.func.apply(e.scope, [remoteUserId].concat(e.args));
			msgElID = result.constructor === Array && result[0] && result[1] ? result : msgElID;
		});
		setTimeout(() => {
			if(this.isSender[0]){
				if(msgElID){
					this.Sender.sendEvent(msgElID[0], msgElID[1], remoteUserId, undefined, false, new Map([['diffed', false]]), force); // timeout = false, diffed = false
				}else{
					this.SentMessage.getAll().forEach((message) => {
						this.Sender.sendEvent(message[0], message[1], remoteUserId, undefined, false, new Map([['diffed', true]]), force); // timeout = false, diffed = false
					});
				}
			}
			this.updatePeerCounter();
		}, this.newParticipantDelay);
	}
	updatePeerCounter(message) {
		this.peerCounterElements.forEach(element => element.textContent = message ? message : `[${this.connection.peers.getLength()} connected]`)
	}
}