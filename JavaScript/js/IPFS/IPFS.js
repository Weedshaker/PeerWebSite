export class IPFS {
	constructor(){
        // https://ipfs.io/ipfs/QmYUpUyrLNaeBBA9oHizeXsXFZjJV7KCWVMkZS4nvHcCTR
        // should be 'ipfs://' but browsers do not yet support that url scheme, once this gateway would get blocked or overloaded the files have to be fixed through the service worker
        this.baseUrl = 'https://gateway.ipfs.io/ipfs/';
        // https://github.com/ipfs/js-ipfs/blob/master/examples/browser-ipns-publish/index.js
        // TODO: wait for name publish and resolve DHT fixes: https://github.com/ipfs/js-ipfs/issues/2921
        // NOTE: IPNS not yet working 2021-03-21
        /*
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
        */
        this.node = window.Ipfs.create({
            config: {
                dht: {
                    enabled: true,
                },
                // https://github.com/ipfs/js-ipfs/issues/2779
                Addresses: {
                    Swarm: []
                }
            },
            // https://github.com/ipfs/js-ipfs/blob/bbcaf34111251b142273a5675f4754ff68bd9fa0/examples/browser-ipns-publish/index.js
            EXPERIMENTAL: { pubsub: true, ipnsPubsub: true },
        });
       // https://github.com/ipfs/js-ipfs/tree/bf92fb321a66651a63a8b9cc81112f149573826a/examples
       /*
        this.node = window.Ipfs.create({
            start: true,
            repo: 'source/ipfs',
            preload: {enabled:false},
            relay: {enabled: true,
                hop: {enabled: true,
                active: true}},
            EXPERIMENTAL: {pubsub: true},
            config: { Addresses: { Swarm: [ '/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/' ],
            Discovery: { MDNS: { Enabled: true,
                Interval: 10 },
            webRTCStar: { Enabled: true } } }
        }});
        */
        // https://www.youtube.com/watch?v=Nv_Teb--1zg pubsub room
        // https://www.youtube.com/watch?v=-kdx8rJd8rQ collab editing
        this.isIdle = new Promise(resolve => document.readyState !== 'complete' ? window.addEventListener('load', event => setTimeout(() => resolve(), 60000)) : setTimeout(() => resolve(), 60000));
    }
    add(path, content){
        return this.node.then(node => node.add({path, content})).then(file => Object.assign({link: this.baseUrl + file.cid}, file));
    }
    get(cid){
        return fetch(this.baseUrl + cid).then(response => response.text());
    }
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
    key(){
        return this.node.then(node => node.key);
    }
    name(){
        return this.node.then(node => Object. assign(node.name, {
            sst_resolve: (value, options) => {
                const chunksIterator = node.name.resolve(value, options);
                const chunks = [];
                const consume = obj => {
                    if (obj.done) return chunks.toString();
                    chunks.push(obj.value);
                    return chunksIterator.next().then(consume);
                };
                return chunksIterator.next().then(consume); // kick off the recursive function
            }
        }));
    }
}