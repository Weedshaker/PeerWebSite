# dom2hscript
A lightweight (2kb) html to hyperscript converter that uses the browser's built in DOM and CSS parser.

[![Build Status](https://travis-ci.org/AkeemMcLennon/dom2hscript.svg?branch=master)](https://travis-ci.org/AkeemMcLennon/dom2hscript)

## Usage

``` js
var dom2hscript = require('dom2hscript');
var html = '<div>Hello world</div>';
var output = dom2hscript.parseHTML(html);
console.log(output);
```

## Install

This script is intended to be run in the **BROWSER** and bundled using a tool like browserify or webpack.

``` sh
npm install dom2hscript
```

## Test

This project is using mocha tests run through mochify (browserify + phantomjs)

``` sh
npm test
```

These tests should pass out of the box, but if you make any changes to the source code, it may be necessary to run `grunt build` to generate a new test build.

## Support

Submit Issue in Github

## Contributions

Pull Requests are welcome. If you are submitting your own changes, see the "Test" section above.

## License

MIT

## Thanks

[https://www.npmjs.com/~dominictarr](https://www.npmjs.com/~dominictarr) who wrote hyperscript.

[https://www.npmjs.com/~twilson63](https://www.npmjs.com/~twilson63) who inspired this project with html2hscript
