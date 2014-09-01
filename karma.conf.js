// Karma configuration
// Generated on Mon Oct 07 2013 15:55:00 GMT+0100 (BST)

module.exports = function(config) {
  config.set({

    frameworks: ['mocha', 'sinon', 'sinon-chai'],

    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },

    files: [
      'test/index.js'
    ],

    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // this watcher watches when bundled files are updated
    autoWatch: true,

    webpack: {
      cache: true,
      // this watcher watches when source files are updated
      watch: false,
      resolve: {
        alias: {
          'cherrytree': __dirname
        }
      },
      devtool: 'inline-source-map'
    },

    webpackServer: {
      noInfo: true
    },

    browsers: ['Chrome']
  });
};
