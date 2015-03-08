var _ = require('lodash')

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

  webpack: _.extend(require('./webpack.config'), {
    entry: undefined,
    // this watcher watches when source files are updated
    watch: true
  }),

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
