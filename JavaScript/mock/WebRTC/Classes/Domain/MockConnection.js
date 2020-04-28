/*jshint esnext: true */

import {MasterMockConnection} from 'mock/WebRTC/Prototype/Domain/MasterMockConnection.js';

export class MockConnection extends MasterMockConnection {
	constructor(){
		window.WebRTC = {};
		return window.WebRTC.connection = super();
	}
}