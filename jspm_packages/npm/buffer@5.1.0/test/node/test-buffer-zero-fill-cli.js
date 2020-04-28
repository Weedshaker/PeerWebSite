/* */ 
'use strict';
var Buffer = require('../../index').Buffer;
var SlowBuffer = require('../../index').SlowBuffer;
var assert = require('assert');
function isZeroFilled(buf) {
  for (var n = 0; n < buf.length; n++)
    if (buf[n] > 0)
      return false;
  return true;
}
for (var i = 0; i < 50; i++) {
  var bufs = [Buffer.alloc(20), Buffer.allocUnsafe(20), SlowBuffer(20), Buffer(20), new SlowBuffer(20)];
  for (var buf of bufs) {
    assert(isZeroFilled(buf));
  }
}
