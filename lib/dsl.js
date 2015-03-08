let ancestors, matches

module.exports = function dsl (callback) {
  ancestors = []
  matches = {}

  callback(function route (name, options, callback) {
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

    let routes
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
      ancestors: _.clone(ancestors)
    })
  })

  return pop()
}

function pop () {
  let m = matches[currentLevel()]
  delete matches[currentLevel()]
  return m || []
}

function push (route) {
  matches[currentLevel()] = matches[currentLevel()] || []
  matches[currentLevel()].push(route)
}

function currentLevel () {
  return ancestors.join('.')
}
