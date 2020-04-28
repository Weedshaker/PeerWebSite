/* */ 
var sha1 = require('./index');
sha1('hey there', function(hash) {
  console.log('async:', hash);
});
console.log('sync:', sha1.sync('hey there'));
