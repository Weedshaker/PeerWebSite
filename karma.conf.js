// Karma configuration
// Generated on Tue Feb 14 2017 23:59:37 GMT+0900 (JST)
// https://karma-runner.github.io/0.13/config/configuration-file.html
// https://github.com/karma-runner/karma-jasmine
// https://www.npmjs.com/package/karma-systemjs

module.exports = function(config) {
  let baseConf = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jspm', 'jasmine'],


    // list of files / patterns to load in the browser
    files: ['css/*', 'JavaScript/js/Editor/lib/codemirror/*.css'],
    jspm: {
      paths: {
        "*": "*",
        "JavaScript/js/*": "base/JavaScript/js/*",
        "JavaScript/mock/*": "base/JavaScript/mock/*",
        "JavaScript/tests/*": "base/JavaScript/tests/*",
        "Dom/*": "base/JavaScript/js/Dom/*",
        "Editor/*": "base/JavaScript/js/Editor/*",
        "SampleApp/*": "base/JavaScript/js/SampleApp/*",
        "SharedHelper/*": "base/JavaScript/js/SharedHelper/*",
        "WebRTC/*": "base/JavaScript/js/WebRTC/*",
        "WebTorrent/*": "base/JavaScript/js/WebTorrent/*",
        "ServiceWorker/*": "base/JavaScript/js/ServiceWorker/*",
        "mock/*": "base/JavaScript/mock/*",
        "jspm_packages/*": "base/jspm_packages/*",
        "github:*": "base/jspm_packages/github/*",
        "npm:*": "base/jspm_packages/npm/*"
      },
      map: {
        "process": "JavaScript/tests/debug.js" // since using ES6 Promise, this wants to load but doesn't get found, just mocked it with any file to avoid 404
      },
      loadFiles: ['JavaScript/tests/debug.js'],
      serveFiles: ['JavaScript/js/**/*.js', 'JavaScript/mock/**/*.js', 'JavaScript/tests/**/*.js', 'jspm_packages/github/**/*.css', 'MasterServiceWorker.js']
    },


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    browserNoActivityTimeout: 50000
  };
  // WebRTC Tests
  if (process.env.TYPE === 'WebRTC'){
    baseConf.jspm.loadFiles = baseConf.jspm.loadFiles.concat(['JavaScript/js/SampleApp/init.js', 'JavaScript/tests/WebRTC/WebRTC.js']);
  }
  // WebTorrent Tests
  if (process.env.TYPE === 'WebTorrent') {
    baseConf.jspm.loadFiles = baseConf.jspm.loadFiles.concat(['JavaScript/mock/init.js', 'JavaScript/tests/WebTorrent/WebTorrent.js']);
    baseConf.browsers.pop(); // only needs one browser for this test
  }
  // ServiceWorker Tests
  if (process.env.TYPE === 'ServiceWorker') {
    baseConf.jspm.loadFiles = baseConf.jspm.loadFiles.concat(['JavaScript/mock/init.js', 'JavaScript/tests/ServiceWorker/ServiceWorker.js']);
    baseConf.browsers.pop(); // only needs one browser for this test
  }
  config.set(baseConf);
}
