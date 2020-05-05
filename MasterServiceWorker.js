/*jshint esnext: true */

// NOTE: this ServiceWorkers can't be loaded into a Blob. This file must be directly referenced. Don't extend it.

class MasterServiceWorker {
	constructor(){
		this.name = 'ServiceWorker';
		this.messageChannel = null;
		this.doNotIntercept = ['socket.io', 'peerweb.site/img/', 'peerweb.site/jspm_packages/'];
		this.doIntercept = [];
		this.resolveMap = new Map(); // used to resolve after the message response
		this.clientId = {
			approved: -1,
			_recent: -2,
			get recent() {return this._recent},
			set recent(val) {
				this._recent = val;
				// on first startup, addMessageChannelEventListener will initialize the clientId but hasn't got any fetch event with clientId, so it becomes -2, in this case approve the next recent and remove this if statement
				// this would still trigger if no fetch on 1st session and then all initial fetches of files for the program before ready with onMessage, but somehow the service worker does empty string on clientId
				if (this.approved === -2) {
					this.approved = val;
					Object.defineProperty(this, 'recent', {
						get: function() { return this._recent },
						set: function (val) { this._recent = val; }
					});
				}
			},
			isApproved: function() {return this.approved === this.recent;}
		}; // used to track, if new session
	}
	run(){
		//console.log('@serviceworker run');
		this.addActivateEventListener();
		this.addMessageChannelEventListener();
		this.addFetchEventListener();
	}
	// onActivate claim client to make ServiceWorker take action at ongoing session
	addActivateEventListener() {
		//console.log('@serviceworker listening to activate event');
		self.addEventListener('activate', event => {
			//console.log('@serviceworker got activated!');
			event.waitUntil(self.clients.claim());
		});
	}
	// gets executed on every message received from dom and is used to save the communication channel
	addMessageChannelEventListener() {
		self.addEventListener('message', event => {
			if (!this.clientId.isApproved() && event.ports[0]) {
				//console.log('@serviceworker !!!ready');
				this.clientId.approved = this.clientId.recent;
				// save messageChannel
				this.messageChannel = event.ports[0];
				this.doIntercept.push(event.data); // location.origin
				this.messageChannel.postMessage('!!!ready');
			} else if (event.data && Array.isArray(event.data[0])) {
				// execute resolving function
				//console.log('@serviceworker got response:', event.data);
				const resolveFuncs = this.resolveMap.get(event.data[0][1]); // key
				if (resolveFuncs) {
					event.data[1] && Array.isArray(event.data[1]) ? resolveFuncs[0](event.data[1]) : resolveFuncs[1]();
					this.resolveMap.delete(event.data[0][1]);
				}
			}
		});
	}
	// intercepts fetches, asks dom and resolves accordingly
	addFetchEventListener() {
		self.addEventListener('fetch', event => {
			this.clientId.recent = event.clientId;
			// feed a selfexecuting function
			event.respondWith((() => {
				if (this.clientId.isApproved() && this.doNotIntercept.every(url => !event.request.url.includes(url)) && this.doIntercept.some(url => event.request.url.includes(url))) {
					console.info('@serviceworker intercept', event.request.url);
					const key = this.getRandomString();
					this.messageChannel.postMessage([event.request.url, key]);
					return new Promise((resolve, reject) => {
						// key, [success, failure] functions
						this.resolveMap.set(key, [(data) => { resolve(new Response(data[0], data[1])); }, () => { resolve(fetch(event.request)); }]);
					});
				} else {
					//console.log('@serviceworker donot-intercept', event.request.url);
					return fetch(event.request);
				}
			})());
		});
	}
	getRandomString() {
		if (self.crypto && self.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
			var a = self.crypto.getRandomValues(new Uint32Array(3)),
				token = '';
			for (var i = 0, l = a.length; i < l; i++) {
				token += a[i].toString(36);
			}
			return token;
		} else {
			return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
		}
	}
}

// the ServiceWorker gets loaded as followed: navigator.serviceWorker.register(this.serviceWorkerPath).then((registration) => {
const ServiceWorker = new MasterServiceWorker();
ServiceWorker.run();