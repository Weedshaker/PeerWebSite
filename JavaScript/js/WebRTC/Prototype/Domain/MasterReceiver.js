/*jshint esnext: true */

import {Helper} from 'WebRTC/Classes/Helper/Helper.js';
import {OptionReceiver} from 'WebRTC/Classes/Helper/OptionReceiver.js';

export class MasterReceiver {
	constructor(connection, Requestor, ReceivedMessage){
		this.connection = connection;
		this.Requestor = Requestor;
		this.ReceivedMessage = ReceivedMessage;

		this.connection.receive = this.receiveEvent.bind(this); // bindings (2113:RTCMultiConnection => sst: hijack onDataChannelMessage)
		this.Helper = new Helper();
		this.onReceive = this.Helper.getEventHandler(); // event handler (api hook)
		this.OptionReceiver = new OptionReceiver();
		this.OptionReceiver.returnMap.set('init', [this.OptionReceiver.receiveDecompress, this.OptionReceiver]);
		this.OptionReceiver.returnMap.set('receiveDecompress', [this.OptionReceiver.receiveDiff, this.OptionReceiver]);
		this.OptionReceiver.returnMap.set('receiveDiff', [this.receive, this]);
		this.chunks = {};
		this.loading = '<p>loading...</p>';
	}
	receiveEvent(message, remoteUserId){
		//console.log(`receive: ${message}`);
		let receivingTime = new Date().getTime();
		let dataPack = {};
		let info = message.match(/\(sst:(.*?)\)/, '')[1].split(',');
		dataPack.uuid = info[0];
		dataPack.elID = info[1];
		dataPack.requestID = info[2];
		dataPack.compressed = info[3];
		dataPack.chunk = Number(info[4]);
		dataPack.chunkTotal = Number(info[5]);
		dataPack.latency = receivingTime - info[6];
		dataPack.message = message.replace(/\(sst:.*?\)/g, '');
		dataPack.remoteUserId = remoteUserId;
		if(!this.chunks[dataPack.uuid]){
			this.chunks[dataPack.uuid] = {message: new Map([[dataPack.chunk, dataPack.message]]), latency: dataPack.latency};
		}else{
			this.chunks[dataPack.uuid].message.set(dataPack.chunk, dataPack.message);
			this.chunks[dataPack.uuid].latency += dataPack.latency;
		}
		if(this.chunks[dataPack.uuid].message.size === dataPack.chunkTotal){
			//console.log(this.chunks[dataPack.uuid].latency);
			// mapToArray => sort array => map values and join
			dataPack.message = [...this.chunks[dataPack.uuid].message].sort((a, b) => {return a[0] - b[0]}).map((e)=>{return e[1]}).join('');
			// [oldMessage, message], elID, remoteUserId, requestID, options [0:compressed]
			this.OptionReceiver.init([this.ReceivedMessage.get(dataPack.elID, dataPack.remoteUserId), dataPack.message], dataPack.elID, dataPack.remoteUserId, dataPack.requestID, [dataPack.compressed]);
			delete this.chunks[dataPack.uuid];
		}
	}
	// message = [oldMessage, message]
	receive(message, elID, remoteUserId, requestID, options, result){
		if(message[1].length > 0){
			let dataPack = {message: message[1], elID: elID, remoteUserId: remoteUserId, requestID: requestID, result: result};
			let success = false;
			// diff did't pass
			if(this.Helper.arrayKeyValStrToObj(result)['receiveDiff'] === 'failed'){
				this.Requestor.sendRequest(this.Requestor.request.resendMessage, elID, remoteUserId);
				dataPack.message = this.loading;
				this._receive(dataPack);
			}else if(requestID.length > 0 && message[1].indexOf(`${this.Requestor.initRequest}${this.connection.userid}`) !== -1){
				// handle request
				this.Requestor.receiveRequest(message[1], requestID, elID, remoteUserId, this.connection.userid);
				// ==> don't _receive anything => text doesn't get updated but request gets fullFilled
			}else if(this.Requestor.requests[requestID]){
				// fullFilled request received
				this._receive(this.Requestor.fullFilledRequest(requestID, message[0], dataPack));
				success = true;
			}else{
				// whole message
				this._receive(dataPack);
				success = true;
			}
			if(success){
				this.ReceivedMessage.set(message[1], elID, remoteUserId);
			}
		}
	}
	_receive(dataPack = {message: undefined}){
		// give it further to the event listener
		this.onReceive.container.forEach((e) => {
			e.func.apply(e.scope, [dataPack].concat(e.args));
		});
	}
	setIgnoreOption(){
		// skip with binding this.receive
		this.oldInit = this.OptionReceiver.init;
		this.OptionReceiver.init = this.receive.bind(this);
	}
	unsetIgnoreOption(){
		// skip with binding this.receive
		this.OptionReceiver.init = this.oldInit ? this.oldInit : this.OptionReceiver.init;
	}
}