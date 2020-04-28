/* */ 
'use strict';
var Buffer = require('../../index').Buffer;
var assert = require('assert');
var buffer = require('../../index');
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var ones = [1, 1, 1, 1];
var sb = SlowBuffer(4);
assert(sb instanceof Buffer);
assert.strictEqual(sb.length, 4);
sb.fill(1);
for (var [key, value] of sb.entries()) {
  assert.deepStrictEqual(value, ones[key]);
}
assert.strictEqual(sb.buffer.byteLength, 4);
sb = SlowBuffer(4);
assert(sb instanceof Buffer);
assert.strictEqual(sb.length, 4);
sb.fill(1);
for (var [key, value] of sb.entries()) {
  assert.deepStrictEqual(value, ones[key]);
}
assert.strictEqual(SlowBuffer(0).length, 0);
try {
  assert.strictEqual(SlowBuffer(buffer.kMaxLength).length, buffer.kMaxLength);
} catch (e) {
  assert.equal(e.message, 'Array buffer allocation failed');
}
assert.strictEqual(SlowBuffer('6').length, 6);
assert.strictEqual(SlowBuffer(true).length, 1);
assert.strictEqual(SlowBuffer().length, 0);
assert.strictEqual(SlowBuffer(NaN).length, 0);
assert.strictEqual(SlowBuffer({}).length, 0);
assert.strictEqual(SlowBuffer('string').length, 0);
assert.throws(function() {
  SlowBuffer(Infinity);
}, 'invalid Buffer length');
assert.throws(function() {
  SlowBuffer(-1);
}, 'invalid Buffer length');
assert.throws(function() {
  SlowBuffer(buffer.kMaxLength + 1);
}, 'invalid Buffer length');
