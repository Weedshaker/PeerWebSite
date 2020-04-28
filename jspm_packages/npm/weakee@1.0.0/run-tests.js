/* */ 
"format esm";
var Mocha, fs, mocha, path;

Mocha = require('mocha');

fs = require('fs');

path = require('path');

mocha = new Mocha();
require("babel/register");

fs.readdirSync('./test/').filter(function(file) {
  return file.substr(-3) === '.js';
}).forEach(function(file) {
  return mocha.addFile(path.join('./test/', file));
});

mocha.ui('bdd');

mocha.run(function(failures) {
  return process.exit(failures);
});