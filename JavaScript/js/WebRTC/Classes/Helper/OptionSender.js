/*jshint esnext: true */

import {MasterOption} from 'SharedHelper/Prototype/Helper/MasterOption.js';
import {Diff_match_patchWorker} from 'WebRTC/Classes/Helper/Diff_match_patchWorker.js';
import {LZStringWorker} from 'WebRTC/Classes/Helper/LZStringWorker.js';

export class OptionSender extends MasterOption {
	constructor(SentMessage, returnMap){
		super(returnMap);

		this.SentMessage = SentMessage;
		// workers can only handle arrays in their data -> setOptions and getOptions has to be used to map to array
		/**
		 * (api hook)
		 * setOptions & getOptions convert map to array according to the number passed to the map at value array[0], since webworker can't handle send/receive Objects like Map
		 * 
		 * @param {Map([['diffed', [0, true]], ['compressed', [1, 'auto']]])} options
		 * @memberof OptionSender
		 */
		this.options = new Map([
			['diffed', [0, true]],
			//['diffed', [0, false]],
			['compressed', [1, 'auto']]
			//['compressed', [1, false]]
		]);

		// workers
		this.Diff_match_patchWorker = new Diff_match_patchWorker();
		this.Diff_match_patchWorker.create(
			this.Diff_match_patchWorker.sendDiff,
			(result) => {
				this.returnApply('sendDiff', result);
			}
		);
		this.LZStringWorker = new LZStringWorker();
		this.LZStringWorker.create(
			this.LZStringWorker.sendCompress,
			(result) => {
				this.returnApply('sendCompress', result);
			}
		);
	}
	init(...data){
		data.push(this.optionsConvertMapToArray(data.pop()));
		super.init(...data);
	}
	sendDiff(message, elID, remoteUserId, requestID, options, result = []){
		if(this.getOptions('diffed', options)){
			let oldMessage = this.SentMessage.get(elID, remoteUserId);
			if(oldMessage && oldMessage.length > 0 && message[1] !== oldMessage){
				this.Diff_match_patchWorker.run([oldMessage, message, elID, remoteUserId, requestID, options, result]);
				return true;
			}
		}
		// whole message
		result.push('sendDiff:false');
		this.returnApply('sendDiff', [message, elID, remoteUserId, requestID, options, result]);
		return false;
	}
	sendCompress(message, elID, remoteUserId, requestID, options, result = []){
		// compression: false (68kB in 68, 1MB in 2317),
				// Uint8Array (68kB in 91, 1MB in 6218),
				// EncodedURIComponent (68kB in 48, 1MB in 2484),
				// auto (chooses fastest compression 'EncodedURIComponent', if no base64 in message)
		let compressed = this.getOptions('compressed', options);
		if(compressed === 'auto'){
			compressed = message[1].indexOf('base64') === -1 ? 'EncodedURIComponent' : false;
			// set the options to the changed parameter, used insed message info for receive/decompress
			options = this.setOptions('compressed', compressed, options);
		}
		if(compressed){
			this.LZStringWorker.run([compressed, message, elID, remoteUserId, requestID, options, result]);
			return true;
		}
		// whole message
		result.push('sendCompress:false');
		this.returnApply('sendCompress', [message, elID, remoteUserId, requestID, options, result]);
		return false;
	}
	// workers can only handle arrays in their data -> setOptions and getOptions has to be used to map to array
	optionsConvertMapToArray(map){
		if(map instanceof Map){
			let arr = [];
			map.forEach((value, key) => {
				let i = this.options.get(key)[0];
				arr[i] = value;
			});
			return arr;
		}
		return [];
	}
	setOptions(name, prop, options = []){
		let i = this.options.get(name)[0];
		options[i] = prop;
		return options;
	}
	getOptions(name, options = []){
		let i = this.options.get(name)[0];
		return options[i] !== undefined ? options[i] : this.options.get(name)[1];
	}
	getCompressedStatus(options){
		let compressed = this.getOptions('compressed', options) === 'auto' ? false : this.getOptions('compressed', options);
		return compressed ? compressed : false;
	}
}