var webpackConfig = require('./webpack.config')

var config = {

  frameworks: ['mocha', 'effroi'],

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

  webpack: Object.assign(webpackConfig, {
    entry: undefined,
    // this watcher watches when source files are updated
    watch: true,
    devtool: 'inline-source-map',
    module: Object.assign(webpackConfig.module, {
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

  browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],
  browserNoActivityTimeout: 30000,

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
