/* */ 
(function(Buffer) {
  var sha1 = require('../index');
  var test = require('tape');
  test('sha1', function(t) {
    t.plan(2);
    sha1(new Buffer('hey there'), function(hash) {
      t.equal(hash, '6b1c01703b68cf9b35ab049385900b5c428651b6');
    });
    sha1('hey there', function(hash) {
      t.equal(hash, '6b1c01703b68cf9b35ab049385900b5c428651b6');
    });
  });
  test('sha1.sync', function(t) {
    t.equal(sha1.sync(new Buffer('hey there')), '6b1c01703b68cf9b35ab049385900b5c428651b6');
    t.equal(sha1.sync('hey there'), '6b1c01703b68cf9b35ab049385900b5c428651b6');
    t.end();
  });
})(require('buffer').Buffer);
