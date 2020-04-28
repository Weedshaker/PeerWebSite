/*jshint esnext: true */

import dom2hscript from 'AkeemMcLennon/dom2hscript/dist/dom2hscript.js';
import {diff, patch, h} from 'Weedshaker/virtual-dom/dist/virtual-dom.js';

export class MasterDom {
	constructor(){
	}
	setData(container, oldContent, newContent){
		if(oldContent && newContent){
			// no use for webworkers =>
			// dom2hscript requires DomParser, which is not available inside webworkers
			// virtual-dom needs to access DOM directly to patch
			let newTree = eval(dom2hscript.parseHTML(`<div>${newContent}</div>`));
			let oldTree = eval(dom2hscript.parseHTML(`<div>${oldContent}</div>`));
			let patches = diff(oldTree, newTree);
			return patch(container[0], patches);
		}else{
			return container.html(newContent);
		}
	}
}