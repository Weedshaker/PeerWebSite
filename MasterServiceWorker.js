/*jshint esnext: true */

// NOTE: this ServiceWorkers can't be loaded into a Blob. This file must be directly referenced. Don't extend it.
// Debug: http://localhost:3000/index.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
// Test for QmbD7KXb5JrEmPooLeQBXvxJvjmHuHJLyynYVjzeDM5CbL at Cache

class MasterServiceWorker {
	constructor(){
		this.name = 'ServiceWorker';
		this.cacheVersion = 'v1';
		this.devVersion = '0.15';
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
		this.doNotGetMessage = ['socket.io', 'preload.ipfs', 'tinyurl.com', 'api.qrserver.com', 'herokuapp.com', 'webrtcweb.com', '/css/', '/img/', '/JavaScript/', '/jspm_packages/', '/manifest.json', '/favicon.ico', '/#'];
		this.doNotGetMessageInitial = ['audioVideo=true', 'swIntercept=false'].concat(this.doNotGetMessage); // on first try do not get message but as fallback
		this.doGetMessage = ['magnet:', 'magnet/', 'ipfs/']; // + location.origin added below on message
		this.doNotGetCache = ['socket.io', 'preload.ipfs', 'tinyurl.com', 'api.qrserver.com', 'herokuapp.com', 'webrtcweb.com'];
		this.doRefreshCache = [location.origin, 'cdn.jsdelivr.net'];
		this.ipfsPin = ['gateway.ipfs.io'];
		// messaging
		this.onGoingMessaging = new Map(); // only message once per session
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
        self.addEventListener('install', event => event.waitUntil(caches.open(this.cacheVersion).then(cache => cache.addAll(this.precache))));
    }
	// onActivate claim client to make ServiceWorker take action at ongoing session
	addActivateEventListener() {
		//console.log('@serviceworker listening to activate event');
		self.addEventListener('activate', event => {
			//console.log('@serviceworker got activated!');
			//https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
			event.waitUntil(self.clients.claim());
			// NOTE: clearing the cache evtl. had strange sideeffects or waiting makes service worker unresponsive
			// onActivate clear old caches to avoid conflict
			//event.waitUntil(caches.keys().then(keyList => Promise.all(keyList.map(key => key !== this.cacheVersion ? caches.delete(key) : undefined))));
			//caches.keys().then(keyList => keyList.forEach(key => key !== this.cacheVersion ? caches.delete(key) : undefined));
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
				this.doGetMessage.push(event.data); // location.origin
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
			if (event && event.respondWith && event.request && event.request.url) {
				if (event.clientId !== undefined) this.clientId.recent = event.clientId;
				// pin ipfs
				if (this.ipfsPin.some(url => event.request.url.includes(url))) this.messageChannel.postMessage(['info', event.request.url]);
				// at the moment only two step by step levels exist. Level0: fetch + cache + message without streaming; Level1: message
				const actionsByLevels = [[], []];
				const getAllActionsLength = twoDimensionalArr => twoDimensionalArr.reduce((acc, cur) => (acc + cur.length || 0), 0) || 0;
				// doGetMessageInitial (incl. ipfs streams) = Level0
				const doGetMessageInitial = this.messageChannel && !this.doNotGetMessageInitial.some(url => event.request.url.includes(url)) && this.doGetMessage.some(url => event.request.url.includes(url));
				if (doGetMessageInitial) actionsByLevels[0].push(this.getMessage.bind(this, event.request));
				// doGetMessage = Level1 (excl. ipfs streams)
				if (!doGetMessageInitial && this.messageChannel && !this.doNotGetMessage.some(url => event.request.url.includes(url)) && this.doGetMessage.some(url => event.request.url.includes(url))) actionsByLevels[1].push(this.getMessage.bind(this, event.request));
				// doGetCache = Level0
				if (!this.doNotGetCache.some(url => event.request.url.includes(url))) actionsByLevels[0].push(this.getCache.bind(this, event.request));
				// from here intercept default fetch response
				if (!!getAllActionsLength(actionsByLevels)) {
					// add fetch as a default action to Level0
					const abortController = new AbortController();
					actionsByLevels[0].push(this.getFetch.bind(this, event.request, abortController));
					event.respondWith(new Promise((resolve, reject) => {
						let didResolve = false;
						const resolveFunc = (response, level, action) => {
							if (didResolve) {
								// uncomment for complete logging
								//console.info(`@serviceworker already resolved! Now at level${level}: ${event.request.url} and ignored  ${action.name}`);
							} else {
								console.info(`@serviceworker resolved at level${level}: ${event.request.url} with ${action.name}`);
								resolve(response);
								// abort if not fetch itself and cache does not need to be refreshed
								if (!action.name.includes('getFetch') && !this.doRefreshCache.some(url => event.request.url.includes(url))) abortController.abort();
							}
							didResolve = true;
						};
						const rejectFunc = this.getRejectFunc(reject, getAllActionsLength(actionsByLevels));
						// uncomment error for complete logging
						const execActions = (actions, level) => Promise.all(actions.map(action => action().then(response => resolveFunc(response, level, action)).catch(error => rejectFunc(`@serviceworker rejected at level${level}: ${event.request.url} at action ${action.name}`/*, error*/))));
						// run Level0 messageInit vs cache vs fetch || run Leve1 message (incl. ipfs stream)
						execActions(actionsByLevels[0], 0).finally(error => {
							if (!didResolve) execActions(actionsByLevels[1], 1);
						});
					}));
				}
			}

		});
	}
	getFetch(request, abortController = new AbortController(), setCache = true, overwrite = true) {
		return new Promise((resolve, reject) => {
			// Fetch
			fetch(request, {signal: abortController.signal}).then(response => {
				if (setCache) {
					this.setCache(request, response, overwrite).then(response => {
						if (this.validateResponse(response)) {
							resolve(response);
						} else {
							reject(request.url);
						}
					}).catch(error => reject(`ServiceWorker: Fetch caching failed for ${request.url}`));
				} else if (this.validateResponse(response)) {
					resolve(response);
				} else {
					reject(request.url);
				}
			}).catch(error => reject(request.url));
		});
	}
	// don't overwrite to cache since it is already at indexedDB, also the audio element gets confused when it gets resolved message response mixed fetch response
	// test if corrupted streaming cache was introduced there: step v. 0.15: setCache=false
	getMessage(request, setCache = false, overwrite = false) {
		// already messaged answer with such
		if (this.onGoingMessaging.has(request.url)) return this.onGoingMessaging.get(request.url);
		// new message
		const messagePromise = new Promise((resolve, reject) => {
			const key = this.getRandomString();
			this.messageChannel.postMessage([request.url, key]);
			// key, [success, failure] functions
			this.resolveMap.set(key, [
				data => {
					const response = new Response(data[0], data[1]);
					if (setCache) {
						// only write to cache when there is none with this key, since ipfs.cat on streams sometimes gives back empty objects. TODO: look deeper at IPFS
						this.setCache(request, response, overwrite).then(response => resolve(response)).catch(error => reject(`ServiceWorker: Message caching failed for ${request.url}`));
					} else {
						resolve(response);
					}
				},
				() => reject(`ServiceWorker: No message response for ${request.url}`)
			]);
		}).finally(() => {
			if (this.onGoingMessaging.has(request.url)) this.onGoingMessaging.delete(request.url);
		});
		this.onGoingMessaging.set(request.url, messagePromise);
		return messagePromise;
	}
	getCache(request) {
		return new Promise((resolve, reject) => {
			caches.open(this.cacheVersion).then(cache => {
				cache.match(request, {ignoreSearch: true, ignoreMethod: true, ignoreVary: true}).then(response => {
					// only overwrite in case cache response would not validate (not found resolves undefined)
					if (this.validateResponse(response)) {
						resolve(response);
					} else {
						reject(request.url);
					}
				}).catch(error => reject(`ServiceWorker: Match cache failed for ${request.url}`));
			}).catch(error => reject(`ServiceWorker: Open cache failed for ${request.url}`));
		});
	}
	setCache(request, response, overwrite = true) {
		// don't cache POST as well as those which doNotGetCache
		if (request.method === 'POST' || this.doNotGetCache.some(url => request.url.includes(url))) return Promise.resolve(response);
		return caches.open(this.cacheVersion).then(cache => {
			const responseClone = response.clone();
			if (this.validateResponse(responseClone)) {
				const put = () => cache.put(request, responseClone).catch(error => this.error(error, request));
				if (overwrite) {
					put();
				} else {
					// only overwrite in case cache response would not validate
					this.getCache(request).catch(error => put());
				}
			}
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
	get isOnline() {
		return self.navigator.onLine;
	}
}

// the ServiceWorker gets loaded as followed: navigator.serviceWorker.register(this.serviceWorkerPath).then((registration) => {
const ServiceWorker = new MasterServiceWorker();
ServiceWorker.run();
