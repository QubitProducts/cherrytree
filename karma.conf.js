var _ = require('lodash')
var webpackConfig = require('./webpack.config')

var config = {

  frameworks: ['mocha'],

  preprocessors: {
    'tests/index.js': ['webpack', 'sourcemap']
  },

  files: [
    'tests/index.js'
  ],

  // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
  reporters: ['progress', 'coverage'],

  // this watcher watches when bundled files are updated
  autoWatch: true,

  webpack: _.extend(webpackConfig, {
    entry: undefined,
    // this watcher watches when source files are updated
    watch: true,
    module: _.extend(webpackConfig.module, {
      postLoaders: [{
        test: /\.js/,
        exclude: /(test|node_modules)/,
        loader: 'istanbul-instrumenter'
      }]
    })
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

  browsers: ['Chrome'],

  coverageReporter: {
    reporters: [
      {type: 'html', dir: 'coverage/'},
      {type: 'text-summary'}
    ]
  }
}

module.exports = function (c) {
  c.set(config)
}

module.exports.config = config
