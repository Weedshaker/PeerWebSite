# peerweb.site
## Real Time Peer to Peer Web Site

### Functionalities
1. **Use WebTorrent for files**: This will enable WebTorrent for added files. It allows video steaming and will perform better in case your site is file heavy. It is mandatory for multiple files to load efficiently. Although, it may not work well with other browsers but Chrome.

2. **Activate Live Session & Copy Link**: This opens a session/peer to peer room where your audience can join and see your changes in real time. Your site will not be reachable, once you close your browser tab.

3. **Take Snapshot & Copy Link**: This bundles all your text and files into a WebTorrent. Which is like a snapshot of your site to share. Your link with the content stays accessible as long as at least one person has your sites WebTorrent active. More infos about WebTorrents can be found [here](https://webtorrent.io/).

4. **WebTorrent Desktop**: You can host your site reliably from your Mac, Windows or Ubuntu and keep it online. Simply create your site at peerweb.site, open the browsers console and type: `getAllTorrents()`. Save the text file and copy/paste each of the magnetURIs to your [WebTorrent Desktop](https://webtorrent.io/desktop/) client. Wait until WebTorrent Desktop has downloaded all magnetURI/files. Then you can close your browser and your site stays online as long as WebTorrent Desktop runs or other people seed your peerweb.site.

### Description
Send Texts, Pictures and Videos embedded in HTML and CSS through WebRTC in acquaintance of WebTorrents for files, live edited P2P as well as static Torrents. No conversation data passes a server nor is saved anywhere but **sent directly from browser to browser**. Your website disappears from the aether as soon as you close or reload your tab, except of your WebTorrent snapshots. *(Saving in-site WebTorrents is not yet supported.)*

### Use cases
You can not only host simple sites but you could write full JavaScript applications, games and host them from your browser tab. At the moment a ServiceWorker will support loading WebTorrents, if fetches references the same file name as the torrent file has. All other data has to be put inline into the HTML.

### Further Development
Give me a Star on Github and I will consider to actually tide up the code and write Docs for it, that other Developers could have an easy entry to participate, which will bring this App to what you wish for as a peer to peer privacy enthusiast.

### Pitfalls
This application has been only tested in Chrome. Don't expect miracles, it's a pure hobby, side project and due to bleeding edge sometimes buggy.

### Road map
1. Tide up Code

2. WebGL Drawing, WebRTC one direction video broadcast, Grids, other TextEditors without Bootstrap and Jquery, better Video Player, rotate Images, WebTorrent Desktop preview

3. Load/Save including WebTorrents

4. Search Engine (by km/miles-radius, topic, etc., to opt in your peerwebsite.)

### Big Thanks to
Muaz Khan, Feross and all others who contributed to the dependencies!

*PeerWebSite is released under MIT licence . Copyright (c) Silvan Strübi.*