/* */ 
(function(Buffer) {
  var test = require('tape');
  var crypto = require('../index');
  var Buffer = require('safe-buffer').Buffer;
  test('get error message', function(t) {
    try {
      var b = crypto.randomFillSync(Buffer.alloc(10));
      t.ok(Buffer.isBuffer(b));
      t.end();
    } catch (err) {
      t.ok(/not supported/.test(err.message), '"not supported"  is in error message');
      t.end();
    }
  });
  test('randomfill', function(t) {
    t.plan(5);
    t.equal(crypto.randomFillSync(Buffer.alloc(10)).length, 10);
    t.ok(Buffer.isBuffer(crypto.randomFillSync(Buffer.alloc(10))));
    crypto.randomFill(Buffer.alloc(10), function(ex, bytes) {
      t.error(ex);
      t.equal(bytes.length, 10);
      t.ok(Buffer.isBuffer(bytes));
      t.end();
    });
  });
  test('seems random', function(t) {
    var L = 1000;
    var b = crypto.randomFillSync(Buffer.alloc(L));
    var mean = [].reduce.call(b, function(a, b) {
      return a + b;
    }, 0) / L;
    var expected = 256 / 2;
    var smean = Math.sqrt(mean);
    console.log(JSON.stringify([expected - smean, mean, expected + smean]));
    t.ok(mean < expected + smean);
    t.ok(mean > expected - smean);
    t.end();
  });
})(require('buffer').Buffer);
