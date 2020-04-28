/*jshint esnext: true */

import {MockConnection} from 'mock/WebRTC/Classes/Domain/MockConnection.js';
import {App} from 'SampleApp/Classes/Controller/App.js';

let Mock = new MockConnection();
let App1 = new App();
App1.WebRTC.Sender.OptionSender.options.set('compressed', true);
App1.WebRTC.Sender.OptionSender.options.set('diffed', true);
App1.createElements();
console.log('mock loaded!');