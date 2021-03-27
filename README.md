# [peerweb.site](https://peerweb.site/) ![Twitter Follow](https://img.shields.io/twitter/follow/Weedshaker?style=social)
## Real Time Peer to Peer Web Site Host from your Browser

### check out the IPFS Examples ===>
1. [IPFS page with video](https://peerweb.site/#ipfs:QmXLyD6aPKWDdPnAJyrjPrrqTZgTeKXSvgNBHsFgB6Yte5)
2. [IPFS page with audio - Grateful Dead Live borrowed from archive.org](https://peerweb.site/#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t)
3. [IPFS page with client side app](https://peerweb.site/#ipfs:QmZb1mx8WXKReT8YmwY6bt1KTz48wqS9KCXwMptCX3UkpM)
4. [IPFS page with client side app (js + css fed through service worker)](https://peerweb.site/#ipfs:QmP9PpZFt3VirDt5xBe22CAQn8K7QppfER49QRu2ctnLxC)
5. [IPFS page with Loop Machine](https://peerweb.site/#ipfs:QmNzbP6F52d5cSn3FbaX2YmkFF4qfTZkMoJSBpbZUrVt88)<br />
6. [IPFS HTML Example using Browsers Developer Tools and saving to IPFS Desktop (3 Steps)](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools)
    1. [<img src="https://weedshaker.github.io/PeerWebSite/img/screenshot.4.jpg">](https://peerweb.site/#ipfs:QmTouehzuLfsuPuHQg2wDKboAwp5h3XZV6eDZ3bSARuUB4)
    2. [<img src="https://weedshaker.github.io/PeerWebSite/img/screenshot.5.jpg">](https://peerweb.site/#ipfs:QmYbXcdirXy5iFizdch5287gtxsUZA9aErqGQ4JfJvvu87)
    3. [<img src="https://weedshaker.github.io/PeerWebSite/img/screenshot.3.jpg">](https://peerweb.site/#ipfs:QmUNAckSAFmpr2GAgSmjMATKb1YmZFhLXrnZBBLqT1sn6N)
***long time hosted from [IPFS Desktop](https://github.com/ipfs/ipfs-desktop)***

### check out the WebTorrent Examples ===>
1. [WebTorrent page with video](https://peerweb.site/#magnet:?xt=urn:btih:682fc456c6e9d1cb848efe6178fe5f0c26c210fc&dn=peerWebSite.txt&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com)<br />
***Long time hosted from [WebTorrent Desktop](https://webtorrent.io/desktop/)***

### Hosting Methods
1. [IPFS](https://ipfs.io) will propagate the content to the IPFS Distributed Web. Without any requests/hits, the content will remain online up to 30 days, depending the file size. Each content request will extend that lifespan.
2. WebRTC will directly and live share/stream the content to other devices. The content goes offline with closing the session/tab.
3. [WebTorrent](https://webtorrent.io) will propagate the content into the Torrent Network. The content will stay online as long as a client/session is active. The content goes offline, once there are no visitors aka. active sessions with that torrent.

### Description
Send Texts, Music, Pictures and Videos embedded in HTML with CSS and JavaScript through WebRTC, WebTorrents or IPFS, live edited P2P as well as static Torrents + IPFS. With WebRTC/WebTorrent (NOT [IPFS - more details](https://ipfs.io/#why)) - No conversation data passes a server nor is saved anywhere but **sent directly from browser to browser**. Your website disappears from the aether as soon as you close or reload your tab, except of your WebTorrent/IPFS snapshots. *(Saving in-site WebTorrents is not yet supported.)*
**Note: Cellphone networks on 4g/5g possibly block your WebRTC or WebTorrent connections, which renders PeerWebSite unusable, except you use the IPFS option!!! or you could circumvent network restrictions by using a VPN.**
**Note: Clear all your PeerWeb - site specific browser data's in case IPFS or other parts stop working. Eg. Limit exceeded, etc.**

<img src="https://weedshaker.github.io/PeerWebSite/img/screenshot1.png" align="left" width="40%">
<img src="https://weedshaker.github.io/PeerWebSite/img/screenshot2.png" align="right" width="40%">
<br clear="right"/>

### peerweb.site [hosted@ipfs](https://ipfs.io/ipfs/QmQJChGpNVVFvHqWKpmXfGgE5FuFq66DseG2rcejpFDpQW/index_no_tracking.html)
This is the CID: QmQJChGpNVVFvHqWKpmXfGgE5FuFq66DseG2rcejpFDpQW to use the peerweb.site v. beta 0.7.133 directly from your ipfs client: `/ipfs/QmQJChGpNVVFvHqWKpmXfGgE5FuFq66DseG2rcejpFDpQW
[peerweb.site hosted@ipfs](https://ipfs.io/ipns/k2k4r8mv2ud8gd1gndbpdvcagf6r7qodhyojdxzfq4iwbb04ncxiy1x8/index_no_tracking.html)

### Functionalities
TODO: Extend README to cover new IPFS support!!!

1. **Use WebTorrent for files**: This will enable WebTorrent for added files. It allows video steaming and will perform better in case your site is file heavy. It is mandatory for multiple files to load efficiently. Although, it may not work well with other browsers but Chrome.

2. **Activate Live Session & Copy Link**: *(Sometimes unstable due to causes of ICE failed or other issues with WebRTC, require a reload or use Webtorrent/Snapshot.)* This opens a session/peer to peer room where your audience can join and see your changes in real time. Your site will not be reachable, once you close your browser tab. *You could have a two way communication, if you join the room/site not through the link with hash but manually put the channel name into the input field.*

3. **Take Snapshot & Copy Link**: This bundles all your text and files into a WebTorrent or IPFS depending which you choose. This is like a snapshot of your site to share. Your link with the content stays accessible as long as at least one person has your sites WebTorrent active ([IPFS](https://ipfs.io/)S will spread it into the blockchain). More info about WebTorrents can be found [here](https://webtorrent.io/). In case you need to memorize a generated snapshot link, simply use [tinyurl](https://tinyurl.com/), there you can convert your long https://peerweb.site/#magnet:?xt=urn:btih:a... url into a tiny url, which is easy to remember.

4. **Download Files**: To download a picture -> double click. To download a video -> long press. (Default behaviors vary between different browsers and devices. *These possibly conflict.*)

5. **WebTorrent Desktop**: You can host your site reliably from your Mac, Windows or Ubuntu and keep it online. Simply create your site at peerweb.site, once done, click "Take Snapshot & Copy Link":
    1. Open the browsers console and type: `getAllTorrents()`. Save the text file and copy/paste each of the magnetURIs to your [WebTorrent Desktop](https://webtorrent.io/desktop/) client. Wait until WebTorrent Desktop has downloaded all magnetURI/files.
    2. open the browsers console and type: `getAllTorrentFiles()`. Save the files and load each of the files separately into your [WebTorrent Desktop](https://webtorrent.io/desktop/) client. To re-up your site, just reload the same files into [WebTorrent Desktop](https://webtorrent.io/desktop/).
After this is done, you can close your tab at peerweb and your site stays online as long as WebTorrent Desktop hosts it or other people start seeding your peerweb.site.

6. **Tools for Videos and Gifs** [Convert videos to mp4, gif from local or remote file](https://ezgif.com/) & [download video from youtube or twitter](https://www.downloadhelper.net/)


### Use Cases
1. **Quickly and directly transfer data from one device to an other** without the need of sending an e-mail or texting yourself and feeding content to the big data servers from facebook, google, aws or companions. I often have pictures and texts on the smartphone or second computer and need to share them fast and uncomplicated, without login and logging, to my other device(s).

2. **Share Content Temporarily** by opening a peerweb.site session.

3. **Create your Torrent aka. Snapshot** with your content in no-time and share it to the vast world.

4. **Full JavaScript applications eg. games, single page apps, etc.** to host them from your browser tab.
    *Use the browser dev-tools to manipulate `class="note-editable"` aka rich text editor area. Create or copy/paste your html/js/css and open a snapshot link at a fresh window in incognito mode to view the result (sometimes IPFS is not running in incognito mode, then use a second browser.)*
    1. A ServiceWorker will support loading WebTorrents and IPFS Files, if fetch, src, href, etc. references the MagentURI or CID Expl: `<img src="https://magnet:?xt=urn:btih:4bd20cecccdd15512fc3332dfe38296af9a452df&amp;dn=some.svg&amp;tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&amp;tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&amp;tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&amp;tr=udp%3A%2F%2Fexplodie.org%3A6969&amp;tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&amp;tr=wss%3A%2F%2Ftracker.btorrent.xyz&amp;tr=wss%3A%2F%2Ftracker.openwebtorrent.com"></img>` or `<img src="https://ipfs/QmQKaoJcU9QoHHgaSMZ4htAoSXHwBBx25oShbk2f5W1bh1#svg"></img>`. Webtorrents also support the same pattern with only file name of an already present WebTorrent file. Expl: `<img src="https://magnet/some.svg"></img>` (short: first upload files in peerweb.site and then reference them by only file name within scripts, html, etc.), without using the magnetURI/blob as reference.
    2. Use [IPFS Desktop](https://ipfs.io/), [WebTorrent Desktop](https://webtorrent.io/desktop/) or ([Instant.io](https://instant.io/)) to host all your assets, make sure to create a CID/magnetURI for each file and don't bundle them. Then copy/paste or create your indexes html at peerweb.site in the editors container `class="note-editable"`. Make sure to use magnetURIs as referenced values for fetch, src, href, etc. in your scripts/html. You must reference them as src example: `src="https://magnet:?xt=urn:...`, prepend `https://` before `magnet`.

### Further Development
Give me a star on Github, which will motivate me to tide up the code and write Docs for it, that other Developers could have an easy entry to participate, which will bring this App to what you wish for as a peer to peer, privacy and opensource enthusiast.

### Pitfalls
This beta application has been only tested in Chrome. Don't expect miracles, it's a pure hobby, side project and due to bleeding edge sometimes buggy.

### Road map
0. Download all media, harmonize sst_download behavior + figcaption

1. Tide up Code (split out stuff into submodules), make font-sizes variable (expl. style.css:249), get rid of jspm, fix Tests, move hosting to [IPFS](https://ipfs.io/), move UI to WebComponents based Event Driven Architecture, replace http://goqr.me/api/ with local qr code generator (this could be a privacy concern, if this ever gets high usage as well as github as a hoster itself and tinyurl + gtm is going to be removed once reached 100 daily users or 100 github stars... just to keep this in mind.)

2. Increase stability by more carefully handle webtorrent and webrtc events, likely with a [es6 Proxy Wrapper](https://weedshaker.github.io/ProxifyJS/)

3. WebGL Drawing, drag and drop Grids Layouts, other TextEditors without Bootstrap and Jquery, better Video Player, rotate Images, WebTorrent Desktop preview, WebRTC one direction video broadcast

4. Search Engine based on [OrbitDB](https://github.com/orbitdb/orbit-db) (by km/miles-radius, topic, etc., to opt in your peerwebsite.)

5. Better IPFS support: video [Example](https://github.com/ipfs/js-ipfs/tree/master/examples/browser-video-streaming), consider deep integration analog webtorrent, check out if pinning also starts sharing the file at receiver, unpin when deleting ipfs content node, add static cid (ipns) for changeable profile/site with key export, key sharing

6. IPNS for static addresses, which would allow team editing, chat or email type communication (NOTE: IPNS is very slow, see ipnsSupport branch)

### Vision
1. Best user experience of creating content. WYSIWYG, Grid and other Layouts, Markdown, Video, Pics, Data, Data (Folder) Structures, Frontend Code

2. Best experience and choice of transferring or store content.

3. Best choice of how to be discovered/searched

4. Best experience of receiving/viewing content

5. Chance of being rewarded for valuable content on a democratic level

### Tests
~~1. Simple pictures + text snapshot (webtorrent) hosting test from my Raspberry Pi 3b+ by [webtorrent-hybrid](https://github.com/webtorrent/webtorrent-hybrid). Step 1: peerweb.site console: `getAllTorrents()`. Step 2: copy/paste magnetURI for the peerWebSite.txt (html) and two magnetURIs for pictures into webtorrent-hybrid to download the files. Step 3: `webtorrent-hybrid seed [path/file]` to host it permanently at: https://peerweb.site/#magnet:?xt=urn:btih:123646487058d49b7d25d59842cd04862eee8822&dn=peerWebSite.txt&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.fastcast.nz ~~up since May 16th 2020~~ failed after 8 hours. Trying to resolve the issue at [webtorrent-hybrid/issues](https://github.com/webtorrent/webtorrent-hybrid/issues/67). Update: After using `--verbose` flag it has been Up since the 27th of May.~~

### Global Scope
Type `App` in the dev-tools console to expose the whole peerweb.site application. Interesting is `App.WebTorrentReceiver.client` for debugging the WebTorrent client.

### Big Thanks to
Muaz Khan, Juan Benet, Feross and all others who contributed to this repo and this repos dependencies! Also thanks for your support, using this application, spreading the word and a github star ;-)

*PeerWebSite is released under GPL-3.0 License . Copyright (c) Silvan Strübi.*
