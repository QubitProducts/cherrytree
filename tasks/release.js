#!/usr/bin/env node
var prompt = require('prompt')
var fs = require('fs')
var exec = require('child_process').exec
var color = require('cli-color')
var cyan = color.cyan
var yellow = color.yellow

var schema = {
  properties: {
    version: {
      description: 'version? (old is ' + version() + ')',
      pattern: /^[0-9]\.[0-9]+\.[0-9](-.+)?/,
      message: 'Must be a valid semver string i.e. 1.0.2, 2.3.0-beta.1',
      required: true
    }
  }
}

prompt.start()

prompt.get(schema, function (err, result) {
  if (err) return
  var rawVersion = result.version
  var version = 'v' + rawVersion
  updatePkgJSON(rawVersion)
  commit(version, function () {
    tag(version, function () {
      publish(version)
    })
  })
})

function commit (version, cb) {
  ex('git commit -am "Release ' + version + '"', cb)
}

function tag (version, cb) {
  ex('git tag ' + version, cb)
}

function publish (version) {
  ex('git push origin master', function () {
    ex('git push --tags', function () {
      ex('cd build', function () {
        ex('npm publish')
      })
    })
  })
}

function ex (command, cb) {
  log(cyan('exec:'), yellow(command))
  exec(command, execHandler(cb))
}

function execHandler (cb) {
  return function (err, stdout, stderr) {
    if (err) throw new Error(err)
    console.log(stdout)
    console.log(stderr)
    if (cb) cb()
  }
}

function updatePkgJSON (version) {
  var path = 'package.json'
  var json = readJSON(path)
  json.version = version
  writeJSON(path, json)
  log(cyan('updated'), path)
}

function version () {
  return readJSON('./package.json').version
}

function readJSON (path) {
  return JSON.parse(fs.readFileSync(path).toString())
}

function writeJSON (path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

function log () {
  var args = [].slice.call(arguments, 0)
  console.log.apply(console, [cyan('release:')].concat(args))
}
