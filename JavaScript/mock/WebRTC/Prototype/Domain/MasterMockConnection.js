/*jshint esnext: true */

export class MasterMockConnection {
	constructor(){
		let peers = ['mock2'];
		this.connection = {
			userid: 'mock1',
			openOrJoin: function(roomid){console.log(`openOrJoin: ${roomid}`);},
			token: function(){return 'mock';},
			getAllParticipants: function(){return peers;},
			peers: {channels: []}
		};
		peers.forEach((peer) => {
			this.connection.peers[peer] = {};
			this.connection.peers[peer].channels = [{send: function(message){
				console.log(`send: ${message}`);
				window.WebRTC.Receiver.receiveEvent(message, peer);
			}}];
		});
		return this.connection;
	}
}