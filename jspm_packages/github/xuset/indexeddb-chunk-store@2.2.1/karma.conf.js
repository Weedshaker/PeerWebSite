module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['tap', 'browserify'],

    // list of files / patterns to load in the browser
    files: [
      'test.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test.js': ['browserify']
    },

    browserify: {
      debug: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: process.env.CI ? ['dots', 'saucelabs'] : ['dots'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    browserNoActivityTimeout: process.env.CI ? 300 * 1000 : 10 * 1000,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: process.env.CI
      ? ['SL_Chrome', 'SL_Firefox', 'SL_Edge', 'SL_IE', 'SL_Safari']
      : ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !!process.env.CI,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    sauceLabs: {
      testName: 'indexeddb-chunk-store'
    },
    customLaunchers: {
      SL_Chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: 'latest'
      },
      SL_Firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: 'latest'
      },
      SL_Edge: {
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        version: 'latest'
      },
      SL_IE: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: 'latest'
      },
      SL_Safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        version: 'latest'
      }
    }
  })
}
