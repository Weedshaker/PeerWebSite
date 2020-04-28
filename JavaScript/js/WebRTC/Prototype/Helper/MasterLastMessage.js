/*jshint esnext: true */

export class MasterLastMessage {
	constructor(elID = 'sst_all', remoteUserId = 'sst_toAll'){
		this.elID = elID;
		this.remoteUserId = remoteUserId;

		// shared vars
		this.cont = {
			[this.remoteUserId]: {[this.elID]: ''}
		}; // sst_toAll means to all channel peers, sst_all is just a dummy class for elementID
	}
	set(message, elID = this.elID, remoteUserId = this.remoteUserId){
		// keep track on sent messages
		// new unique message
		if(!this.cont[remoteUserId]){
			this.cont[remoteUserId] = {};
		}
		this.cont[remoteUserId][elID] = [new Date().getTime(), message];
	}
	get(elID = this.elID, remoteUserId = this.remoteUserId){
		return this.cont[remoteUserId] && this.cont[remoteUserId][elID] ? this.cont[remoteUserId][elID][1] : false;
	}
	getLatestElIDvsToAll(elID = this.elID, remoteUserId = this.remoteUserId){
		if(this.cont[remoteUserId] && this.cont[remoteUserId][elID] && this.cont[this.remoteUserId][elID]){
			return this.cont[this.remoteUserId][elID][0] > this.cont[remoteUserId][elID][0] ? this.cont[this.remoteUserId][elID][1] : this.cont[remoteUserId][elID][1];
		}else{
			return this.cont[remoteUserId] && this.cont[remoteUserId][elID] ? this.cont[remoteUserId][elID][1] : this.cont[this.remoteUserId][elID][1];

		}
	}
	getAll(remoteUserId = this.remoteUserId){
		let messages = [];
		for(let key in this.cont[remoteUserId]){
			if(this.cont[remoteUserId].hasOwnProperty(key) && this.cont[remoteUserId][key].length > 0){
				messages.push([this.cont[remoteUserId][key][1], key, remoteUserId]);
			}
		}
		return messages;
	}
}