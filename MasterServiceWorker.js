/*jshint esnext: true */

// NOTE: this ServiceWorkers can't be loaded into a Blob. This file must be directly referenced. Don't extend it.
// Debug: http://localhost:3000/index.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
// Test for QmbD7KXb5JrEmPooLeQBXvxJvjmHuHJLyynYVjzeDM5CbL at Cache

class MasterServiceWorker {
	constructor(){
		this.name = 'ServiceWorker';
		this.cacheVersion = 'v1';
		this.devVersion = '0.18';
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
			'./jspm_packages/github/twbs/bootstrap@3.3.7/fonts/glyphicons-halflings-regular.eot',
			'./jspm_packages/github/twbs/bootstrap@3.3.7/fonts/glyphicons-halflings-regular.svg',
			'./jspm_packages/github/twbs/bootstrap@3.3.7/fonts/glyphicons-halflings-regular.ttf',
			'./jspm_packages/github/twbs/bootstrap@3.3.7/fonts/glyphicons-halflings-regular.woff',
			'./jspm_packages/github/twbs/bootstrap@3.3.7/fonts/glyphicons-halflings-regular.woff2',
			'./jspm_packages/github/tanaka-de-silva/google-diff-match-patch-js@1.0.0/diff_match_patch.js',
			'./jspm_packages/github/pieroxy/lz-string@1.4.4/libs/lz-string.min.js',
			'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js',
			'https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js',
		];
		this.doNotGetMessage = ['socket.io', 'preload.ipfs', 'tinyurl.com', 'api.qrserver.com', 'herokuapp.com', 'webrtcweb.com', '/css/', '/img/', '/JavaScript/', '/jspm_packages/', '/manifest.json', '/favicon.ico', '/#'];
		this.doGetMessage = ['magnet:', 'magnet/', 'ipfs/']; // + location.origin added below on message
		this.doNotGetCache = ['socket.io', 'preload.ipfs', 'tinyurl.com', 'api.qrserver.com', 'herokuapp.com', 'webrtcweb.com'];
		this.doRefreshCache = [location.origin, 'cdn.jsdelivr.net'];
		this.isStream = ['audioVideo=true', 'swIntercept=false'];
		this.ipfsPin = ['gateway.ipfs.io'];
		this.getMessageIsStreamTimeout = 3000;
		// messaging
		this.resolvedMessages = new Map(); // only message once per session
		this.messageChannel = null;
		// keep track of session to what it resolved. this helps avoiding serving mixed content responses
		this.urlsContext = new Map();
		this.sessionResolvedMessageContext = []; // the first time a message is requested it must answer with full range and status 200
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
        self.addEventListener('install', event => {
			self.skipWaiting();
			event.waitUntil(caches.open(this.cacheVersion).then(cache => cache.addAll(this.precache)));
		});
    }
	// onActivate claim client to make ServiceWorker take action at ongoing session
	addActivateEventListener() {
		//console.log('@serviceworker listening to activate event');
		self.addEventListener('activate', event => {
			//console.log('@serviceworker got activated!');
			//https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
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
				this.doGetMessage.push(event.data); // location.origin
				this.messageChannel.postMessage('!!!ready');
				this.messageChannel.postMessage(['version', this.devVersion]);
				this.sessionResolvedMessageContext = [];
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
			if (event) {
				// update clientId
				if (event.clientId !== undefined) this.clientId.recent = event.clientId;
				if (event.respondWith && event.request && event.request.method && event.request.method !== 'POST' && event.request.url && event.request.headers) {
					// pin ipfs
					if (this.ipfsPin.some(url => event.request.url.includes(url))) this.messageChannel.postMessage(['info', event.request.url]);
					// controller
					const getMessage = this.messageChannel && !this.doNotGetMessage.some(url => event.request.url.includes(url)) && this.doGetMessage.some(url => event.request.url.includes(url));
					const isStream = !!event.request.headers.get('range') || this.isStream.some(url => event.request.url.includes(url));
					// only use sw-cache when !getMessage or getMessage but !isStream
					const getCache = (!getMessage || !isStream) && !this.doNotGetCache.some(url => event.request.url.includes(url));
					// reset the context
					this.setUrlsContext(event.request);
					const isContextFetchCache = this.urlsContext.get(event.request.url) === 'fetchCache';
					// from here intercept default fetch response
					if (getMessage || getCache) {
						event.respondWith(new Promise((resolve, reject) => {
							const getFetch = this.isOnline;
							const resolveFunc = this.getResolveFunc(resolve);
							const fetchCache = (resolveFunc, rejectFunc, error, type = 'none') => {
								if (!getFetch && !getCache) return Promise.resolve(rejectFunc(`@serviceworker resolvedMessages failed with no fallback for: ${event.request.url}`, error));
								const abortController = new AbortController();
								const promises = [];
								if (getFetch) promises.push(this.getFetch(event.request, abortController, getCache).then(response => {
									if (resolveFunc(response, `@serviceworker [${type}] success getFetch for ${event.request.url}`)) this.setUrlsContext(event.request, 'fetchCache');
								}).catch(error => rejectFunc(`@serviceworker [${type}] getFetch failed for: ${event.request.url}`, error)));
								if (getCache) promises.push(this.getCache(event.request).then(response => {
									if (resolveFunc(response, `@serviceworker [${type}] success getCache for ${event.request.url}`)) this.setUrlsContext(event.request, 'fetchCache');
									// abort if not fetch itself and cache does not need to be refreshed
									if (abortController && !this.doRefreshCache.some(url => event.request.url.includes(url))) abortController.abort();
								}).catch(error => rejectFunc(`@serviceworker [${type}] getCache failed for: ${event.request.url}`, error)));
								return Promise.all(promises);
							};
							let type = 'none';
							// no message channel request || already resolved with fetch/cache, which forces it to not mix fetch/cache with responses from message in the same session. This would have sideeffects that seeking doesn't work after intial 0- was resolved by fetch/cache
							if (!getMessage || (isContextFetchCache && (getCache || getFetch))) { // !getMessage && getCache
								type = 'fetchVsCache';
								fetchCache(resolveFunc, this.getRejectFunc(reject, getFetch ? 2 : 1), undefined, type);
								return;
							}
							if (isStream) { // getMessage && isStream && !getCache
								// message with full response got already resolved
								if (this.resolvedMessages.has(event.request.url)) {
									type = 'message.catch(fetch)';
									const rejectFunc = this.getRejectFunc(reject, 2);
									this.getMessage(event.request, this.sessionResolvedMessageContext.includes(event.request.url)).then(response => {
										if (resolveFunc(response, `@serviceworker [${type}] success getMessage for ${event.request.url}`)) this.setUrlsContext(event.request, 'message');
									}).catch(error => {
										rejectFunc(`@serviceworker [${type}] getMessage failed for: ${event.request.url}`, error);
										fetchCache(resolveFunc, rejectFunc, error, type);
										return error;
									});
									return;
								}
								// is stream and message is not resolved yet, so prio get fetch/cache
								type = `message.timeout(fetch), ${this.getMessageIsStreamTimeout}ms`;
								const rejectFunc = this.getRejectFunc(reject, 2);
								const fetchTimeout = setTimeout(() => fetchCache(resolveFunc, rejectFunc, undefined, type), this.getMessageIsStreamTimeout);
								this.getMessage(event.request, this.sessionResolvedMessageContext.includes(event.request.url)).then(response => {
									clearTimeout(fetchTimeout);
									if (resolveFunc(response, `@serviceworker [${type}] success getMessage for ${event.request.url}`)) this.setUrlsContext(event.request, 'message');
								}).catch(error => rejectFunc(`@serviceworker [${type}] getMessage failed for: ${event.request.url}`, error));
								return;
							}
							// getMessage && isStream
							// is not stream and we race all fetch vs cache vs message
							type = 'fetchVsCacheVsMessage';
							const rejectFunc = this.getRejectFunc(reject, getCache && getFetch ? 3 : 2);
							fetchCache(resolveFunc, rejectFunc, undefined, type);
							this.getMessage(event.request, this.sessionResolvedMessageContext.includes(event.request.url)).then(response => {
								if (resolveFunc(response, `@serviceworker [${type}] success getMessage for ${event.request.url}`)) this.setUrlsContext(event.request, 'message');
							}).catch(error => rejectFunc(`@serviceworker [${type}] getMessage failed for: ${event.request.url}`, error));
						}));
					}
				}
			}

		});
	}
	getFetch(request, abortController = new AbortController(), setCache = true, overwrite = true) {
		return new Promise((resolve, reject) => {
			// Fetch
			fetch(request, {signal: abortController.signal, cache: "no-store"}).then(response => {
				if (setCache) {
					this.setCache(request, response, overwrite).then(response => {
						if (this.validateStatus(response)) {
							resolve(response);
						} else {
							reject(request.url);
						}
					}).catch(error => reject(`ServiceWorker: Fetch caching failed for ${request.url}`));
				} else if (this.validateStatus(response)) {
					resolve(response);
				} else {
					reject(request.url);
				}
			}).catch(error => reject(request.url));
		});
	}
	// don't overwrite to cache since it is already at indexedDB
	getMessage(request, getRange = false, setCache = false, overwrite = false) {
		// TODO: don't send message twice until resolvedMessages has been set
		// new message
		return new Promise((resolve, reject) => {
			const resolveFunc = response => {
				if (getRange) {
					this.newPartialResponse(request, response).then(result => {
						const [request, response, position] = result;
						resolve(response);
					}).catch(result => {
						const [request, response, position, error] = result;
						reject(`ServiceWorker: Could not stream message for ${request.url}, because of ${error && error.message}`);
					});
				} else {
					resolve(response);
				}
			};
			// already messaged answer with such
			if (this.resolvedMessages.has(request.url)) return resolveFunc(new Response(...this.resolvedMessages.get(request.url)));
			const key = this.getRandomString();
			this.messageChannel.postMessage([request.url, key]);
			// key, [success, failure] functions
			this.resolveMap.set(key, [
				data => {
					this.resolvedMessages.set(request.url, data);
					const response = new Response(data[0], data[1]);
					if (setCache) {
						// only write to cache when there is none with this key
						this.setCache(request, response, overwrite).then(response => resolveFunc(response)).catch(error => reject(`ServiceWorker: Message caching failed for ${request.url}`));
					} else {
						resolveFunc(response);
					}
				},
				() => reject(`ServiceWorker: No message response for ${request.url}`)
			]);
		});
	}
	getCache(request) {
		return new Promise((resolve, reject) => {
			caches.open(this.cacheVersion).then(cache => {
				cache.match(request, {ignoreSearch: true, ignoreMethod: true, ignoreVary: true}).then(response => {
					// only overwrite in case cache response would not validate (not found resolves undefined)
					if (this.validateStatus(response)) {
						resolve(response);
					} else {
						reject(`ServiceWorker: Match cache failed status validation for ${request.url}`);
					}
				}).catch(error => reject(`ServiceWorker: Match cache failed for ${request.url}`));
			}).catch(error => reject(`ServiceWorker: Open cache failed for ${request.url}`));
		});
	}
	setCache(request, response, overwrite = true) {
		// don't cache POST as well as those which doNotGetCache
		if (request.method === 'POST' || this.doNotGetCache.some(url => request.url.includes(url))) return Promise.resolve(response);
		return caches.open(this.cacheVersion).then(cache => {
			const requestClone = request.clone();
			const responseClone = response.clone();
			if (this.validateStatus(responseClone)) {
				const put = () => cache.put(requestClone, responseClone).catch(error => this.error(error, requestClone));
				if (overwrite) {
					put();
				} else {
					// only overwrite in case cache response would not validate
					this.getCache(requestClone).catch(error => put());
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
	validateStatus(response) {
		// 0 is for cache
		return response && (response.status === 0 || (response.status >= 200 && response.status <= 299));
	}
	// makes a complete message response seekable
	newPartialResponse(request, response) {
		return new Promise(resolve => {
			// if this is the first response in this session, deliver the complete response
			const position = this.getRangePosition(request.headers);
			// ==> resolve like a normal response since !isStream
			if (position === false) return resolve([request, response, position]);
			response.clone().arrayBuffer().then(arrayBuffer => {
				// ==> reject, since response does not have valid content with empty- or NO- arrayBuffer
				// fetches and for that reason caches out of fetch have sometimes no arrayBuffer and content can't be confirmed, don't reject, which would break things but punish with a timout
				if (!arrayBuffer || !arrayBuffer.byteLength) return resolve([request, response, position]);
				const slicedArrayBuffer = arrayBuffer.slice(position);
				// ==> resolve like a normal response since it has buffer but can't slice properly
				if (!slicedArrayBuffer.byteLength) return resolve([request, response, position]);
				// ==> resolve with new response
				return resolve([request, new Response(
					slicedArrayBuffer,
					{
						status: 206,
						statusText: 'Partial Content',
						headers: [
							['accept-ranges', response.headers.get('accept-ranges')],
							['cache-control', 'no-store'],
							['content-type', response.headers.get('content-type')],
							['content-length', response.headers.get('content-length')],
							['content-range', `bytes ${position}-${arrayBuffer.byteLength - 1}/${arrayBuffer.byteLength}`]
						]
					}
				), position]);
			// ==> reject, since response does not have valid arrayBuffer
			}).catch(error => resolve([request, response, position, error]));
		});
	}
	getRangePosition(headers) {
		return headers.get('range') ? Number(/^bytes\=(\d+)\-$/g.exec(headers.get('range'))[1]) || 0 : false;
	}
	getResolveFunc(resolve) {
		let counter = 0;
		return (response, message) => {
			counter++;
			let resolved = false;
			if ((resolved = (counter <= 1))) resolve(response);
			if (message) console.info(message, `resolved: ${resolved}`);
			return resolved;
		}
	}
	getRejectFunc(reject, max = 2) {
		let counter = 0;
		return (url, error) => {
			counter++;
			let rejected = false;
			if ((rejected = (counter >= max))) reject(error || `ServiceWorker: No response for ${url}`);
			if (error) this.error(error, url);
			return rejected;
		}
	}
	error(error, request, toReturn) {
		console[typeof error === 'string' || error && error.message && error.message.includes('user aborted a request') ? 'info' : 'warn']('ServiceWorker Error:', error, request);
		return toReturn;
	}
	setUrlsContext(request, context) {
		if (context) {
			if (context === 'message') this.sessionResolvedMessageContext.push(request.url);
			return this.urlsContext.set(request.url,  context);
		}
		// when content is requested from range 0
		if (!this.getRangePosition(request.headers)) return this.urlsContext.set(request.url,  'open');
		// if range > 0 but no context was set === new request => fallback to default fetchCache
		if (!this.urlsContext.has(request.url)) this.urlsContext.set(request.url,  'fetchCache');
	}
	get isOnline() {
		return self.navigator.onLine;
	}
}

// the ServiceWorker gets loaded as followed: navigator.serviceWorker.register(this.serviceWorkerPath).then((registration) => {
const ServiceWorker = new MasterServiceWorker();
ServiceWorker.run();
