var _ = require('lodash')
var dsl = require('./dsl')
var Path = require('./path')
var invariant = require('./invariant')
var Promise = require('../vendor/promise')
var HistoryLocation = require('./locations/history')

function createLogger (log, error) {
  // falsy means no logging
  if (!log) return () => {}
  // custom logging function
  if (log !== true) return log
  // true means use the default logger - console
  let fn = error ? console.error : console.info
  return function () {
    fn.apply(console, arguments)
  }
}

/**
 * Constructor
 */
var Cherrytree = function () {
  this.initialize.apply(this, arguments)
}

/**
 * The actual constructor
 * @param {Object} options
 */
Cherrytree.prototype.initialize = function (options) {
  this.nextId = 1
  this.state = {}
  this.middleware = []
  this.options = _.extend({}, options)
  this.log = createLogger(this.options.log)
  this.logError = createLogger(this.options.logError === false ? false : true, true)
}

/**
 * Add a middleware
 * @param  {Function} middleware
 * @return {Object}   router
 * @api public
 */
Cherrytree.prototype.use = function (middleware) {
  this.middleware.push(middleware)
  return this
}

/**
 * Add the route map
 * @param  {Function} routes
 * @return {Object}   router
 * @api public
 */
Cherrytree.prototype.map = function (routes) {
  // create the route tree
  this.routes = dsl(routes)

  // create the matcher list, which is like a flattened
  // list of routes = a list of all branches of the route tree
  var matchers = this.matchers = []

  eachBranch({routes: this.routes}, [], function (routes) {
    // concatenate the paths of the list of routes
    var path = _.reduce(routes, function (memo, r) {
      // reset if there's a leading slash, otherwise concat
      // and keep resetting the trailing slash
      return (r.path[0] === '/' ? r.path : memo + '/' + r.path).replace(/\/$/, '')
    }, '')
    // ensure we have a leading slash
    if (path === '') {
      path = '/'
    }
    // register routes
    matchers.push({
      routes: routes,
      name: routes[routes.length - 1].name,
      path: path,
      paramNames: Path.extractParamNames(routes[routes.length - 1].path)
    })
  })

  function eachBranch (node, memo, fn) {
    _.each(node.routes, function (route) {
      if (!route.routes || route.routes.length === 0) {
        fn.call(null, memo.concat(route))
      } else {
        eachBranch(route, memo.concat(route), fn)
      }
    })
  }

  return this
}

/**
 * Starts listening to the location changes.
 * @param  {Object}  location (optional)
 * @return {Promise} initial transition
 *
 * @api public
 */
Cherrytree.prototype.listen = function (location) {
  var router = this
  location = this.location = location || this.createDefaultLocation()

  // setup the location onChange handler
  this.previousUrl = location.getURL()
  location.onChange(dispatch)
  // and also kick off the initial transition
  return dispatch(location.getURL())

  function dispatch (url) {
    var transition = router.dispatch(url)

    transition.then(function () {
      router.previousUrl = url
    }).catch(function (err) {
      if (err && err.type === 'TransitionCancelled') {
        // reset the URL in case the transition has been cancelled
        location.replaceURL(router.previousUrl, {trigger: false})
      }
      return err
    })

    return transition
  }
}

/**
 * Transition to a different route. Passe in url or a route name followed by params and query
 * @param  {String} url     url or route name
 * @param  {Object} params  Optional
 * @param  {Object} query   Optional
 * @return {Object}         transition
 *
 * @api public
 */
Cherrytree.prototype.transitionTo = function (url) {
  if (this.state.activeTransition) {
    return this.replaceWith.apply(this, arguments)
  }

  var location = this.location
  if (url[0] !== '/') {
    url = this.generate.apply(this, arguments)
  }
  this.previousUrl = location.getURL()
  location.setURL(url)
  return this.state.activeTransition
}

/**
 * Like transitionTo, but doesn't leave an entry in the browser's history,
 * so clicking back will skip this route
 * @param  {String} url     url or route name followed by params and query
 * @param  {Object} params  Optional
 * @param  {Object} query   Optional
 * @return {Object}         transition
 *
 * @api public
 */
Cherrytree.prototype.replaceWith = function (url) {
  var location = this.location
  if (url[0] !== '/') {
    url = this.generate.apply(this, arguments)
  }
  this.previousUrl = location.getURL()
  location.replaceURL(url)
  return this.state.activeTransition
}

/**
 * Create an href
 * @param  {String} name   target route name
 * @param  {Object} params
 * @param  {Object} query
 * @return {String}        href
 *
 * @api public
 */
Cherrytree.prototype.generate = function (name, params, query) {
  invariant(this.location, 'call .listen() before using .generate()')
  var matcher

  params = params || {}
  query = query || {}

  _.each(this.matchers, function (m) {
    if (m.name === name) {
      matcher = m
    }
  })

  if (!matcher) {
    throw new Error('No route is named ' + name)
  }

  // this might be a dangerous feature, although it's useful in practise
  // if some params are not passed into the generate call, they're populated
  // based on the current state or on the currently active transition.
  // Consider removing this.. since the users can opt into this behaviour, by
  // reaching out to the router.state if that's what they want.
  var currentParams = _.clone(this.state.params || {})
  if (this.state.activeTransition) {
    currentParams = _.clone(this.state.activeTransition.params || {})
  }
  params = _.extend(currentParams, params)

  var url = Path.withQuery(Path.injectParams(matcher.path, params), query)
  return this.location.formatURL(url)
}

