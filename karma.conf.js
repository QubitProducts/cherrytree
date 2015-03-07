// Karma configuration
// Generated on Mon Oct 07 2013 15:55:00 GMT+0100 (BST)

module.exports = function (config) {
  config.set({

    frameworks: ['mocha', 'sinon', 'sinon-chai'],

    preprocessors: {
      'tests/index.js': ['webpack', 'sourcemap']
    },

    files: [
      'tests/index.js'
    ],

    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // this watcher watches when bundled files are updated
    autoWatch: true,

    webpack: {
      // this watcher watches when source files are updated
      watch: true,
      resolve: {
        alias: {
          'cherrytree': __dirname,
          'expect': 'referee/lib/expect'
        }
      },
      module: {
        loaders: [
          { test: /test.*\.js$/, exclude: /node_modules/, loader: 'babel' }
        ]
      },
      devtool: 'inline-source-map'
    },

    webpackServer: {
      noInfo: true
    },

    client: {
      mocha: {
        ui: 'qunit'
      }
    },

    browsers: ['Chrome']
  })
}
