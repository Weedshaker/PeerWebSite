/*jshint esnext: true */

// NOTE: this ServiceWorkers can't be loaded into a Blob. This file must be directly referenced. Don't extend it.
// Debug: http://localhost:3000/index_debug.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
// Test for QmbD7KXb5JrEmPooLeQBXvxJvjmHuHJLyynYVjzeDM5CbL at Cache

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
		this.doNotCache = ['socket.io'];
		this.doCacheStrict = ['tinyurl.com', 'api.qrserver.com']; // cache strict (don't ignore parameters etc.)
		// TODO: doCacheSrict is not respected, so I added the below to doNotCache
		this.doNotCache.concat(this.doCacheStrict)
		this.doRefreshCache = [location.origin];
		this.doNotIntercept = ['socket.io', 'tinyurl.com', /*'audioVideo=true', */'api.qrserver.com', '/css/', '/img/', '/JavaScript/', '/jspm_packages/', '/manifest.json', '/favicon.ico', '/#'];
		this.doIntercept = ['magnet:', 'magnet/', 'ipfs/']; // + location.origin added below on message
		this.ipfsPin = ['gateway.ipfs.io'];
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

		// strangly the cache function called in getMessageOrFetchOrCache looses its scope even call, apply don't work
		this.getCache = this.getCache.bind(this);
		this.setCache = this.setCache.bind(this);
		this.getFetchOrCache = this.getFetchOrCache.bind(this);
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
				// cache all and pin all ipfs
				if (!this.messageChannel) return this.getFetchOrCache(event.request);
				const intercept = this.clientId.isApproved() && this.doNotIntercept.every(url => !event.request.url.includes(url)) && this.doIntercept.some(url => event.request.url.includes(url))
				console.info(`@serviceworker intercept ${intercept}:`, event.request.url);
				// try to get it from webtorrent or ipfs first when interception is true
				// else if your offline get it from ipfs if it is an ipfs url
				if (intercept || (!self.navigator.onLine && this.doIntercept.some(url => event.request.url.includes(url)))) {
					return this.getMessageOrFetchOrCache(event.request);
				} else {
					//console.log('@serviceworker donot-intercept', event.request.url);
					// pin ipfs but get it here for streaming reasons
					if (this.ipfsPin.some(url => event.request.url.includes(url))) this.messageChannel.postMessage(['info', event.request.url]);
					return this.getFetchOrCache(event.request);
				}
			})());
		});
	}
	getMessageOrFetchOrCache(request) {
		// race message vs fetch
		const key = this.getRandomString();
		this.messageChannel.postMessage([request.url, key]);
		return new Promise(resolve => {
			const abortController = new AbortController();
			this.getFetchOrCache(request, abortController).then(response => resolve(response));
			// key, [success, failure] functions
			this.resolveMap.set(key, [data => {
				resolve(this.setCache(request, new Response(data[0], data[1])))
				// only abort non local resources, since cache has to be refreshed in case local files change
				if (this.doRefreshCache.every(url => !request.url.includes(url))) abortController.abort();
			}, () => {}]);
		});
	}
	getFetchOrCache(request, abortController = new AbortController()) {
		// race fetch vs cache
		return new Promise(resolve => {
			this.doFetchThenCache(request, abortController).then(response => {
				if (this.validateResponse(response)) resolve(response);
			});
			this.getCache(request).then(response => {
				if (this.validateResponse(response)) {
					resolve(response);
					// only abort non local resources, since cache has to be refreshed in case local files change
					if (this.doRefreshCache.every(url => !request.url.includes(url))) abortController.abort();
				}
			});
		});
	}
	doFetchThenCache(request, abortController) {
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
	error(error, request, toReturn) {
		console.warn('ServiceWorker:', error, request);
		return toReturn;
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
}

// the ServiceWorker gets loaded as followed: navigator.serviceWorker.register(this.serviceWorkerPath).then((registration) => {
const ServiceWorker = new MasterServiceWorker();
ServiceWorker.run();