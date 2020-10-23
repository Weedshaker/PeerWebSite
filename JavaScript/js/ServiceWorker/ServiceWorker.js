/*jshint esnext: true */

import { Helper } from 'WebTorrent/Classes/Helper/Helper.js';

export class ServiceWorker {
	constructor(serviceWorkerPath = 'MasterServiceWorker.js', serviceWorkerScope = './', webTorrentGetBlobByFileNameArray, ipfsGetBlobByCidArray, infoFuncs = []){
		this.serviceWorkerPath = serviceWorkerPath;
		this.serviceWorkerScope = serviceWorkerScope;
		// array of getBlobByFileName of webtorrent receiver [0] and seeder [1]
		this.webTorrentGetBlobByFileNameArray = webTorrentGetBlobByFileNameArray;
		this.ipfsGetBlobByCidArray = ipfsGetBlobByCidArray;
		this.infoFuncs = infoFuncs;
		
		this.name = 'ServiceWorker';
		this.Worker = null;
		this.messageChannel = new MessageChannel();
		this.Helper = new Helper();
		// NOTE: Karma Tests don't work, more information at ./JavaScript/tests/ServiceWorker/ServiceWorker.js
		this.serviceWorkerPath = this.Helper.addBaseURL([this.serviceWorkerPath])[0];
		this.serviceWorkerScope = this.Helper.addBaseURL([this.serviceWorkerScope])[0];
	}
	run(){
		if (navigator.serviceWorker) {
			this.addReadyEventListener();
			this.register();
		} else {
			console.warn('SST:Service Worker is not supported in this browser.')
		}
	}
	// wait until the ServiceWorker is ready and then addMessageChannelEventListener
	addReadyEventListener() {
		//console.log('@sw_helper listening to ready event');
		navigator.serviceWorker.ready.then((registration) => {
			this.Worker = registration.active;
			this.addMessageChannelEventListener();
			// send port to service worker
			//console.log('@sw_helper sending port to ServiceWorker');
			this.Worker.postMessage(location.origin, [this.messageChannel.port2]);
		}).catch((e) => {
			console.error(e);
		});
	}
	// gets executed on every message received from ServiceWorker
	addMessageChannelEventListener() {
		this.messageChannel.port1.onmessage = (event) => {
			if (event.data === '!!!ready') {
				//console.log('@sw_helper Intercept is ready!');
			} else if (Array.isArray(event.data) && event.data[0].includes('/')){
				let name = event.data[0].split('/').slice(-1)[0];
				// Promise.all is not supported by jspm "buildConfig": { "transpileES6": true
				const blobs = [];
				const resolve = (newBlob, needsTwo = false) => {
					blobs.push(newBlob);
					if (needsTwo && (blobs[0] === undefined || blobs[1] === undefined)) return false;
					const blob = blobs[0] || blobs[1];
					if (!blob) {
						this.Worker.postMessage([event.data, false]);
						return null;
					}
					const init = { 'status': 200, 'statusText': name };
					this.Worker.postMessage([event.data, [blob, init]]);
					return !!blob;
				};
				// only ask one instance of webtorrent when there is a magnetURI to resolve !!!if you change this, change equal at JavaScript/js/WebTorrent/Prototype/Domain/MasterWebTorrent.js.getBlobByFileName!!!
				if(name.includes('magnet:') || event.data[0].includes('magnet/') || name.includes('?xt=urn:')){
					// promise returns null or blob
					this.webTorrentGetBlobByFileNameArray[0](name).then(blob => resolve(blob));
				}else if (event.data[0].includes('ipfs/')) {
					this.ipfsGetBlobByCidArray[0](event.data[0]).then(blob => resolve(blob));
				}else{
					// promise returns null or blob
					this.webTorrentGetBlobByFileNameArray[0](name).then(blob => resolve(blob, true));
					this.webTorrentGetBlobByFileNameArray[1](name).then(blob => resolve(blob, true));
				}
			} else if (Array.isArray(event.data) && event.data[0] === 'info') {
				this.infoFuncs.forEach(func => func(event.data[1]));
			} else if (Array.isArray(event.data) && event.data[0] === 'version') {
				$('#sw-version').text(`; sw-v. ${event.data[1]}`);
			} else {
				this.Worker.postMessage([event.data, false]);
			}
		};
	}
	// register the service worker
	register() {
		//console.log(`@sw_helper register: ${this.serviceWorkerPath}; with scope: ${this.serviceWorkerScope}`);
		navigator.serviceWorker.register(this.serviceWorkerPath, { scope: this.serviceWorkerScope }).then((registration) => {
			registration.update();
			//console.log('@sw_helper registered', registration);
		}).catch((e) => {
			console.error(e);
		});
	}
}