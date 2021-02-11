/*jshint esnext: true */

import {MasterWorker} from 'SharedHelper/Prototype/Helper/MasterWorker.js';
import {Helper} from 'WebRTC/Classes/Helper/Helper.js';

export class Diff_match_patchWorker extends MasterWorker {
	constructor(){
		super(false);

		this.name = 'Diff_match_patchWorker';
		this.Helper = new Helper();
		this.scripts = this.Helper.addBaseURL([`jspm_packages/${System.map['tanaka-de-silva/google-diff-match-patch-js']}/diff_match_patch.js`], false);
	}
	sendDiff(data){
		// diff
		//https://code.google.com/p/google-diff-match-patch/
		// https://neil.fraser.name/software/diff_match_patch/svn/trunk/demos/demo_patch.html
		this.Diff_match_patch = new diff_match_patch();
		// data = [oldMessage, [rawMessage, message], elID, remoteUserId, requestID, options, result]
		let diff = this.Diff_match_patch.diff_main(data[0], data[1][1], true); // needs diff to react sensitive
		let patch = this.Diff_match_patch.patch_make(data[0], data[1][1], diff);
		data[1][1] = this.Diff_match_patch.patch_toText(patch);
		if(data[6].constructor !== Array){
			data[6] = [];
		}
		data[6].push('sendDiff:true');
		// remove oldMessage
		data.splice(0, 1);
		return data;
	}
	receiveDiff(data){
		//https://code.google.com/p/google-diff-match-patch/
		// https://neil.fraser.name/software/diff_match_patch/svn/trunk/demos/demo_patch.html
		this.Diff_match_patch = new diff_match_patch();
		// data = [[oldMessage, message], elID, remoteUserId, requestID, options, result]
		let patch = this.Diff_match_patch.patch_fromText(data[0][1]);
		let results = this.Diff_match_patch.patch_apply(patch, data[0][0]);
		if(data[5].constructor !== Array){
			data[5] = [];
		}
		if(results[1].indexOf(false) !== -1){
			data[5].push('receiveDiff:failed');
		}else{
			data[0][1] = results[0];
			data[5].push('receiveDiff:true');
		}
		return data;
	}
}