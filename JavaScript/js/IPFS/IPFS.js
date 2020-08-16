export class IPFS {
	constructor(){
        // should be 'ipfs://' but browsers do not yet support that url scheme, once this gateway would get blocked or overloaded the files have to be fixed through the service worker
        this.baseUrl = 'https://gateway.ipfs.io/ipfs/'; // must have "onFetchError" error handling, when used at add
        // https://blog.ipfs.io/2020-07-20-js-ipfs-0-48/
        this.node = window.Ipfs.create({
            libp2p: {
                config: {
                    dht: {
                        enabled: true,
                        clientMode: true
                    }
                }
            }
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
    /*
    get(cid){
        return fetch(this.baseUrl + cid).then(response => response.text());
    }
    */
    cat(cid){
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
        // for await alternative
        return this.node.then(node => {
            const chunksIterator = node.cat(cid);
            const chunks = [];
            const consume = obj => {
                if (obj.done) return chunks.toString();
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
    onFetchError(url, type, el){
        // findPeer and don't be dependend on this.baserUrl
        const errorFunc = error => {
            el[type] = el[type]
            console.error(`SST_IPFS_onFetchError: Could not find ${url} nor findPeer at el:`, el, error);
        };
        const match = url.match(/([^\/]+$)/);
        if (!match) return errorFunc('NO cid found!');
        const cid = match[0];
        this.node.then(node => node.dht.query(cid)).then(infosIterator => {
            const consume = obj => {
                if (obj.done) {
                    el.onerror = null;
                    return errorFunc('Did not find any peers!');
                }
                if (obj.value && obj.value.addrs && obj.value.addrs.length) {
                    // https://github.com/multiformats/js-multiaddr/
                    const nodeAddressess = obj.value.addrs.map(addr => addr.nodeAddress());
                    let errorCounter = 0;
                    el.onerror = error => {
                        // try once for http and then https
                        if(errorCounter < nodeAddressess.length * 2){
                            // bsp: http://209.94.90.1/ipfs/QmTqN2XUqJxEA44F2iWmgp3mopez8Bo5oR3KX4PXwA4a2F
                            el[type] = `http${errorCounter % 2 == 0 ? '' : 's'}://${nodeAddressess[errorCounter].address}/ipfs/${cid}`;
                            errorFunc({message: `trying new url: ${el[type]}!`, address: nodeAddressess[errorCounter], error});
                        }else{
                            return infosIterator.next().then(consume); // continue
                        }
                        errorCounter++;
                    };
                    return obj.value.addrs; // stop but continue iteration onerror
                }
                return infosIterator.next().then(consume); // continue
            };
            return infosIterator.next().then(consume); // kick off the recursive function
        }).catch(errorFunc);
    }
}