/*jshint esnext: true */

export class ProgressBar {
	constructor(torrents, addTorrent, removeTorrentNode, interval = 1000, animationClass = 'torrentLoading') {
		this.torrents = torrents;
		this.addTorrent = addTorrent;
		this.removeTorrentNode = removeTorrentNode;
		this.interval = interval;

		this.resetInterval = this.interval * 5;
		this.intervalCont = undefined;
		this.tags = ['span'];
		this.classes = ['torrentInfo', animationClass, 'torrentProgress', 'torrentControls'];
	}
	start() {
		if (!this.intervalCont) this.intervalCont = setInterval(() => {this.update();}, this.interval);
	}
	end() {
		this.intervalCont = clearInterval(this.intervalCont);
		for (let torrent of this.torrents.values()) {
			this.removeAll(torrent);
		}
	}
	update(){
		for(let torrent of this.torrents.values()){
			if (torrent.sst_nodes && !torrent.sst_containsVideo){ // don't add progressBar to videos, they stream anyways
				if (torrent.done){
					this.removeAll(torrent);
				} else {
					let progress = (100 * torrent.progress).toFixed(1);
					if (!torrent.sst_progressNodes) torrent.sst_progressNodes = new Map();
					torrent.sst_nodes.forEach(node => {
						let parentNode = torrent.sst_progressNodes.get(node), animationNode, infoNode, controlsNode;
						if (!parentNode || !node.contains(parentNode)){
							parentNode = document.createElement('span');
							parentNode.classList.add(this.classes[0]);
							node.appendChild(parentNode);
							torrent.sst_progressNodes.set(node, parentNode);
							// child nodes of parentNode
							animationNode = document.createElement('span');
							animationNode.classList.add(this.classes[1]);
							parentNode.appendChild(animationNode);
							infoNode = document.createElement('span');
							infoNode.classList.add(this.classes[2]);
							parentNode.appendChild(infoNode);
							controlsNode = document.createElement('a');
							controlsNode.classList.add(this.classes[3]);
							controlsNode.innerText = 'Reset';
							controlsNode.onclick = () => {
								const magnetURI = torrent.magnetURI;
								const sst_id = torrent.sst_id;
								let nodes = [];
								torrent.sst_nodes.forEach(node => {
									nodes.push(node);
									this.removeTorrentNode(node, () => {
										setTimeout(() => {
											nodes.forEach(node => {
												this.addTorrent(magnetURI, sst_id, node);
											});
										}, this.resetInterval);
									});
								});
							};
							parentNode.appendChild(controlsNode);
						}else{
							infoNode = parentNode.getElementsByClassName(this.classes[2])[0];
						}
						infoNode.innerHTML = `&nbsp;${progress}%&nbsp;`;
					});
				}
			}
		}
	}
	// removes the parentNode when MasterWebTorrent.appended
	remove(torrent, node){
		if(torrent.sst_progressNodes){
			let parentNode = torrent.sst_progressNodes.get(node);
			if(parentNode && node.contains(parentNode)){
				node.removeChild(parentNode);
				torrent.sst_progressNodes.delete(node);
				if (!torrent.sst_progressNodes.size) delete torrent.sst_progressNodes;
			}else{
				// remove by class just in case virtual-dom mixed something up
				[...node.getElementsByClassName(this.classes[0])].forEach(parentNode => {
					node.removeChild(parentNode);
				});
			}
		}
	}
	removeAll(torrent){
		if(torrent.sst_progressNodes){
			torrent.sst_nodes.forEach(node => {
				this.remove(torrent, node);
			});
		}
	}
}