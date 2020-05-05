/*jshint esnext: true */

import {Helper} from 'WebRTC/Classes/Helper/Helper.js';
import {OptionSender} from 'WebRTC/Classes/Helper/OptionSender.js';

export class MasterSender {
	constructor(connection, SentMessage){
		this.connection = connection;
		this.SentMessage = SentMessage;

		this.Helper = new Helper();
		this.OptionSender = new OptionSender(this.SentMessage);
		this.OptionSender.returnMap.set('init', [this.OptionSender.sendDiff, this.OptionSender]);
		this.OptionSender.returnMap.set('sendDiff', [this.OptionSender.sendCompress, this.OptionSender]);
		this.OptionSender.returnMap.set('sendCompress', [this.send, this]);
		this.changeDelay = 1000;
		this.timeout = true;
		this.timeoutCont = null; // used internal when timeout true
		this.chunkSize = this.connection.chunkSize || 1000;
		this.chunkSizeRegEx = new RegExp(`(.|[\r\n]){1,${this.chunkSize}}`, 'g');
	}
	/**
	 * message, elID (used for Diff_match_patch), remoteUserId (@user), requestID (used at sendRequest)
	 * sendEvent (api hook)
	 * 
	 * @param {string} message 
	 * @param {string} [elID=this.SentMessage.elID] 
	 * @param {string} [remoteUserId=this.SentMessage.remoteUserId] 
	 * @param {string} [requestID=''] 
	 * @param {boolean} [timeout=this.timeout] 
	 * @param {Map} options 
	 * @memberof MasterSender
	 */
	sendEvent(message, elID = this.SentMessage.elID, remoteUserId = this.SentMessage.remoteUserId, requestID = '', timeout = this.timeout, options, forceSending = false){
		if(this.connection.getAllParticipants().length > 0 && message.length > 0){
			//console.log(`send: ${message}`);
			if(timeout){
				clearTimeout(this.timeoutCont);
				this.timeoutCont = setTimeout(() => {
					if(message !== this.SentMessage.get(elID, remoteUserId) || forceSending){
						// make a backup of the message and doublicate to [rawMessage, message]
						this.OptionSender.init([message, message], elID, remoteUserId, requestID, options);
					}
				}, this.changeDelay);
			}else{
				if(message !== this.SentMessage.get(elID, remoteUserId) || forceSending){
					// make a backup of the message and doublicate to [rawMessage, message]
					this.OptionSender.init([message, message], elID, remoteUserId, requestID, options);
				}
			}
		}else{
			console.info(`SST: Not connected!`);
		}
	}
	// message = [rawMessage, message]
	send(message, elID, remoteUserId, requestID, options){
		// set rawMessage
		this.SentMessage.set(message[0], elID, remoteUserId);
		// check compression
		let compressed = this.OptionSender.getCompressedStatus(options);
		let chunks = message[1].toString().match(this.chunkSizeRegEx);
		if(chunks.length > 0){
			let toAll = remoteUserId === this.SentMessage.remoteUserId || !remoteUserId;
			let remoteUserIds =  toAll ? this.connection.getAllParticipants() : [remoteUserId];
			remoteUserIds.forEach((remoteUserId) => {
				let remoteUser = this.connection.peers[remoteUserId];
				if(remoteUser){
					if(!remoteUser.channels.length){
						this.connection.peers[remoteUserId].createDataChannel();
						this.connection.renegotiate(remoteUserId);
						setTimeout(() => {
							this._send(chunks, elID, remoteUserId, requestID, compressed);
						}, 3000);
					}
					this._send(chunks, elID, remoteUserId, requestID, compressed);
					return true;
				}else{
					console.warn(`SST: Unable to send message to ${remoteUserId}. No connection.peers found!`);
				}
			});
		}
		return false;
	}
	_send(chunks, elID, remoteUserId, requestID, compressed = false){
		let uuid = this.Helper.getRandomString();
		if(this.connection.peers[remoteUserId]){
			this.connection.peers[remoteUserId].channels.forEach((channel) => {
				chunks.forEach((chunk, i) => {
					let info = [uuid, elID, requestID, compressed, i + 1, chunks.length, new Date().getTime()];
					channel.send(`${chunk}(sst:${info.toString()})`);
				});
			});
		}
	}
	setIgnoreOption(){
		// skip with binding this.send
		this.oldInit = this.OptionSender.init;
		this.OptionSender.init = this.send.bind(this);
	}
	unsetIgnoreOption(){
		// skip with binding this.send
		this.OptionSender.init = this.oldInit ? this.oldInit : this.OptionSender.init;
	}
}