/**
 * Stop listening to URL changes
 * @api public
 */
Cherrytree.prototype.destroy = function () {
  if (this.location && this.location.destroy && this.location.destroy) {
    this.location.destroy()
  }
}

/**
  Resets the state of the router by clearing the current route
  handlers and deactivating them.

  @api public
 */
Cherrytree.prototype.reset = function () {}

/**
 * Match the path against the routes
 * @param  {String} path
 * @return {Object} the list of matching routes and params
 *
 * @api private
 */
Cherrytree.prototype.match = function (path) {
  path = (path || '').replace(/\/$/, '') || '/'
  var found = false
  var params
  var query
  var routes = []
  var pathWithoutQuery = Path.withoutQuery(path)
  _.each(this.matchers, function (matcher) {
    if (!found) {
      params = Path.extractParams(matcher.path, pathWithoutQuery)
      if (params) {
        found = true
        routes = matcher.routes
        query = Path.extractQuery(path) || {}
      }
    }
  })
  return {
    routes: _.map(routes, descriptor),
    params: params || {},
    query: query || {}
  }

  // clone the data (only a shallow clone of options)
  // to make sure the internal route store is not mutated
  // by the middleware. The middleware can mutate data
  // before it gets passed into the next middleware, but
  // only within the same transition. New transitions
  // will get to use pristine data.
  function descriptor (route) {
    return {
      name: route.name,
      path: route.path,
      paramNames: Path.extractParamNames(route.path),
      options: _.clone(route.options),
      ancestors: _.clone(route.ancestors)
    }
  }
}

Cherrytree.prototype.dispatch = function (path) {
  if (this.state.activeTransition) {
    var err = new Error('TransitionRedirected')
    err.type = 'TransitionRedirected'

    this.state.activeTransition.cancel(err)
  }

  var id = this.nextId++
  var startTime = Date.now()
  this.log('---')
  this.log('Transition #' + id, 'to', path)

  var router = this
  var match = this.match(path)
  var routes = match.routes
  var params = match.params
  var query = match.query

  this.log('Transition #' + id, 'routes:', _.pluck(routes, 'name'))
  this.log('Transition #' + id, 'params:', params)
  this.log('Transition #' + id, 'query:', query)

  // create the transition promise
  var resolve, reject
  var promise = new Promise(function (res, rej) {
    resolve = res
    reject = rej
  })

  // 1. make transition errors loud
  // 2. by adding this handler we make sure
  //    we don't trigger the default 'Potentially
  //    unhandled rejection' for cancellations
  promise.then(function () {
    router.log('Transition #' + id, 'completed in', (Date.now() - startTime) + 'ms')
  }).catch(function (err) {
    if (err.type !== 'TransitionRedirected' && err.type !== 'TransitionCancelled') {
      router.log('Transition #' + id, 'FAILED')
      router.logError(err)
    }
  })

  var cancelled = false

  var transition = this.state.activeTransition = {
    id: id,
    prev: {
      routes: router.state.routes || [],
      path: router.state.path || '',
      pathname: router.state.pathname || '',
      params: router.state.params || {},
      query: router.state.query || {}
    },
    routes: routes,
    path: path,
    pathname: Path.withoutQuery(path),
    params: params,
    query: query,
    cancel: function (err) {
      router.state.activeTransition = null
      if (!err) {
        err = new Error('TransitionCancelled')
        err.type = 'TransitionCancelled'
      }
      cancelled = err

      if (err.type === 'TransitionCancelled') {
        router.log('Transition #' + id, 'cancelled')
      }
      if (err.type === 'TransitionRedirected') {
        router.log('Transition #' + id, 'redirected')
      }

      reject(err)
      transition.isCancelled = true
    },
    redirectTo: function () {
      return router.transitionTo.apply(router, arguments)
    },
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise)
  }

  // here we handle calls to all of the middlewares
  function callNext (i, prevResult) {
    var middlewareName
    // if transition has been cancelled - nothing left to do
    if (cancelled) {
      return
    }
    // done
    if (i < router.middleware.length) {
      middlewareName = router.middleware[i].name || 'anonymous'
      router.log('Transition #' + id, 'resolving middleware:', middlewareName)
      let middlewarePromise
      try {
        middlewarePromise = router.middleware[i](transition, prevResult)
        invariant(transition !== middlewarePromise, 'Middleware %s returned a transition which resulted in a deadlock', middlewareName)
      } catch (err) {
        return reject(err)
      }
      Promise.resolve(middlewarePromise)
        .then(function (result) {
          callNext(i + 1, result)
        })
        .catch(function (err) {
          router.log('Transition #' + id, 'resolving middleware:', middlewareName, 'FAILED')
          reject(err)
        })
    } else {
      router.state = {
        activeTransition: null,
        routes: transition.routes,
        path: path,
        pathname: Path.withoutQuery(path),
        params: params,
        query: query
      }
      resolve()
    }
  }
  Promise.resolve().then(() => callNext(0))

  return transition
}

/**
 * Create the default location.
 * This is used when no custom location is passed to
 * the listen call.
 * @return {Object} location
 *
 * @api private
 */
Cherrytree.prototype.createDefaultLocation = function () {
  var locationOptions = _.pick(this.options, ['pushState', 'root', 'interceptLinks'])
  return new HistoryLocation(locationOptions)
}

module.exports = function cherrytree (options) {
  return new Cherrytree(options)
}
