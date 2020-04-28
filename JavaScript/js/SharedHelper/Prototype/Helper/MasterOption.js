/*jshint esnext: true */

export class MasterOption {
	constructor(returnMap = new Map()){
		// returnMap needs to set ['funcName', [func, scope]]
		this.returnMap = returnMap;
	}
	init(...data){
		this.returnApply('init', data);
	}
	returnApply(name, result = []){
		let funcScope = this.returnMap.get(name);
		if(funcScope){
			funcScope[0].apply(funcScope[1], result);
			return true;
		}
		console.warn(`SST: set returnMap at MasterOption to handle action: ${name}`);
		return false;
	}
}