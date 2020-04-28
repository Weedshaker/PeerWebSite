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
