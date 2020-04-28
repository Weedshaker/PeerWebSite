/* */ 
(function(Buffer, process) {
  module.exports = parseTorrent;
  module.exports.remote = parseTorrentRemote;
  var blobToBuffer = require('blob-to-buffer');
  var fs = require('fs');
  var get = require('simple-get');
  var magnet = require('magnet-uri');
  var parseTorrentFile = require('parse-torrent-file');
  module.exports.toMagnetURI = magnet.encode;
  module.exports.toTorrentFile = parseTorrentFile.encode;
  function parseTorrent(torrentId) {
    if (typeof torrentId === 'string' && /^(stream-)?magnet:/.test(torrentId)) {
      return magnet(torrentId);
    } else if (typeof torrentId === 'string' && (/^[a-f0-9]{40}$/i.test(torrentId) || /^[a-z2-7]{32}$/i.test(torrentId))) {
      return magnet('magnet:?xt=urn:btih:' + torrentId);
    } else if (Buffer.isBuffer(torrentId) && torrentId.length === 20) {
      return magnet('magnet:?xt=urn:btih:' + torrentId.toString('hex'));
    } else if (Buffer.isBuffer(torrentId)) {
      return parseTorrentFile(torrentId);
    } else if (torrentId && torrentId.infoHash) {
      if (!torrentId.announce)
        torrentId.announce = [];
      if (typeof torrentId.announce === 'string') {
        torrentId.announce = [torrentId.announce];
      }
      if (!torrentId.urlList)
        torrentId.urlList = [];
      return torrentId;
    } else {
      throw new Error('Invalid torrent identifier');
    }
  }
  function parseTorrentRemote(torrentId, cb) {
    var parsedTorrent;
    if (typeof cb !== 'function')
      throw new Error('second argument must be a Function');
    try {
      parsedTorrent = parseTorrent(torrentId);
    } catch (err) {}
    if (parsedTorrent && parsedTorrent.infoHash) {
      process.nextTick(function() {
        cb(null, parsedTorrent);
      });
    } else if (isBlob(torrentId)) {
      blobToBuffer(torrentId, function(err, torrentBuf) {
        if (err)
          return cb(new Error('Error converting Blob: ' + err.message));
        parseOrThrow(torrentBuf);
      });
    } else if (typeof get === 'function' && /^https?:/.test(torrentId)) {
      get.concat({
        url: torrentId,
        timeout: 30 * 1000,
        headers: {'user-agent': 'WebTorrent (http://webtorrent.io)'}
      }, function(err, res, torrentBuf) {
        if (err)
          return cb(new Error('Error downloading torrent: ' + err.message));
        parseOrThrow(torrentBuf);
      });
    } else if (typeof fs.readFile === 'function' && typeof torrentId === 'string') {
      fs.readFile(torrentId, function(err, torrentBuf) {
        if (err)
          return cb(new Error('Invalid torrent identifier'));
        parseOrThrow(torrentBuf);
      });
    } else {
      process.nextTick(function() {
        cb(new Error('Invalid torrent identifier'));
      });
    }
    function parseOrThrow(torrentBuf) {
      try {
        parsedTorrent = parseTorrent(torrentBuf);
      } catch (err) {
        return cb(err);
      }
      if (parsedTorrent && parsedTorrent.infoHash)
        cb(null, parsedTorrent);
      else
        cb(new Error('Invalid torrent identifier'));
    }
  }
  function isBlob(obj) {
    return typeof Blob !== 'undefined' && obj instanceof Blob;
  }
  ;
  (function() {
    Buffer.alloc(0);
  })();
})(require('buffer').Buffer, require('process'));
