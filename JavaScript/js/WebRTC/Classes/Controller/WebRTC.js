/*jshint esnext: true */

import {MasterWebRTC} from 'WebRTC/Prototype/Controller/MasterWebRTC.js';

export class WebRTC extends MasterWebRTC {
	constructor(){
		super();

		// hooks
		this.api = {
			/**
			 * called from dom
			 * 
			 * @param {string} roomid 
			 * @param {string} [message=''] 
			 * @param {string} [elID=''] 
			 * @memberof MasterConnectionEvent
			 */
			openOrJoinEvent: this.ConnectionEvent.openOrJoinEvent.bind(this.ConnectionEvent), // roomid, message = '', elID = ''
			/**
			 * message, elID (used for Diff_match_patch), remoteUserId (@user), requestID (used at sendRequest)
			 * 
			 * @param {string} message 
			 * @param {string} [elID=this.SentMessage.elID] 
			 * @param {string} [remoteUserId=this.SentMessage.remoteUserId] 
			 * @param {string} [requestID=''] 
			 * @param {boolean} [timeout=this.timeout] 
			 * @param {Map([['diffed', [0, true]], ['compressed', [1, 'auto']]])} options
			 * @memberof MasterSender
			 */
			sendEvent: this.Sender.sendEvent.bind(this.Sender), // message, elID = 'sst_all', remoteUserId = 'sst_toAll', requestID = '', options = new Map([['diffed', [0, true]], ['compressed', [1, 'auto']]])
			/**
			 * event handler .add (.remove takes [func, scope])
			 * 
			 * @param {Function} func 
			 * @param {string} [scope = this]
			 * @param {string} [args = [message = '', elID = '']]
			 * @memberof Helper
			 */
			onNewParticipant: this.ConnectionEvent.onNewParticipant, // func, scope = this, args = [] ==> has to return [message = '', elID = '']
			/**
			 * event handler .add (.remove takes [func, scope])
			 * 
			 * @param {Function} func 
			 * @param {string} [scope = this]
			 * @param {string} [args = [message = '', elID = '']]
			 * @memberof Helper
			 */
			onReceive: this.Receiver.onReceive, // func, scope = this, args = []
			/**
			 * 
			 * @memberof MasterWebRTC
			 */
			setIgnoreOption: this.setIgnoreOption.bind(this),
			/**
			 * 
			 * @memberof MasterWebRTC
			 */
			unsetIgnoreOption: this.unsetIgnoreOption.bind(this),
			/**
			 * Map
			 * 
			 * @param {Map([['diffed', [0, true]], ['compressed', [1, 'auto']]])} options
			 * @memberof OptionSender
			 */
			options: this.Sender.OptionSender.options
		};
	}
}