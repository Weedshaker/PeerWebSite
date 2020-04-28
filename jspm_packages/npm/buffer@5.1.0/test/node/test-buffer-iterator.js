/* */ 
'use strict';
var Buffer = require('../../index').Buffer;
var assert = require('assert');
var buffer = Buffer.from([1, 2, 3, 4, 5]);
var arr;
var b;
arr = [];
for (b of buffer)
  arr.push(b);
assert.deepStrictEqual(arr, [1, 2, 3, 4, 5]);
arr = [];
for (b of buffer[Symbol.iterator]())
  arr.push(b);
assert.deepStrictEqual(arr, [1, 2, 3, 4, 5]);
arr = [];
for (b of buffer.values())
  arr.push(b);
assert.deepStrictEqual(arr, [1, 2, 3, 4, 5]);
arr = [];
for (b of buffer.keys())
  arr.push(b);
assert.deepStrictEqual(arr, [0, 1, 2, 3, 4]);
arr = [];
for (b of buffer.entries())
  arr.push(b);
assert.deepStrictEqual(arr, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]);
