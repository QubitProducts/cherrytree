import { clone } from './dash'
import invariant from './invariant'

export default function dsl (callback) {
  let ancestors = []
  let matches = {}
  let names = {}

  callback(function route (name, options, callback) {
    let routes

    invariant(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name)

    names[name] = true

    if (arguments.length === 1) {
      options = {}
    }

    if (arguments.length === 2 && typeof options === 'function') {
      callback = options
      options = {}
    }

    if (typeof options.path !== 'string') {
      let parts = name.split('.')
      options.path = parts[parts.length - 1]
      if (options.path === 'index') {
        options.path = ''
      }
    }

    // go to the next level
    if (callback) {
      ancestors = ancestors.concat(name)
      callback()
      routes = pop()
      ancestors.splice(-1)
    }

    // add the node to the tree
    push({
      name: name,
      path: options.path,
      routes: routes || [],
      options: options,
      ancestors: clone(ancestors)
    })
  })

  function pop () {
    return matches[currentLevel()] || []
  }

  function push (route) {
    matches[currentLevel()] = matches[currentLevel()] || []
    matches[currentLevel()].push(route)
  }

  function currentLevel () {
    return ancestors.join('.')
  }

  return pop()
}
