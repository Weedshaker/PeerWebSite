/*jshint esnext: true */

// NOTE: this ServiceWorkers can't be loaded into a Blob. This file must be directly referenced. Don't extend it.

class MasterServiceWorker {
	constructor(){
		this.name = 'ServiceWorker';
		this.version = 'v1';
        this.precache = [
            './',
			'./index.html',
			'./manifest.json',
			'./img/apple-icon-57x57.png',
			'./img/ms-icon-144x144.png',
			'./favicon.ico',
			'./JavaScript/webRTC.js',
			'./index_debug.html',
			'./JavaScript/js/debug.js',
			'./JavaScript/js/init.js',
			'./css/style.css',
			'./css/mui.css',
			'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js',
			'https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js',
			'./jspm_packages/system.js',
			'./config.js'
		];
		// ipfs + webtorrent
		this.doNotIntercept = ['socket.io', 'tinyurl.com', 'swIntercept=false', 'api.qrserver.com', '/css/', '/img/', '/JavaScript/', '/jspm_packages/', '/manifest.json', '/favicon.ico', '/#'];
		this.doIntercept = ['magnet:', 'magnet/', 'ipfs/']; // + location.origin added below on message
		// Turn of Pinning for IPFS, since stuff gets cached in the service worker it maybe better to not double save at IndexedDB
		//this.justInform = ['gateway.ipfs.io'];
		this.justInform = [];
		// messaging
		this.messageChannel = null;
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
		this.addInstallEventListener();
		this.addActivateEventListener();
		this.addMessageChannelEventListener();
		this.addFetchEventListener();
	}
	// onInstall init cache
    addInstallEventListener() {
        self.addEventListener('install', event => event.waitUntil(caches.open(this.version).then(cache => cache.addAll(this.precache))));
    }
	// onActivate claim client to make ServiceWorker take action at ongoing session
	addActivateEventListener() {
		//console.log('@serviceworker listening to activate event');
		self.addEventListener('activate', event => {
			//console.log('@serviceworker got activated!');
			event.waitUntil(self.clients.claim());
			// onActivate clear old caches to avoid conflict
			event => event.waitUntil(caches.keys().then(keyList => Promise.all(keyList.map(key => key !== this.version ? caches.delete(key) : undefined))));
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
				// use message channels, etc. when online
				if (self.navigator.onLine) {
					if (!this.messageChannel) return this.fetch(event.request);
					const intercept = this.clientId.isApproved() && this.doNotIntercept.every(url => !event.request.url.includes(url)) && this.doIntercept.some(url => event.request.url.includes(url))
					console.info(`@serviceworker intercept ${intercept}:`, event.request.url);
					if (intercept) {
						const key = this.getRandomString();
						this.messageChannel.postMessage([event.request.url, key]);
						return new Promise((resolve, reject) => {
							// key, [success, failure] functions
							this.resolveMap.set(key, [(data) => { resolve(this.cache(event.request, new Response(data[0], data[1]))); }, () => { resolve(this.fetch(event.request)); }]);
						});
					} else {
						//console.log('@serviceworker donot-intercept', event.request.url);
						if (this.justInform.some(url => event.request.url.includes(url))) this.messageChannel.postMessage(['info', event.request.url]);
						return this.fetch(event.request);
					}
				// when offline
				} else {
					return caches.open(this.version).then(cache => cache.match(event.request, {ignoreSearch: true, ignoreMethod: true, ignoreVary: true})).catch(error => this.error(error));
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
	// fetch and cache
	fetch(request) {
		return fetch(request).then(response => this.cache(request, response)).catch(error => this.error(error, request));
	}
	cache(request, response) {
		return caches.open(this.version).then(cache => {
			cache.put(request, response.clone()).catch(error => this.error(error));
			return response;
		}).catch(error => this.error(error, response));
	}
	error(error, toReturn) {
		console.warn('ServiceWorker:', error);
		return toReturn;
	}
}

// the ServiceWorker gets loaded as followed: navigator.serviceWorker.register(this.serviceWorkerPath).then((registration) => {
const ServiceWorker = new MasterServiceWorker();
ServiceWorker.run();