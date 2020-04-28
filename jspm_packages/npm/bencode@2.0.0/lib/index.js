/* */ 
(function(Buffer) {
  var bencode = module.exports;
  bencode.encode = require('./encode');
  bencode.decode = require('./decode');
  bencode.byteLength = bencode.encodingLength = function(value) {
    return bencode.encode(value).length;
  };
})(require('buffer').Buffer);
