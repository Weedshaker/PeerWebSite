/*jshint esnext: true */

import {MasterWorker} from 'SharedHelper/Prototype/Helper/MasterWorker.js';
import {Helper} from 'WebRTC/Classes/Helper/Helper.js';

export class LZStringWorker extends MasterWorker {
	constructor(){
		super(false);

		this.name = 'LZStringWorker';
		this.Helper = new Helper();
		this.scripts = this.Helper.addBaseURL([`jspm_packages/${System.map['pieroxy/lz-string']}/libs/lz-string.min.js`]);
	}
	sendCompress(data){
		// compress
		// data = [compressed, [rawMessage, message], elID, remoteUserId, requestID, options, result]
		let command = data[0] === 'compress' ? 'compress' : `compressTo${data[0]}`;
		data[1][1] = LZString[command](data[1][1]);
		if(data[6].constructor !== Array){
			data[6] = [];
		}
		data[6].push('sendCompress:true');
		// remove compressed
		data.splice(0, 1);
		return data;
	}
	receiveDecompress(data){
		// compress
		// data = [compressed, [oldMessage, message], elID, remoteUserId, requestID, options, result]
		let command = data[0] === 'compress' ? 'decompress' : `decompressFrom${data[0]}`;
		data[1][1] = LZString[command](data[1][1]);
		if(data[6].constructor !== Array){
			data[6] = [];
		}
		data[6].push('receiveDecompress:true');
		// remove compressed
		data.splice(0, 1);
		return data;
	}
}