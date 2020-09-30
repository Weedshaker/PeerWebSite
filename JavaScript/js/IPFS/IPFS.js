import { mime } from './helpers/mimeTypes.js';

export class IPFS {
	constructor(){
        // should be 'ipfs://' but browsers do not yet support that url scheme, once this gateway would get blocked or overloaded the files have to be fixed through the service worker
        this.baseUrl = 'https://gateway.ipfs.io/ipfs/'; // must have "onFetchError" error handling, when used at add
        // https://blog.ipfs.io/2020-07-20-js-ipfs-0-48/
        this.node = window.Ipfs.create();
        this.isIdle = new Promise(resolve => document.readyState !== 'complete' ? window.addEventListener('load', event => setTimeout(() => resolve(), 60000)) : setTimeout(() => resolve(), 60000));

        // ipfs dom nodes error handling
        this.ipfs_onerror = 'window.sst_IPFS_onFetchError';
		window.sst_IPFS_onFetchError = this.onFetchError.bind(this);
    }
    add(path, content){
        // file.link, which depends on this.baseUrl is only used at EditorSummernote and has an error handling "onFetchError" to findPeers
        return this.node.then(node => node.add({path, content})).then(file => Object.assign({link: this.baseUrl + file.cid}, file));
    }
    get(cid){
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
    pin(url){
        let match = null;
        if (url.includes(this.baseUrl) && (match = url.match(/([^\/]+$)/))) return Promise.all([this.isIdle, this.node]).then(results => results[1].pin.add(match[0]));
        return null;
    }
    onFetchError(event, url, name, type, isVideo, el){
        const sanitize = () => {
            type = type.split(',');
            // findPeer and don't be dependend on this.baserUrl
            const errorFunc = error => {
                el[type[1]] = el[type[1]]
                console.error(`SST_IPFS_onFetchError: Could not find ${url} nor findPeer at el:`, el, error);
            };
            const match = url.match(/([^\/]+$)/);
            if (!match) return errorFunc('NO cid found!');
            const cid = match[0];
            el.classList.add('ipfsLoading');
            if (isVideo && el.parentElement) el.parentElement.classList.add('ipfsLoading');
            return this.cat(cid, true).then(chunks => {
                el[type[1]] = URL.createObjectURL(new Blob(chunks, { type: mime.getType(name.split('.').splice(-1)[0]) }));
                el.classList.remove('ipfsLoading');
                if (isVideo && el.parentElement) {
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
}