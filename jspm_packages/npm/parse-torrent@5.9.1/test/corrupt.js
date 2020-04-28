/* */ 
var fixtures = require('webtorrent-fixtures');
var parseTorrent = require('../index');
var test = require('tape');
test('exception thrown when torrent file is missing `name` field', function(t) {
  t.throws(function() {
    parseTorrent(fixtures.corrupt.torrent);
  });
  t.end();
});
