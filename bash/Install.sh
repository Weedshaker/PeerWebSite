#!/bin/bash
source PATH.sh
cd ../
npm install -g jspm
npm install babel-minify -g
npm install
jspm install
cd ./jspm_packages/github/muaz-khan/RTCMultiConnection*/
npm install --production