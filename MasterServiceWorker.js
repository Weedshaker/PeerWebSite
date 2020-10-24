/*jshint esnext: true */

// NOTE: this ServiceWorkers can't be loaded into a Blob. This file must be directly referenced. Don't extend it.
// Debug: http://localhost:3000/index.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
// Test for QmbD7KXb5JrEmPooLeQBXvxJvjmHuHJLyynYVjzeDM5CbL at Cache

class MasterServiceWorker {
	constructor(){
		this.name = 'ServiceWorker';
		this.version = 'v1';
		this.devVersion = '0.3';
        this.precache = [
            './',
			'./index.html',
			'./manifest.json',
			'./img/apple-icon-57x57.png',
			'./img/ms-icon-144x144.png',
			'./favicon.ico',
			'./JavaScript/webRTC.js',
			'./css/style.css',
			'./css/mui.css',
			// update these jspm_packages links when version gets updated
			'./jspm_packages/github/twbs/bootstrap@3.3.7/css/bootstrap.min.css',
			'./jspm_packages/github/tanaka-de-silva/google-diff-match-patch-js@1.0.0/diff_match_patch.js',
			'./jspm_packages/github/pieroxy/lz-string@1.4.4/libs/lz-string.min.js',
			'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js',
			'https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js',
		];
		// ipfs + webtorrent
		this.doRefreshCache = [location.origin];
		this.doNotIntercept = ['socket.io', 'preload.ipfs', 'tinyurl.com', 'api.qrserver.com', '/css/', '/img/', '/JavaScript/', '/jspm_packages/', '/manifest.json', '/favicon.ico', '/#'];
		this.doIntercept = ['magnet:', 'magnet/', 'ipfs/']; // + location.origin added below on message
		this.doCacheStrict = ['tinyurl.com', 'api.qrserver.com']; // cache strict (don't ignore parameters etc.) // TODO: doCacheStrict is not respected, so I added the below to doNotCache
		this.doNotCache = ['socket.io', 'preload.ipfs', 'swIntercept=false', 'audioVideo=true'].concat(this.doIntercept).concat(this.doCacheStrict); // sw-cache makes trouble with streaming content so we don't cache all doIntercept
		this.ipfsPin = ['gateway.ipfs.io'];
		this.onGoingMessaging = new Map(); // only message once per session
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

		// strangly the cache function called in getFetchOrMessage looses its scope even call, apply don't work
		this.getCache = this.getCache.bind(this);
		this.setCache = this.setCache.bind(this);
		this.getFetchSetCacheOrGetCache = this.getFetchSetCacheOrGetCache.bind(this);
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
			// NOTE: not needed when refreshing cache on doRefreshCache
			// NOTE: clearing the cache evtl. had strange sideeffects or waiting makes service worker unresponsive
			// onActivate clear old caches to avoid conflict
			//event.waitUntil(caches.keys().then(keyList => Promise.all(keyList.map(key => key !== this.version ? caches.delete(key) : undefined))));
			//caches.keys().then(keyList => keyList.forEach(key => key !== this.version ? caches.delete(key) : undefined));
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
				this.messageChannel.postMessage(['version', this.devVersion]);
				this.onGoingMessaging.clear();
			} else if (event.data && Array.isArray(event.data[0])) {
				// execute resolving function
				//console.log('@serviceworker got response:', event.data);
				const resolveFuncs = this.resolveMap.get(event.data[0][1]); // key
				if (resolveFuncs) {
					event.data[1] && Array.isArray(event.data[1]) && event.data[1][0] && event.data[1][1] ? resolveFuncs[0](event.data[1]) : resolveFuncs[1]();
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
				// cache all and pin all ipfs
				if (!this.messageChannel) return this.getFetchSetCacheOrGetCache(event.request);
				// pin ipfs
				if (this.ipfsPin.some(url => event.request.url.includes(url))) this.messageChannel.postMessage(['info', event.request.url]);
				const intercept = this.clientId.isApproved() && this.doNotIntercept.every(url => !event.request.url.includes(url)) && this.doIntercept.some(url => event.request.url.includes(url))
				console.info(`@serviceworker intercept ${intercept}:`, event.request.url);
				// try to get it from webtorrent or ipfs first when interception is true
				// else if your offline get it from ipfs if it is an ipfs url
				if (intercept || (!self.navigator.onLine && this.doIntercept.some(url => event.request.url.includes(url)))) {
					return this.getFetchOrMessage(event.request);
				} else {
					return this.getFetchSetCacheOrGetCache(event.request);
				}
			})());
		});
	}
	getFetchOrMessage(request) {
		// race message vs fetch
		const sendMessage = () => {
			// already messaged answer with such
			if (this.onGoingMessaging.has(request.url)) return this.onGoingMessaging.get(request.url);
			// new message
			const messagePromise = new Promise((resolve, reject) => {
				const key = this.getRandomString();
				this.messageChannel.postMessage([request.url, key]);
				// key, [success, failure] functions
				this.resolveMap.set(key, [
					data => {
						resolve(new Response(data[0], data[1]))
					},
					() => reject(`ServiceWorker: No message response for ${request.url}`)
				]);
			}).finally(() => {
				if (this.onGoingMessaging.has(request.url)) this.onGoingMessaging.delete(request.url);
			});
			this.onGoingMessaging.set(request.url, messagePromise);
			return messagePromise;
		};
		const getFetch = abortController => {
			return new Promise((resolve, reject) => {
				fetch(request, {signal: abortController.signal}).then(response => {
					if (this.validateResponse(response)) {
						resolve(response);
					} else {
						reject(request.url);
					}
				}).catch(error => reject(error));
			});
		}
		return new Promise((resolve, reject) => {
			const rejectFunc = this.getRejectFunc(reject);
			const abortController = new AbortController()
			getFetch(abortController).then(response => resolve(response)).catch(error => rejectFunc(request.url, error));
			// TODO: somehow the browser has an issue properly streaming the message response (results in no seekeing and other weird sideeffects)
			sendMessage().then(response => {
				resolve(response);
				abortController.abort();
			}).catch(error => rejectFunc(request.url, error));
		});
	}
	getFetchSetCacheOrGetCache(request, abortController = new AbortController()) {
		// race fetch vs cache
		return new Promise((resolve, reject) => {
			const rejectFunc = this.getRejectFunc(reject);
			// Fetch
			this.getFetchSetCache(request, abortController).then(response => {
				if (this.validateResponse(response)) {
					resolve(response);
				} else {
					rejectFunc(request.url);
				}
			}).catch(error => rejectFunc(request.url, error));
			// Cache
			this.getCache(request).then(response => {
				if (this.validateResponse(response)) {
					// only abort non local resources, since cache has to be refreshed in case local files change
					if (request.url && this.doRefreshCache.every(url => !request.url.includes(url))) abortController.abort();
					resolve(response);
				} else {
					rejectFunc(request.url);
				}
			}).catch(error => rejectFunc(request.url, error));
		});
	}
	getFetchSetCache(request, abortController) {
		return fetch(request, {signal: abortController.signal}).then(response => this.setCache(request, response)).catch(error => this.error(error, request, request));
	}
	getCache(request) {
		return caches.open(this.version).then(cache => {
			const options = request.url && this.doCacheStrict.some(url => request.url.includes(url)) ? {} : {ignoreSearch: true, ignoreMethod: true, ignoreVary: true};
			return cache.match(request, options);
		}).catch(error => this.error(error, request));
	}
	setCache(request, response) {
		// don't cache POST
		if (request.method === 'POST' || (request.url && this.doNotCache.some(url => request.url.includes(url)))) return response;
		return caches.open(this.version).then(cache => {
			const responseClone = response.clone();
			if (this.validateResponse(responseClone)) cache.put(request, responseClone).catch(error => this.error(error, request));
			return response;
		}).catch(error => this.error(error, request, response));
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
	validateResponse(response) {
		// 0 is for cache
		return response && (response.status === 0 || (response.status >= 200 && response.status <= 299));
	}
	getRejectFunc(reject, max = 2) {
		let counter = 0;
		return (url, error) => {
			counter++;
			if (counter >= max) reject(error || `ServiceWorker: No response for ${url}`);
			if (error) this.error(error, url);
		}
	}
	error(error, request, toReturn) {
		console[error && error.message && error.message.includes('user aborted a request') ? 'info' : 'warn']('ServiceWorker Error:', error, request);
		return toReturn;
	}
}

// the ServiceWorker gets loaded as followed: navigator.serviceWorker.register(this.serviceWorkerPath).then((registration) => {
const ServiceWorker = new MasterServiceWorker();
ServiceWorker.run();