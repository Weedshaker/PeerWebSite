# peerweb.site
## Real Time Peer to Peer Web Site

### Functionalities
1. **Use WebTorrent for files**: This will enable WebTorrent for added files. Use this, if you use Chrome and your target audience also uses Chrome. It allows video steaming and will perform better in case your site is file heavy. In cases where there are only few seeders this possibly is slower.

2. **Start live session**: This opens a session/peer to peer room where your audience can join and see your changes in real time. Your site will be gone once you close your tab, browser or reload.

3. **Make WebTorrent**: This bundles all your text and files into a WebTorrent. It is like a snapshot of your site to share. Your link with the content stays accessible as long as at least one person has your sites WebTorrent active. More infos about WebTorrents can be found [here](https://webtorrent.io/).

### Description
Send Texts, Pictures and Videos embedded in HTML and CSS through WebRTC in acquaintance of WebTorrents for files, live edited P2P. No conversation data passes a server nor is saved anywhere but **sent directly from browser to browser**. Your website disappears from the aether as soon as you close or reload your tab, except of your WebTorrent snapshots. *(Saving in-site WebTorrents is not yet supported.)*

### Use cases
You can not only host simple sites but you could write full JavaScript applications, games and host them from your browser tab. At the moment a ServiceWorker will support loading WebTorrents, if fetches references the same file name as the torrent file has. All other data has to be put inline into the HTML.

### Further Development
Give me a Star on Github and I will consider to actually tide up the code and write Docs for it, that other Developers could have an easy entry to participate, which will bring this App to what you wish for as a peer to peer privacy enthusiast.

### Pitfalls
This application has been only tested in Chrome. Don't expect miracles, it's a pure hobby, side project and due to bleeding edge sometimes buggy.

### Road map
1. Load/Save including WebTorrents

2. Search Engine (by km/miles-radius, topic, etc., to opt in your peerwebsite.)

### Big Thanks to
Muaz Khan, Feross and all others who contributed to the dependencies!