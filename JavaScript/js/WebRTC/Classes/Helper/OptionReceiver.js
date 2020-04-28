/*jshint esnext: true */

import {MasterOption} from 'SharedHelper/Prototype/Helper/MasterOption.js';
import {Diff_match_patchWorker} from 'WebRTC/Classes/Helper/Diff_match_patchWorker.js';
import {LZStringWorker} from 'WebRTC/Classes/Helper/LZStringWorker.js';

export class OptionReceiver extends MasterOption {
	constructor(returnMap){
		super(returnMap);

		// workers
		this.LZStringWorker = new LZStringWorker();
		this.LZStringWorker.create(
			this.LZStringWorker.receiveDecompress,
			(result) => {
				this.returnApply('receiveDecompress', result);
			}
		);
		this.Diff_match_patchWorker = new Diff_match_patchWorker();
		this.Diff_match_patchWorker.create(
			this.Diff_match_patchWorker.receiveDiff,
			(result) => {
				this.returnApply('receiveDiff', result);
			}
		);
	}
	receiveDecompress(message, elID, remoteUserId, requestID, options, result = []){
		// options[0] must be compress option set in MasterReceiver
		if(options[0] !== 'false'){
			if(options[0] === 'Uint8Array'){
				message[1] = message[1].split(',').map(Number);
			}
			this.LZStringWorker.run([options[0], message, elID, remoteUserId, requestID, options, result]);
			return true;
		}
		// whole message
		result.push('receiveDecompress:false');
		this.returnApply('receiveDecompress', [message, elID, remoteUserId, requestID, options, result]);
		return false;
	}
	receiveDiff(message, elID, remoteUserId, requestID, options, result = []){

		if(message[1].slice(0, 2) === '@@'){
			this.Diff_match_patchWorker.run([message, elID, remoteUserId, requestID, options, result]);
			return true;
		}
		// whole message
		result.push('receiveDiff:false');
		this.returnApply('receiveDiff', [message, elID, remoteUserId, requestID, options, result]);
		return false;
	}
}