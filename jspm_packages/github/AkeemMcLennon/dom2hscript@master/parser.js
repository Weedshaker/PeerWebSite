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