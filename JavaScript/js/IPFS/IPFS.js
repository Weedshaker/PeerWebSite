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
        return fetch(this.baseUrl + cid);
    }
}