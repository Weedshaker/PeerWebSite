/*jshint esnext: true */

import {Helper} from 'WebTorrent/Classes/Helper/Helper.js';
import {OptionRegex} from 'WebTorrent/Classes/Helper/OptionRegex.js';
//import IndexeddbChunkStore from 'xuset/indexeddb-chunk-store/idbchunkstore.min.js'; // too slow
//import parseTorrent from 'parse-torrent/index.js'; // doesn't work in karma

export class MasterWebTorrent {
	constructor(container = document.body){
		this.container = container;
		this.Helper = new Helper();
		this.client = new WebTorrent();
		this.client.sst_magnetURI = [];
		this.client.on('error', err => {
			console.error('ERROR: ' + err.message);
		});
		this.addByTextReturn = new Map(); // takes function, scope and attributes [] to trigger on this._resultAddByText
		this.OptionRegex = new OptionRegex(this, this.client, undefined, this.addByTextReturn);
		this.OptionRegex.returnMap.set('init', [this.OptionRegex.getMagnetURL, this.OptionRegex]);
		this.OptionRegex.returnMap.set('getMagnetURL', [this.OptionRegex.mapFoundMagnetURL, this.OptionRegex]);
		this.OptionRegex.returnMap.set('mapFoundMagnetURL', [this.OptionRegex.replaceBlobURL, this.OptionRegex]);
		this.OptionRegex.returnMap.set('replaceBlobURL', [this.OptionRegex.addProgressBar, this.OptionRegex]);
		this.OptionRegex.returnMap.set('addProgressBar', [this.OptionRegex.addTorrent, this.OptionRegex]);
		this.OptionRegex.returnMap.set('addTorrent', [this._resultAddByText, this]);
		this.torrents = new Map(); // is used to map between client.torrents [] and nodes. using sst_id when created to quickly access
		this.nodes = []; // nodes in the dom on which torrents got appendedTo
		this.addOpts = {
			/*
			announce: [String],        // Torrent trackers to use (added to list in .torrent or magnet uri)
			getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
			maxWebConns: Number,       // Max number of simultaneous connections per web seed [default=4]
			path: String,              // Folder to download files to (default=`/tmp/webtorrent/`)
			store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
			*/
			//store: IndexeddbChunkStore
			announce: [
				'udp://tracker.leechers-paradise.org:6969',
				'udp://tracker.coppersurfer.tk:6969',
				'udp://tracker.opentrackr.org:1337',
				'udp://explodie.org:6969',
				'udp://tracker.empire-js.us:1337',
				'udp://zephir.monocul.us:6969/announce',
				'udp://p4p.arenabg.com:1337/announce',
				'udp://tracker.internetwarriors.net:1337/announce',
				'udp://public.popcorn-tracker.org:6969/announce',
				'udp://eddie4.nl:6969/announce',
				'udp://open.stealth.si:80/announce',
				'udp://tracker.ex.ua:80/announce',
				'udp://tracker.filetracker.pl:8089/announce',
				'udp://tracker.flashtorrents.org:6969/announce',
				'udp://tracker.kicks-ass.net:80/announce',
				'udp://tracker.kuroy.me:5944/announce',
				'udp://tracker.piratepublic.com:1337/announce',
				'udp://tracker.tiny-vps.com:6969/announce',
				'udp://tracker.yoshi210.com:6969/announce',
				'udp://185.5.97.139:8089/announce',
				'udp://zer0day.ch:1337/announce',
				'udp://thetracker.org:80/announce',
				'udp://wambo.club:1337/announce',
				'udp://tc.animereactor.ru:8082/announce',
				'udp://tracker.bittor.pw:1337/announce',
				'udp://tracker.vanitycore.co:6969/announce'
			]
		};
		this.seedOpts = {
			/*
			name: String,            // name of the torrent (default = basename of `path`, or 1st file's name)
			comment: String,         // free-form textual comments of the author
			createdBy: String,       // name and version of program used to create torrent
			creationDate: Date       // creation time in UNIX epoch format (default = now)
			private: Boolean,        // is this a private .torrent? (default = false)
			pieceLength: Number      // force a custom piece length (number of bytes)
			announceList: [[String]] // custom trackers (array of arrays of strings) (see [bep12](http://www.bittorrent.org/beps/bep_0012.html))
			urlList: [String]        // web seed urls (see [bep19](http://www.bittorrent.org/beps/bep_0019.html))
			*/
			comment: 'peerweb.site'
			//store: IndexeddbChunkStore
		};
		this.appendToOpts = {
			/*
			!!! IMPORTANT !!! when autoplay off it doesn't work in Firefox and Chrome
			autoplay: Boolean, // Autoplay video/audio files (default: false)
			muted: Mute video/audio files (default: false)
			controls: Boolean, // Show video/audio player controls (default: true)
			maxBlobLength: Number, // Files above this size will skip the "blob" strategy and fail (default: 200 * 1000 * 1000 bytes)
			*/
			autoplay: true,
			muted: true,
			controls: true
		};
		// !!! Important !!! set the attributes in the same order as in the array below
		this.attributes = ['data-id', 'data-magnetURL', 'data-blobs', 'onerror', 'data-linktxt'];
		this.classes = ['webTorrent', 'blobLoading', 'torrentLoading'];
		this.timeoutCont = null; // used for onerror
		this.onerrorCont = [];

		// hooks
		this.api = {
			/**
			 * remove - check whole body if node, to which the torrent got appended, is still existent => not delete entry in node and torrent and client.torrents
			 * 
			 * @param {HtmlNode} [container=this.container] 
			 * @returns 
			 * @memberof MasterWebTorrent
			 */
			removeDeletedNodes: this.removeDeletedNodes.bind(this),
			/**
			 * creates id's from files
			 * 
			 * @param {FileList} files 
			 * @returns 
			 * @memberof Helper
			 */
			createFilesId: this.Helper.createFilesId.bind(this.Helper),
			/**
			 * Map
			 * 
			 * @param {[[id: number, torrent: Object]]}
			 * @memberof MasterWebTorrent
			 */
			torrents: this.torrents,
			/**
			 * HtmlNode
			 * 
			 * @param {HtmlNode}
			 * @memberof MasterWebTorrent
			 */
			container: this.container,
			getAllTorrents: this.getAllTorrents.bind(this),
			getAllTorrentFiles: this.getAllTorrentFiles.bind(this)
		};
	}
	// add (download)
	add(magnetURL, id, node, addOpts = Object.assign({}, this.addOpts), appendToOpts, addCallback = (torrent) => {return this.appendTo(undefined, appendToOpts, appendToCallback, torrent);}, appendToCallback){
		id = Number(id);
		if (!isNaN(addCallback)) {
			const timer = addCallback;
			addCallback = (torrent) => {
				setTimeout(() => {
					this.appendTo(undefined, appendToOpts, appendToCallback, torrent);
				}, timer);
			};
		}
		// don't add dublicated torrents (files) but simply use existing torrent
		for(let torrent of this.client.torrents){
			// in case of matching files.length check deeper for size and name
			if(id === torrent.sst_id){
				if (node) this.setNodes(torrent, node, torrent.sst_id);
				if (torrent.done) addCallback(torrent);
				return false;
			}
		}
		// -----------------------------------------------------------------------
		// none dublicated torrents
		// below gets executed before appendTo callback
		let torrent = this.client.add(magnetURL, addOpts, addCallback);
		this.client.sst_magnetURI.push(magnetURL);
		this.addParseTorrent(torrent);
		torrent.sst_id = id;
		this.torrents.set(torrent.sst_id, torrent);
		// sst_id to identify (if node gets deleted before torrent finished seeding)
		if (node) this.setNodes(torrent, node, torrent.sst_id);
		return torrent;
	}
	/**
	 * Searching text for torrents to add (api hook)
	 * 
	 * @param {string} txt 
	 * @param {Map([['function', Function], ['scope', Object], ['attributes', []])} arrayReturnMap
	 * @param {Object} addOpts 
	 * @param {Object} appendToOpts 
	 * @param {Function} addCallback 
	 * @param {Function} appendToCallback 
	 * @memberof MasterWebTorrent
	 */
	addByText(txt, arrayReturnMap, addOpts, appendToOpts, addCallback, appendToCallback){ // arrayReturnMap requires Map with function, scope, attributes
		let workerID = this.Helper.getRandomString();
		// [addOpts, appendToOpts, addCallback, appendToCallback] are applied to OptionRegex->addTorrent->this.WebTorrent.add
		this.addByTextReturn.set(workerID, [arrayReturnMap, [addOpts, appendToOpts, addCallback, appendToCallback]]);
		this.OptionRegex.init(txt, [this.attributes, this.classes], workerID);
	}
	// don't call this directly, it will be called by OptionRegex timeline triggered when worker finishes
	_resultAddByText(data){
		let txt = data[0][0], workerID = data[0][2]/*, magnetURLs = data[1]*/;
		// trigger the linked function for this workerID
		let arrayReturnMap = this.addByTextReturn.get(workerID)[0];
		if(arrayReturnMap){
			arrayReturnMap.forEach((returnMap) => {
				// trigger: this.Dom.setData(container, oldMessage, dataPack.message);
				returnMap.get('attributes').push(txt);
				returnMap.get('function').apply(returnMap.get('scope'), returnMap.get('attributes'));
			});
			this.addByTextReturn.delete(workerID);
		}
		return txt;
	}
	/**
	 * seed (upload) (api hook)
	 * 
	 * @param {File | FileList} files 
	 * @param {string} text 
	 * @param {HtmlNode} node 
	 * @param {Object} [seedOpts=this.seedOpts] 
	 * @param {Object} appendToOpts 
	 * @param {Function} [seedCallback=(torrent) => {return this.appendTo(text, appendToOpts, appendToCallback, torrent);}] 
	 * @param {Function} appendToCallback 
	 * @returns 
	 * @memberof MasterWebTorrent
	 */
	seed(files, text, node, seedOpts = Object.assign({}, this.seedOpts), appendToOpts, seedCallback = (torrent) => {return this.appendTo(text, appendToOpts, appendToCallback, torrent);}, appendToCallback){
		if(node){
			node.classList.add(this.classes[0], this.classes[1]);
			node.contentEditable = false;
		}
		let id = this.Helper.createFilesId(files);
		// don't seed dublicated torrents (files) but simply use existing torrent
		for(let torrent of this.client.torrents){
			// in case of matching files.length check deeper for size and name
			if(id === torrent.sst_id){
				// sst_id to identify (if node gets deleted before torrent finished seeding)
				if (node) this.setNodes(torrent, node, torrent.sst_id);
				if (torrent.done) seedCallback(torrent);
				return false;
			}
		}
		// -----------------------------------------------------------------------
		// none dublicated torrents
		// below gets executed before appendTo callback
		let torrent = this.client.seed(files, seedOpts, seedCallback);
		torrent.on('infoHash', () => {
			this.client.sst_magnetURI.push(torrent.magnetURI);
		});
		this.addParseTorrent(torrent);
		torrent.sst_id = id;
		this.torrents.set(torrent.sst_id, torrent);
		// sst_id to identify (if node gets deleted before torrent finished seeding)
		if (node) this.setNodes(torrent, node, torrent.sst_id);
		return torrent;
	}
	appendTo(text, appendToOpts = this.appendToOpts, appendToCallback = (torrent) => {console.info(`torrent: ${torrent.name} appended!`);}, torrent){
		if(torrent.sst_nodes && torrent.sst_nodes.length > 0){
			// use content of previously set torrent.sst_nodes
			if(torrent.sst_nodeCont){
				this.appended(torrent, appendToCallback, text);
			}else if(!torrent.sst_appending){
				// stop other files to be appended during this process
				torrent.sst_appending = true;
				// grab first node and use it as append role model
				let node = torrent.sst_nodes[0];
				// only appendTo empty nodes
				node.innerHTML = '';
				torrent.files.forEach((file, i) => {
					file.appendTo(node, appendToOpts, (err, elem) => {
						// callback for last file, when finishing
						let callback = i === torrent.files.length - 1 ? (elem) => {
							setTimeout(() => {
								torrent.sst_appending = false;
								// workaround bug which possibly appends to wrong node... nodes in the dom can get mixed up during this process, make sure and if needed reset
								if(Number(torrent.sst_id) === Number(node.getAttribute(this.attributes[0]))){
									// this only gets triggered on WebTorrentReceiver
									if (this.ProgressBar) this.ProgressBar.removeAll(torrent);
									torrent.sst_containsVideo = node.innerHTML.indexOf('video') !== -1;
									// Event Listeners
									// save files
									const download = event => {
										torrent.files.forEach(file => {
											file.getBlobURL((err, url) => {
												if (err) return console.warn(err);
												this.Helper.saveBlobUrl(url, file.name);
											});
										});
									};
									node.sst_download = download;
									if (torrent.sst_containsVideo) {
										// save files
										let downloadTimerID = null;
										node.addEventListener('mousedown', event => (downloadTimerID = setTimeout(() => {
											if (event.which === 1) download();
										}, 1000)));
										node.addEventListener('mouseup', () => clearTimeout(downloadTimerID));
										// unmute
										const unMute = event => {
											node.removeEventListener('click', unMute);
											node.childNodes.forEach(child => child.muted = false);
											event.preventDefault();
										};
										node.addEventListener('click', unMute);
									} else {
										// save files
										node.addEventListener('dblclick', download);
									}
									// set node content to torrent
									torrent.sst_nodeCont = node.innerHTML;
									this.appended(torrent, appendToCallback, text);
								}else{
									// reset nodes and start over
									node.removeChild(elem);
									torrent.sst_nodes = [];
									this.appendTo(text, appendToOpts, appendToCallback, torrent);
								}
							}, 50); // waitForBlob
						} : () => {};
						// when not supported for appendTo eg. zip add download link
						if(!elem){
							if(file.done){
								this.appendToUnsupportedFileAsLink(text, torrent, file, node, callback);
							}else{
								torrent.on('done', () => {this.appendToUnsupportedFileAsLink(text, torrent, file, node, callback)});
							}
							//clear error
							err = undefined;
						}else{
							callback(elem);
						}
						if(err){
							node.remove();
							this.removeDeletedNodes();
						}
						return err ? console.warn(err) : true;
					});
				});
			}
		}else{
			console.info('no nodes found in dom for:');
			console.info(torrent);
		}
	}
	appendToUnsupportedFileAsLink(text, torrent, file, node, callback){
		file.getBlobURL((err, url) => {
			if (err) return console.warn(err);
			let name = file.name;
			text = text ? text : node.getAttribute(this.attributes[4]);
			if(text){
				name = torrent.files.length > 1 ? `${text}_${torrent.files.indexOf(file)}` : text;
			}
			let a = document.createElement('a');
			a.target = '_blank';
			a.download = name;
			a.href = url;
			a.textContent = name;
			if(node.lastChild && node.lastChild.tagName === 'A'){
				a.textContent = ', ' + name;
			}
			node.appendChild(a);
			callback(a);
		});
	}
	appended(torrent, appendToCallback = false, text = false){
		let invalidNodes = []; // saving can invalidate nodes, grap those and pass it to removeInvalidNodes
		torrent.sst_nodes.forEach(node => {
			if (node && typeof node.getAttribute === 'function'){
				// set same content to all nodes
				if (node.innerHTML !== torrent.sst_nodeCont) node.innerHTML = torrent.sst_nodeCont;
				// set magnetURI
				if (!node.getAttribute(this.attributes[1])) node.setAttribute(this.attributes[1], torrent.magnetURI);
				// set linktxt
				if (text && !node.getAttribute(this.attributes[4])) node.setAttribute(this.attributes[4], text);
				// loading finished remove classes
				if (node.classList.contains(this.classes[1])) node.classList.remove(this.classes[1]);
				if (node.classList.contains(this.classes[2])) node.classList.remove(this.classes[2]);
				// set error handling
				node.childNodes.forEach(child => {
					// error handling if blobs have to be renewed => this.blobsRefresh (set globally at WebTorrentSeeder / WebTorrentReceiver)
					child.setAttribute(this.attributes[3], `${this.appended_onerror}(${torrent.sst_id});`);
				});
				torrent.sst_onerror = `${this.appended_onerror}(${torrent.sst_id});`; // needs to be set on Regex replaceBlobURL
				// set data-blobs
				node.setAttribute(this.attributes[2], torrent.sst_localBlobs.join(','));
			}else{
				invalidNodes.push(node);
			}
		});
		this.findAllLocalBlobs(torrent);
		this.removeInvalidNodes(invalidNodes, torrent.sst_id);
		if (appendToCallback) appendToCallback(torrent);
	}
	// blobs refresh called by onerror attribute
	blobsRefresh(torrentId = this.onerrorCont){
		// bundle all errors and do all at once
		if (Array.isArray(torrentId)){
			torrentId.forEach(id => {
				let torrent = this.torrents.get(id);
				if(torrent){
					torrent.files.forEach((file, i) => {
						file.getBlobURL((err, url) => {
							if (err) return console.warn(err);
							if(url !== torrent.sst_localBlobs[i]){
								torrent.sst_nodeCont = torrent.sst_nodeCont.replace(torrent.sst_localBlobs[i], url);
								URL.revokeObjectURL(torrent.sst_localBlobs[i]);
								torrent.sst_localBlobs[i] = url;
							}
							// last file
							if(i === torrent.files.length - 1){
								this.findAllNodes(torrent);
								this.appended(torrent);
							}
						});
					});
				}
			});
			this.onerrorCont = [];
		}else{
			if(this.onerrorCont.indexOf(torrentId) === -1){
				this.onerrorCont.push(torrentId);
				/**
				 * !!! Not needed, because loading class wouldn't be kept on next webrtc text received !!!
				// add blobLoading
				let torrent = this.torrents.get(torrentId);
				if(torrent){
					// this only gets triggered on WebTorrentReceiver
					if (this.findAllNodes) this.findAllNodes(torrent);
					torrent.sst_nodes.forEach((node) => {
						node.classList.add(this.classes[1]);
					});
				}
				*/

				/** 
				 * videoObject.currentTime NOT POSSIBLE!!! RETURNS NULL AFTER ERROR!!!
				 * https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_video_currenttime
				// get video currentTime to be set after fix blob, only triggered when appended receives it from this onerror and treats each nodes each children video
				*/
			}
			clearTimeout(this.timeoutCont);
			this.timeoutCont = setTimeout(() => {
				this.blobsRefresh();
			}, 1000);
		}
	}
	// nodes
	setNodes(torrent, node, id) {
		if(node){
			// find node (node within the dom)
			if (!torrent.sst_nodes) torrent.sst_nodes = [];
			if(torrent.sst_nodes.indexOf(node) === -1){
				torrent.sst_nodes.push(node);
				// find torrent in this.torrents by id
				if (!node.getAttribute(this.attributes[0])) node.setAttribute(this.attributes[0], id);
				if (this.nodes.indexOf(node) === -1) this.nodes.push(node);
				return true;
			}
		}
		return false;
	}
	findAllNodes(torrent) {
		// find all nodes (node within the dom)
		const nodes = this.container.querySelectorAll(`[${this.attributes[0]}="${torrent.sst_id}"]`);
		nodes.forEach((node) => {
			this.setNodes(torrent, node, torrent.sst_id);
		});
		return nodes;
	}
	findAllLocalBlobs(torrent) {
		torrent.sst_localBlobs = torrent.sst_localBlobs || [];
		torrent.sst_nodes.forEach(node => {
			node.childNodes.forEach(child => {
				const blob = child.getAttribute('src') ? child.getAttribute('src') : child.getAttribute('href');
				if (blob && !torrent.sst_localBlobs.includes(blob)) torrent.sst_localBlobs.push(blob);
			});
		});
		// generate blobs if there are no nodes with src/href referencing blobs found
		if (!torrent.sst_localBlobs.length) {
			torrent.files.forEach(file => {
				file.getBlobURL((err, url) => {
					if (err) return console.warn(err);
					if (!torrent.sst_localBlobs.includes(url)) torrent.sst_localBlobs.push(url);
				});
			});
		}
	}
	/**
	 * remove - check whole body if node, to which the torrent got appended, is still existent => not delete entry in node and torrent and client.torrents (api hook)
	 * 
	 * @param {HtmlNode} [container=this.container] 
	 * @returns 
	 * @memberof MasterWebTorrent
	 */
	removeDeletedNodes(container = this.container){
		let removedNodes = [];
		this.nodes.forEach((node) => {
			if (!container.contains(node)){
				if(this.remove(node)){
					removedNodes.push(node);
				}
			}
		});
		if(removedNodes.length > 0){
			this.nodes = this.nodes.filter((e) => {return removedNodes.indexOf(e) === -1;});
		}
		return removedNodes;
	}
	removeInvalidNodes(nodes, id){
		let removedNodes = [];
		nodes.forEach((node) => {
			if (this.remove(node, undefined, id)) {
				removedNodes.push(node);
			}
		});
		if (removedNodes.length > 0) {
			this.nodes = this.nodes.filter((e) => { return removedNodes.indexOf(e) === -1; });
		}
		return removedNodes;
	}
	remove(node = false, callback = null, id = false){
		id = id ? id : Number(node.getAttribute(this.attributes[0]));
		let torrent = this.torrents.get(id);
		if(torrent){
			let index = torrent.sst_nodes.indexOf(node);
			if (index !== -1) torrent.sst_nodes.splice(index, 1);
			// if no ui element holds the torrent (has to find all nodes, since the node may change when edited in code mode just before the node)
			if (torrent.sst_nodes.length === 0 && this.findAllNodes(torrent).length === 0){
				// this only gets triggered on WebTorrentReceiver
				if(this.ProgressBar){
					this.ProgressBar.removeAll(torrent);
				}
				if(torrent.sst_localBlobs){
					torrent.sst_localBlobs.forEach(blob => {
						URL.revokeObjectURL(blob);
					});
				}
				const magnetURI_index = this.client.sst_magnetURI.indexOf(torrent.magnetURI)
				if (magnetURI_index !== -1) this.client.sst_magnetURI.splice(magnetURI_index, 1);
				if(callback){
					// Alias for client.remove(torrent)
					torrent.destroy(callback);
				}else{
					this.client.remove(torrent);
				}
				this.torrents.delete(id);
				return true;
			}
			return torrent;
		}
		return false;
	}
	// loading
	areTorrentsLoading() {
		return this.client.torrents.some((torrent) => !torrent.done || torrent.sst_appending);
	}
	// saving
	addParseTorrent(torrent){
		/*if(parseTorrent){
			Object.defineProperty(torrent, 'sst_parsedTorrent', {
				get: function () { return parseTorrent(this.torrentFile); }
			});
		}*/
	}
	// name come as encodeURI / magnetURI comes as encodeURIComponent + .replace(/%20/g, '+')
	getBlobByFileName(name){
		const origName = name;
		name = decodeURI(name);
		return new Promise(resolve => {
			let getBlob = (file) => {
				file.getBlob((err, blob) => {
					if (err) {
						console.warn(err);
						return resolve(null);
					}
					resolve(blob);
				});
			};
			// got magnetURI !!!if you change this, change equal at JavaScript/js/ServiceWorker/ServiceWorker.js.addMessageChannelEventListener!!!
			if(name.includes('magnet:') || name.includes('magnet/') || name.includes('?xt=urn:')){
				if(name.includes('magnet')){
					name = name.replace(/.*magnet[:\/]/, 'magnet:');
				}else{
					name = name.replace(/.*\?xt=urn:/, 'magnet:?xt=urn:');
				}
				const torrent = this.add(name, undefined, undefined, undefined, undefined, torrent => {
					if (torrent.files && torrent.files[0]) {
						// !!!waiting for on.done, only works with torrents which have a single file!!! multiple files don't get mentioned in magnetURI
						getBlob(torrent.files[0]);
					} else {
						// not found
						resolve(null);
						console.warn('this torrent is invalid:', name);
					}
				});
				torrent.on('error', () => {
					// not found
					resolve(null);
					console.warn('this torrent is invalid:', name);
				});
			} else if(!this.client.torrents.some((torrent) => {
				// search for torrents by name
				let file;
				if(torrent.done && (file = torrent.files.find((file) => {
					// file.name is plain without encoding
					return name.includes(file.name);
				}))){
					// found file with same name
					getBlob(file);
					return true;
				} else if(torrent.magnetURI && torrent.magnetURI.includes(encodeURIComponent(name).replace(/%20/g, '+'))){
					// magnetURI references the name
					// !!!waiting for on.done, only works with torrents which have a single file!!! multiple files don't get mentioned in magnetURI
					torrent.on('done', () => {
						getBlob(torrent.files[0]);
					});
					return true;
				}
				return false;
			})){
				// no torrent found but check if it will be loaded but just hasn't been initiated
				if (this.client.sst_magnetURI.some((magnetURI) => {
					// how magnetURI gets built: https://github.com/webtorrent/magnet-uri/blob/master/index.js encodeURIComponent + .replace(/%20/g, '+')
					return magnetURI.includes(encodeURIComponent(name).replace(/%20/g, '+'));
				})) {
					// try later
					setTimeout(() => {
						this.getBlobByFileName(origName).then(blob => resolve(blob));
					}, 1000);
				} else {
					// not found
					resolve(null);
				}
			}
		});
	}
	getAllTorrents() {
		this.Helper.saveData(this.client.torrents.map(torrent => torrent.magnetURI).join("\n\n---\n\n"), `peerWebSiteTorrents_${this.Helper.getRandomString()}.txt`);
	}
	getAllTorrentFiles() {
		this.client.torrents.forEach(torrent => {
			torrent.files.forEach(file => {
				file.getBlobURL((err, url) => {
					if (err) return console.warn(err);
					this.Helper.saveBlobUrl(url, file.name);
				});
			});
		});
	}
}