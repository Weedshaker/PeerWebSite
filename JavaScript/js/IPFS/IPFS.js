export class IPFS {
	constructor(){
        // https://ipfs.io/ipfs/QmYUpUyrLNaeBBA9oHizeXsXFZjJV7KCWVMkZS4nvHcCTR
        this.baseUrl = 'https://ipfs.io/ipfs/';
        this.node = window.Ipfs.create();
    }
    add(path, content){
        return this.node.then(node => node.add({path, content}));
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
}