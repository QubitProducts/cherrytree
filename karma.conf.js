// Karma configuration
// Generated on Mon Oct 07 2013 15:55:00 GMT+0100 (BST)

var config = {

  frameworks: ['mocha'],

  preprocessors: {
    'tests/index.js': ['webpack', 'sourcemap']
  },

  files: [
    'tests/index.js'
  ],

  // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
  reporters: ['progress'],

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
    useIframe: true,
    captureConsole: true,
    mocha: {
      ui: 'qunit'
    }
  },

  browsers: ['Chrome']
}

module.exports = function (c) {
  c.set(config)
}

module.exports.config = config
