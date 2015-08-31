var fs = require('fs')
var config = require('./karma.conf').config
var yargs = require('yargs')

var browsers = (yargs.argv.b || '').split(',')

// Use ENV vars on CI and sauce.json locally to get credentials
if (!process.env.SAUCE_USERNAME) {
  if (!fs.existsSync('sauce.json')) {
    console.log('Create a sauce.json with your credentials {username,accessKey}.')
    process.exit(1)
  } else {
    var sauce = require('./sauce')
    process.env.SAUCE_USERNAME = sauce.username
    process.env.SAUCE_ACCESS_KEY = sauce.accessKey
  }
}

var platforms = [
  ['android', '5.1', 'Linux'],
  ['chrome', '32', 'Windows 8.1'],
  ['chrome', '43', 'Linux'],
  ['chrome', 'beta', 'OS X 10.11'],
  ['firefox', '26', 'Windows 8.1'],
  ['firefox', '40', 'Windows 8.1'],
  ['safari', '6', 'OS X 10.8'],
  ['safari', '7', 'OS X 10.9'],
  ['internet explorer', '9', 'Windows 7'],
  ['internet explorer', '10', 'Windows 8'],
  ['internet explorer', '11', 'Windows 8.1']
]

var customLaunchers = platforms.reduce(function (memo, platform, i) {
  if (!browsers || browsers.indexOf(platform[0]) > -1) {
    memo['SL_' + i + '_' + platform[0] + platform[1]] = {
      base: 'SauceLabs',
      platform: platform[2],
      browserName: platform[0],
      version: platform[1]
    }
  }
  return memo
}, {})

module.exports = function (c) {
  c.set(Object.assign(config, {
    sauceLabs: {
      testName: 'Cherrytree',
      build: process.env.CI_BUILD_NUMBER,
      recordVideo: false,
      recordScreenshots: false
    },
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    reporters: ['dots', 'saucelabs'],
    singleRun: true,
    browserDisconnectTimeout: 10000, // default 2000
    browserDisconnectTolerance: 1, // default 0
    browserNoActivityTimeout: 3 * 60 * 1000, // default 10000
    captureTimeout: 3 * 60 * 1000 // default 60000
  }))
}
