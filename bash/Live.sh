#!/bin/bash
source PATH.sh
cd ../
#jspm bundle-sfx ./config.js + ./JavaScript/js/init.js ./JavaScript/webRTC.js --minify
jspm bundle-sfx ./config.js + ./JavaScript/js/init.js ./JavaScript/webRTC.js
minify ./JavaScript/webRTC.js --out-file ./JavaScript/webRTC.js --mangle false
# http://jspm.io/0.17-beta-guide/static-builds-with-rollup-optimization.html
#jspm build ./JavaScript/js/init.js ./JavaScript/webRTC.js