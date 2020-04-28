(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dom2hscript = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var parser = require('./parser');
var parseStyle = function(el){
  var style = el.style;
  var output = {};
  for (var i = 0; i < style.length; ++i) {
    var item = style.item(i);
    output[item] = style[item];
  }
  return output;
};

var parseDOM = function(el){
    if(!el.tagName && el.nodeType === Node.TEXT_NODE){
        return JSON.stringify(el.textContent);
    }
    if(!el.attributes){
      return;
    }
    var attributes = {};
    for(var i = 0; i < el.attributes.length; i++){
      var attr = el.attributes[i];
      if(attr.name && typeof attr.value !== "undefined"){
        if(attr.name == "style"){
          attributes.style = parseStyle(el);
        }
        else{
          attributes[attr.name] = attr.value;
        }
      }
    }
    var output = "h('" + el.tagName;
    if(attributes.id){
      output = output +'#'+ attributes.id;
      delete attributes.id;
    }
    if(attributes.class){
      output = output +'.'+ attributes.class.replace(/ /g,".");
      delete attributes.class;
    }
    output += "',";
    output += JSON.stringify(attributes);
    var children = [];
    output += ',[';
    for(var i = 0; i < el.childNodes.length; i++){
      output += parseDOM(el.childNodes[i]) + ",";
    }
    output += "])";
    return output;
};
var parseHTML = function(html){
  return parseDOM(parser(html));
};
exports.parseDOM = parseDOM;
exports.parseHTML = parseHTML;
module.exports = exports;

},{"./parser":2}],2:[function(require,module,exports){
var parser;
if(!window.DOMParser){
  throw new Error("DOMParser required");
}
/* inspired by https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
  "use strict";

  var
    proto = DOMParser.prototype
  , nativeParse = proto.parseFromString
  ;

  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if ((new DOMParser()).parseFromString("", "text/html")) {
      // text/html parsing is natively supported
      return;
    }
  } catch (ex) {}

  proto.parseFromString = function(markup, type) {
    if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
      var
        doc = document.implementation.createHTMLDocument("")
      ;
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
              doc.documentElement.innerHTML = markup;
            }
            else {
              doc.body.innerHTML = markup;
            }
      return doc;
    } else {
      return nativeParse.apply(this, arguments);
    }
  };
}(DOMParser));
parser = new DOMParser();
module.exports = function(html,strictChecking){
  var result = parser.parseFromString(html,'text/html');
  var el;
  // Determine if we're interested in the body or just inside
  if(html.substring(0,10).match(/\<body.+/ig)){
    el = result.getElementsByTagName('body')[0];
  }
  else{
    el = result.getElementsByTagName('body')[0].firstChild;
  }
  var errors = el.getElementsByTagName('parsererror');
  if(errors && errors.length > 0){
    if(strictChecking === true){
      throw new Error(errors[0].textContent);
    }
    for(var i = 0; i < errors.length; i++){
      errors[i].parentElement.removeChild(errors[i]);
    }
  }
  return el;
};
},{}]},{},[1])(1)
});