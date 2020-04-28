/* */ 
var r;
module.exports = function rand(len) {
  if (!r)
    r = new Rand(null);
  return r.generate(len);
};
function Rand(rand) {
  this.rand = rand;
}
module.exports.Rand = Rand;
Rand.prototype.generate = function generate(len) {
  return this._rand(len);
};
Rand.prototype._rand = function _rand(n) {
  if (this.rand.getBytes)
    return this.rand.getBytes(n);
  var res = new Uint8Array(n);
  for (var i = 0; i < res.length; i++)
    res[i] = this.rand.getByte();
  return res;
};
if (typeof self === 'object') {
  if (self.crypto && self.crypto.getRandomValues) {
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      self.crypto.getRandomValues(arr);
      return arr;
    };
  } else if (self.msCrypto && self.msCrypto.getRandomValues) {
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      self.msCrypto.getRandomValues(arr);
      return arr;
    };
  } else if (typeof window === 'object') {
    Rand.prototype._rand = function() {
      throw new Error('Not implemented yet');
    };
  }
} else {
  try {
    var crypto = require('@empty');
    if (typeof crypto.randomBytes !== 'function')
      throw new Error('Not supported');
    Rand.prototype._rand = function _rand(n) {
      return crypto.randomBytes(n);
    };
  } catch (e) {}
}
