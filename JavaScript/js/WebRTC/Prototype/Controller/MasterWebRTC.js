/*jshint esnext: true */

import {SentMessage} from 'WebRTC/Classes/Helper/SentMessage.js';
import {ReceivedMessage} from 'WebRTC/Classes/Helper/ReceivedMessage.js';
import {Sender} from 'WebRTC/Classes/Domain/Sender.js';
import {ConnectionEvent} from 'WebRTC/Classes/Domain/ConnectionEvent.js';
import {Requestor} from 'WebRTC/Classes/Domain/Requestor.js';
import {Receiver} from 'WebRTC/Classes/Domain/Receiver.js';
//import 'muaz-khan/RTCMultiConnection/dist/RTCMultiConnection.js';
import 'WebRTC/lib/RTCMultiConnection.js'; // adjusted: this.onDataChannelMessage line 2426
import io from 'socket.io-client';

export class MasterWebRTC {
	constructor(){
		// connection
		window.io = io;
		this.connection = window.sst && window.sst.isDebug && window.WebRTC && window.WebRTC.connection ? window.WebRTC.connection : new RTCMultiConnection();
		//https://github.com/muaz-khan/RTCMultiConnection/issues/639
		//this.connection.socketURL = window.sst && window.sst.isDebug ? `http://${window.location.hostname}:9001/` : 'http://default-environment.digvjm9b3i.us-west-2.elasticbeanstalk.com:9001/'; // cd into repo: npm install --production / node server.js
		//this.connection.socketURL = window.sst && window.sst.isDebug ? `http://${window.location.hostname}:9001/` : 'https://webrtcweb.com:9001/'; // cd into repo: npm install --production / node server.js
		// server was updated and lib/RTCMultiConnection.js so needs update to work locally again
		//https://github.com/muaz-khan/RTCMultiConnection-Server
		//this.connection.socketURL = 'https://webrtcweb.com:9002/';
		this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/'; // cd into repo: npm install --production / node server.js
		//https://gist.github.com/yetithefoot/7592580
		// test at> https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
		this.connection.iceServers = [
			{
				urls: [
					'stun:stun01.sipphone.com',
					'stun:stun.l.google.com:19302?transport=udp',
					'turn:turn.anyfirewall.com:443?transport=tcp'/*,
					'stun:stun.schlund.de',
					'stun:stun.l.google.com:19302',
					'stun:stun1.l.google.com:19302',
					'stun:stun2.l.google.com:19302',
					'stun:stunserver.org',
					'stun:stun.ekiga.net',
					'stun:stun.fwdnet.net',
					'stun:stun.ideasip.com',
					'stun:stun.iptel.org',
					'stun:stun.rixtelecom.se',
					'stun:stun.softjoys.com',
					'stun:stun.voiparound.com',
					'stun:stun.voipbuster.com',
					'stun:stun.voipstunt.com',
					'stun:stun.voxgratia.org',
					'stun:stun.xten.com'*/
				]
			},
			{
				// stun:numb.viagenie.ca [weedshaker@gmail.com:peerwebsite]
				urls: 'stun:numb.viagenie.ca',
				credential: 'peerwebsite',
				username: 'weedshaker@gmail.com'
			}
		];
		this.connection.sdpConstraints.mandatory = {
			OfferToReceiveAudio: false,
			OfferToReceiveVideo: false
		};
		this.connection.session = {
			data: true,
			audio: false,
			video: false,
			screen: false
		};
		// Helper
		this.SentMessage = new SentMessage();
		this.ReceivedMessage = new ReceivedMessage();
		// Classes
		this.Sender = new Sender(this.connection, this.SentMessage);
		this.ConnectionEvent = new ConnectionEvent(this.connection, this.Sender, this.SentMessage);
		this.Requestor = new Requestor(this.Sender, this.SentMessage);
		this.Receiver = new Receiver(this.connection, this.Requestor, this.ReceivedMessage);

		// hot-reloader clear all
		if(window.sst && window.sst.isDebug){
			window.WebRTC = this;
		}
	}
	/**
	 * (api hook)
	 * 
	 * @memberof MasterWebRTC
	 */
	setIgnoreOption(){
		this.Sender.setIgnoreOption();
		this.Receiver.setIgnoreOption();
	}
	/**
	 * (api hook)
	 * 
	 * @memberof MasterWebRTC
	 */
	unsetIgnoreOption(){
		this.Sender.unsetIgnoreOption();
		this.Receiver.unsetIgnoreOption();
	}
}