// Karma configuration
// Generated on Mon Oct 07 2013 15:55:00 GMT+0100 (BST)

module.exports = function(config) {
  config.set({
    // frameworks to use
    frameworks: ['requirejs', 'mocha', 'sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      'test/setup/amd-module-config.js',
      'test/setup/test-main.js',
      {pattern: '**/*.js', included: false}
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome']
  });
};
