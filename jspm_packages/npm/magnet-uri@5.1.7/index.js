/* */ 
(function(Buffer) {
  module.exports = magnetURIDecode;
  module.exports.decode = magnetURIDecode;
  module.exports.encode = magnetURIEncode;
  var base32 = require('thirty-two');
  var Buffer = require('safe-buffer').Buffer;
  var extend = require('xtend');
  var uniq = require('uniq');
  function magnetURIDecode(uri) {
    var result = {};
    var data = uri.split('magnet:?')[1];
    var params = (data && data.length >= 0) ? data.split('&') : [];
    params.forEach(function(param) {
      var keyval = param.split('=');
      if (keyval.length !== 2)
        return;
      var key = keyval[0];
      var val = keyval[1];
      if (key === 'dn')
        val = decodeURIComponent(val).replace(/\+/g, ' ');
      if (key === 'tr' || key === 'xs' || key === 'as' || key === 'ws') {
        val = decodeURIComponent(val);
      }
      if (key === 'kt')
        val = decodeURIComponent(val).split('+');
      if (key === 'ix')
        val = Number(val);
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(val);
        } else {
          var old = result[key];
          result[key] = [old, val];
        }
      } else {
        result[key] = val;
      }
    });
    var m;
    if (result.xt) {
      var xts = Array.isArray(result.xt) ? result.xt : [result.xt];
      xts.forEach(function(xt) {
        if ((m = xt.match(/^urn:btih:(.{40})/))) {
          result.infoHash = m[1].toLowerCase();
        } else if ((m = xt.match(/^urn:btih:(.{32})/))) {
          var decodedStr = base32.decode(m[1]);
          result.infoHash = Buffer.from(decodedStr, 'binary').toString('hex');
        }
      });
    }
    if (result.infoHash)
      result.infoHashBuffer = Buffer.from(result.infoHash, 'hex');
    if (result.dn)
      result.name = result.dn;
    if (result.kt)
      result.keywords = result.kt;
    if (typeof result.tr === 'string')
      result.announce = [result.tr];
    else if (Array.isArray(result.tr))
      result.announce = result.tr;
    else
      result.announce = [];
    result.urlList = [];
    if (typeof result.as === 'string' || Array.isArray(result.as)) {
      result.urlList = result.urlList.concat(result.as);
    }
    if (typeof result.ws === 'string' || Array.isArray(result.ws)) {
      result.urlList = result.urlList.concat(result.ws);
    }
    uniq(result.announce);
    uniq(result.urlList);
    return result;
  }
  function magnetURIEncode(obj) {
    obj = extend(obj);
    if (obj.infoHashBuffer)
      obj.xt = 'urn:btih:' + obj.infoHashBuffer.toString('hex');
    if (obj.infoHash)
      obj.xt = 'urn:btih:' + obj.infoHash;
    if (obj.name)
      obj.dn = obj.name;
    if (obj.keywords)
      obj.kt = obj.keywords;
    if (obj.announce)
      obj.tr = obj.announce;
    if (obj.urlList) {
      obj.ws = obj.urlList;
      delete obj.as;
    }
    var result = 'magnet:?';
    Object.keys(obj).filter(function(key) {
      return key.length === 2;
    }).forEach(function(key, i) {
      var values = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
      values.forEach(function(val, j) {
        if ((i > 0 || j > 0) && (key !== 'kt' || j === 0))
          result += '&';
        if (key === 'dn')
          val = encodeURIComponent(val).replace(/%20/g, '+');
        if (key === 'tr' || key === 'xs' || key === 'as' || key === 'ws') {
          val = encodeURIComponent(val);
        }
        if (key === 'kt')
          val = encodeURIComponent(val);
        if (key === 'kt' && j > 0)
          result += '+' + val;
        else
          result += key + '=' + val;
      });
    });
    return result;
  }
})(require('buffer').Buffer);
