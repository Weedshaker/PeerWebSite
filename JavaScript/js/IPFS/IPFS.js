import {Helper} from 'WebTorrent/Classes/Helper/Helper.js';

// Debug: http://localhost:3000/index_debug.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
export class IPFS {
	constructor(isSender){
        this.isSender = isSender;
        this.Helper = new Helper();

        // should be 'ipfs://' but browsers do not yet support that url scheme, once this gateway would get blocked or overloaded the files have to be fixed through the service worker
        this.baseUrl = 'https://gateway.ipfs.io/ipfs/'; // must have "onFetchError" error handling, when used at add
        // https://blog.ipfs.io/2020-07-20-js-ipfs-0-48/
        this.node = new Promise(resolve => {
            const createIpfs = () => {
                //https://ipfs.github.io/helia-strings/modules/_helia_strings.html
                if (window.Helia && window.HeliaStrings) {
                    resolve(window.Helia.createHelia().then(helia => window.HeliaStrings.strings(helia)));
                } else {
                    setTimeout(createIpfs, 1000);
                }
            };
            createIpfs();
        });
        this.isIdle = new Promise(resolve => document.readyState !== 'complete' ? window.addEventListener('load', event => setTimeout(() => resolve(), 60000)) : setTimeout(() => resolve(), 60000));

        // ipfs dom nodes error handling
        this.ipfs_onerror = 'window.sst_IPFS_onFetchError';
		window.sst_IPFS_onFetchError = this.onFetchError.bind(this);
    }
    add(path, content){
        // file.link, which depends on this.baseUrl is only used at EditorSummernote and has an error handling "onFetchError" to findPeers
        return this.node.then(node => node.put(content)).then(file => Object.assign({link: this.baseUrl + file.cid}, file));
    }
    fetch(cid, type = 'text', abortController = new AbortController(), queryString = ''){
        return new Promise((resolve, reject) => {
			// Fetch
			fetch(this.baseUrl + cid + queryString, {signal: abortController.signal}).then(response => {
				if (this.validateResponse(response)) {
                    try {
                        resolve(type ? response[type]() : response);
                    } catch (error) {
                        reject(this.baseUrl + cid + error && error.message);
                    }
				} else {
					reject(this.baseUrl + cid);
				}
			}).catch(error => reject(this.baseUrl + cid));
		});
    }
    cat(cid, raw = true){
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
        // for await alternative
        return this.node.then(node => node.get(cid));
    }
    raceFetchVsCat(cid, type, queryString){
        return new Promise((resolve, reject) => {
            const rejectFunc = this.getRejectFunc(reject, 2);
            const abortController = new AbortController();
            this.fetch(cid, type, abortController, queryString).then(result => {
                console.info(`@IPFS: Got Page ${cid} through fetch`);
                resolve(result);
            }).catch(rejectFunc);
            this.cat(cid, true).then(result => {
                console.info(`@IPFS: Got Page ${cid} through cat`);
                resolve(this.utf8ArrayToStr(result));
                abortController.abort();
            }).catch(rejectFunc);
        });
    }
    getBlobByFileCID(url) {
        //QmQKaoJcU9QoHHgaSMZ4htAoSXHwBBx25oShbk2f5W1bh1
        // <img src="https://gateway.ipfs.io/ipfs/QmQKaoJcU9QoHHgaSMZ4htAoSXHwBBx25oShbk2f5W1bh1#svg"></img>
        return new Promise(resolve => {
            url = this.digestUrl(url);
            let type = '';
            if (url.cid && url.filename && (type = this.Helper.mime.getType(url.filename, false))) {
                this.cat(url.cid, true).then(chunks => resolve(new Blob(chunks, { type }))).catch(error => {
                    console.error(`SST_IPFS_onFetchError: Could not find ${url} nor findPeer at el:`, error);
                    resolve(null)
                });
            } else {
                resolve(null);
            }
        });
    }
    pin(url){
        url = this.digestUrl(url);
        if (url.urlString.includes(this.baseUrl) && url.cid) return Promise.all([this.isIdle, this.node]).then(results => results[1].pin.add(url.cid));
        return null;
    }
    pinIfSender(url){
        if (this.isSender) this.pin(url);
    }
    pinCid(cid){
        if (cid) return Promise.all([this.isIdle, this.node]).then(results => results[1].pin.add(cid));
        return null;
    }
    onFetchError(event, url, name, type, isAudioVideo, el){
        if (this.isSender) return false;
        const sanitize = () => {
            type = type.split(',');
            // findPeer and don't be dependend on this.baserUrl
            const errorFunc = error => {
                el[type[1]] = el[type[1]]
                console.error(`SST_IPFS_onFetchError: Could not find ${url} nor findPeer at el:`, el, error);
            };
            url = this.digestUrl(url);
            if (!url.cid) return errorFunc('NO cid found!');
            el.classList.add('ipfsLoading');
            if (isAudioVideo && el.parentElement) {
                el.parentElement.classList.add('ipfsLoading');
                el.parentElement.sst_hasError = true;
            }
            return this.cat(url.cid, true).then(chunks => {
                el[type[1]] = URL.createObjectURL(new Blob(chunks, { type: this.Helper.mime.getType(name) }));
                el.classList.remove('ipfsLoading');
                if (isAudioVideo && el.parentElement) {
                    el.parentElement.classList.remove('ipfsLoading');
                    el.parentElement.sst_hasError = false;
                    el.parentElement.innerHTML = el.parentElement.innerHTML;
                }
            }).catch(error => errorFunc(error));
        };
        // means is a link with onclick
        if (event) {
            event.preventDefault();
            const onclick = el.getAttribute('onclick');
            const click = () => {
                el.removeAttribute('onclick');
                el.click();
                el.setAttribute('onclick', onclick);
            };
            fetch(url).then(() => click()).catch(error => {
                sanitize().then(() => click());
            });
        } else {
            sanitize();
        }
    }
    digestUrl(url = '') {
        const urlString = url;
        url = new URL(url) || {pathname: '', searchParams: {get: () => null}};
        return {
            cid: url.pathname.split('/').splice(-1)[0] || null,
            filename: url.searchParams.get('filename') || null,
            urlString,
            url
        };
    }
    validateResponse(response) {
		// 0 is for cache
		return response && (response.status === 0 || (response.status >= 200 && response.status <= 299));
    }
    getRejectFunc(reject, max = 2) {
		let counter = 0;
		return url => {
			counter++;
			if (counter >= max) reject(`@IPFS: No response for ${url}`);
		}
    }
    // download all IPFS files
    getAllIPFSFiles(callback = success => {}) {
        const src = [];
        document.querySelectorAll(`[src^="${this.baseUrl}"]`).forEach(node => {
            if (src.every(srcNode => srcNode.src !== node.src)) src.push(node); // only add a link once
        });
        const href = [];
        document.querySelectorAll(`[href^="${this.baseUrl}"]`).forEach(node => {
            if (href.every(hrefNode => hrefNode.href !== node.href) && src.every(srcNode => srcNode.src !== node.href)) href.push(node); // only add a link once
        });
        const length = src.length + href.length + 1;
        src.forEach(node => this.getBlobByFileCID(node.src).then(blob => {
			callback(!!blob);
            const url = this.digestUrl(node.src);
            if (blob) this.Helper.saveBlob(blob, node.getAttribute('data-filename') || node.parentNode && node.parentNode.getAttribute('data-filename') || url.filename);
        }));
        href.forEach(node => this.getBlobByFileCID(node.href).then(blob => {
			callback(!!blob);
            const url = this.digestUrl(node.href);
            if (blob) this.Helper.saveBlob(blob, node.getAttribute('data-filename') || node.parentNode && node.parentNode.getAttribute('data-filename') || url.filename);
        }));
        const cid = location.hash.substr(6);
        const filename = 'peerWebSite.txt';
        this.getBlobByFileCID(this.baseUrl + cid + `?filename=${filename}`).then(blob => {
			callback(!!blob);
            if (blob) this.Helper.saveBlob(blob, `peerWebSite_${cid}.txt`);
        });
        return length;
    }
    utf8ArrayToStr(arr) {
        if (ArrayBuffer.isView(arr)) return this._utf8ArrayToStr(arr)
        return arr.reduce((accumulator, currentValue) => accumulator + this._utf8ArrayToStr(currentValue), '')
    }
    // http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt

    /* utf.js - UTF-8 <=> UTF-16 convertion
    *
    * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
    * Version: 1.0
    * LastModified: Dec 25 1999
    * This library is free.  You can redistribute it and/or modify it.
    */

    _utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while(i < len) {
        c = array[i++];
        switch(c >> 4)
        { 
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
        case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
        case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
            break;
        }
        }

        return out;
    }
}