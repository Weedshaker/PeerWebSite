import { mime } from './helpers/mimeTypes.js';

export class IPFS {
	constructor(){
        // should be 'ipfs://' but browsers do not yet support that url scheme, once this gateway would get blocked or overloaded the files have to be fixed through the service worker
        this.baseUrl = 'https://gateway.ipfs.io/ipfs/'; // must have "onFetchError" error handling, when used at add
        // https://blog.ipfs.io/2020-07-20-js-ipfs-0-48/
        this.node = new Promise(resolve => {
            const createIpfs = () => {
                if (window.Ipfs) {
                    resolve(window.Ipfs.create());
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
        return this.node.then(node => node.add({path, content})).then(file => Object.assign({link: this.baseUrl + file.cid}, file));
    }
    fetch(cid){
        return fetch(this.baseUrl + cid).then(response => response.text());
    }
    cat(cid, raw = false){
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
        // for await alternative
        return this.node.then(node => {
            const chunksIterator = node.cat(cid);
            const chunks = [];
            const consume = obj => {
                if (obj.done) return raw ? chunks : chunks.toString();
                chunks.push(obj.value);
                return chunksIterator.next().then(consume);
            };
            return chunksIterator.next().then(consume); // kick off the recursive function
        });
    }
    raceFetchVsCat(cid){
        return Promise.race([this.fetch(cid), this.cat(cid, false)]);
    }
    getBlobByFileCID(url) {
        //QmQKaoJcU9QoHHgaSMZ4htAoSXHwBBx25oShbk2f5W1bh1
        // <img src="https://gateway.ipfs.io/ipfs/QmQKaoJcU9QoHHgaSMZ4htAoSXHwBBx25oShbk2f5W1bh1#svg"></img>
        return new Promise(resolve => {
            url = this.digestUrl(url);
            let type = '';
            if (url.cid && url.filename && (type = mime.getType(url.filename, false))) {
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
    onFetchError(event, url, name, type, isAudioVideo, el){
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
            if (isAudioVideo && el.parentElement) el.parentElement.classList.add('ipfsLoading');
            return this.cat(url.cid, true).then(chunks => {
                el[type[1]] = URL.createObjectURL(new Blob(chunks, { type: mime.getType(name) }));
                el.classList.remove('ipfsLoading');
                if (isAudioVideo && el.parentElement) {
                    el.parentElement.classList.remove('ipfsLoading');
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
        url = new URL(url);
        return {
            cid: url.pathname.split('/').splice(-1)[0] || null,
            filename: url.searchParams.get('filename') || null,
            urlString,
            url
        };
    }
}