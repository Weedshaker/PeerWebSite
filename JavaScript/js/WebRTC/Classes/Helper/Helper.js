/*jshint esnext: true */

import {MasterHelper} from 'SharedHelper/Prototype/Helper/MasterHelper.js';

export class Helper extends MasterHelper {
	/**
	 * event handler (api hook)
	 * 
	 * @param {Function} func 
	 * @param {string} [scope = this]
	 * @param {string} [args = [message = '', elID = '']]
	 * @memberof Helper
	 */
	getEventHandler(){
		return {
			container: [],
			add: function(func, scope = this, args = []){
				this.container.push({func: func, scope: scope, args: args});
			},
			remove: function(func, scope = false){
				this.container = this.container.filter((value, index, array) => {
	                if(func === value.func && (scope === false || scope === value.scope)){
	                    return false;
	                }
	                return true;
	            });
			}
		};
	}
	arrayKeyValStrToObj(arr = ['key:val', 'key:val'], needle = ':'){
		let obj = {};
		arr.forEach((e) => {
			e = e.split(needle);
			let val = e[1].trim();
			obj[e[0].trim()] = val === 'true' || val === 'false' ? val === 'true' : val;
		});
		return obj;
	}
}