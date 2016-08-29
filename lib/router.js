import { pick, clone, extend, isEqual, isString, isObject, isArray, find } from './dash'
import dsl from './dsl'
import Path from './path'
import invariant from './invariant'
import BrowserLocation from './locations/browser'
import MemoryLocation from './locations/memory'
import transition from './transition'
import { intercept } from './links'
import createLogger from './logger'
import qs from './qs'

function Cherrytree () {
  this.initialize.apply(this, arguments)
}

/**
 * The actual constructor
 * @param {Object} options
 */
Cherrytree.prototype.initialize = function (routes, middleware, options) {
  this.state = {}
  this.state.nextId = 1
  this.middleware = []
  this.options = extend({
    location: 'browser',
    interceptLinks: true,
    pushState: true,
    Promise: Promise,
    qs: qs
  }, options)
  this.log = createLogger(this.options.log)

  this.api = {
    push: this.push.bind(this),
    replace: this.replace.bind(this),
    href: this.href.bind(this),
    isActive: this.isActive.bind(this),
    getRouteOptions: this.getRouteOptions.bind(this),
    location: this.location,
    start: this.start.bind(this),
    stop: this.stop.bind(this),
  }

  invariant(typeof this.options.Promise === 'function',
    'Cherrytree requires an ES6 Promise implementation, ' +
    'either as an explicit option or a global Promise')

  this.map(routes)
  if (middleware) {
    middleware = isArray(middleware) ? middleware : [middleware]
    middleware.map(m => this.use(m))
  }
}

/**
 * Add a middleware
 * @param  {Function} middleware
 * @return {Object}   router
 * @api public
 */
Cherrytree.prototype.use = function (createMiddleware) {
  let middleware = createMiddleware(this.api)
  if (typeof middleware === 'function') {
    middleware = { next: middleware }
  }
  if (!middleware.name) {
    middleware.name = createMiddleware.name
  }
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
  let routeOptions = this.routeOptions = {}

  // create the route tree
  // this.routes = dsl(routes)
  this.routes = routes

  // normalize the route objects
  eachRoute({ children: routes }, function (route) {
    invariant(route.name, 'Route name is required')
    if (typeof route.path !== 'string') route.path = route.name
    route.descriptor = clone(route)
    delete route.descriptor.children
  })

  // create the matcher list, which is like a flattened
  // list of routes = a list of all branches of the route tree
  let matchers = this.matchers = []
  // keep track of whether duplicate paths have been created,
  // in which case we'll warn the dev
  let dupes = {}

  eachBranch({children: this.routes}, [], function (routes) {
    // concatenate the paths of the list of routes
    let path = routes.reduce(function (memo, r) {
      routeOptions[r.name] = clone(r)
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
      path: path
    })

    // dupe detection
    let lastRoute = routes[routes.length - 1]
    if (dupes[path]) {
      throw new Error('Routes ' + dupes[path] + ' and ' + lastRoute.name +
      ' have the same url path \'' + path + '\'')
    }
    dupes[path] = lastRoute.name
  })

  function eachBranch (root, memo, fn) {
    root.children.forEach(function (route) {
      if (!abstract(route)) {
        fn(memo.concat(route))
      }
      if (route.children) {
        eachBranch(route, memo.concat(route), fn)
      }
    })
  }

  function eachRoute (root, fn) {
    root.children.forEach(function (route) {
      fn(route)
      if (route.children) {
        eachRoute(route, fn)
      }
    })
  }

  function abstract (route) {
    return route && route.abstract
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
Cherrytree.prototype.start = function () {
  let location = this.location = this.createLocation()
  // setup the location onChange handler
  location.onChange((url) => this.dispatch(url))
  // start intercepting links
  if (this.options.interceptLinks && location.usesPushState()) {
    this.interceptLinks()
  }
  // and also kick off the initial transition
  return this.dispatch(location.getURL())
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
Cherrytree.prototype.push = function (...args) {
  if (this.state.currTransition) {
    return this.replace.apply(this, args)
  }
  let lastArg = args[args.length - 1]
  if (isObject(lastArg) && lastArg.replace) {
    return this.replace.apply(this, args)
  }
  return this.doTransition('push', args)
}

/**
 * Like push, but doesn't leave an entry in the browser's history,
 * so clicking back will skip this route
 * @param  {String} url     url or route name followed by params and query
 * @param  {Object} params  Optional
 * @param  {Object} query   Optional
 * @return {Object}         transition
 *
 * @api public
 */
Cherrytree.prototype.replace = function (...args) {
  return this.doTransition('replace', args)
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
Cherrytree.prototype.href = function (name, params, query) {
  invariant(this.location, 'call .listen() before using .href()')
  let matcher

  params = params || {}
  query = query || {}

  this.matchers.forEach(function (m) {
    if (m.name === name) {
      matcher = m
    }
  })

  if (!matcher) {
    throw new Error('No route is named ' + name)
  }

  let url = Path.withQuery(this.options.qs, Path.injectParams(matcher.path, params), query)
  return this.location.formatURL(url)
}

/**
 * Stop listening to URL changes
 * @api public
 */
Cherrytree.prototype.stop = function () {
  if (this.location && this.location.destroy && this.location.destroy) {
    this.location.destroy()
  }
  if (this.disposeIntercept) {
    this.disposeIntercept()
  }
  if (this.state.currTransition) {
    this.state.currTransition.cancel()
    delete this.state.currTransition
  }
  return this.options.Promise.resolve()
}

/**
 * Check if the given route/params/query combo is active
 * @param  {String} name   target route name
 * @param  {Object} params
 * @param  {Object} query
 * @return {Boolean}
 *
 * @api public
 */
Cherrytree.prototype.isActive = function (state, name, params, query) {
  params = params || {}
  query = query || {}

  let activeRoutes = state.routes || []
  let activeParams = state.params || {}
  let activeQuery = state.query || []

  let isNameActive = !!find(activeRoutes, route => route.name === name)
  let areParamsActive = !!Object.keys(params).every(key => activeParams[key] === params[key])
  let isQueryActive = !!Object.keys(query).every(key => activeQuery[key] === query[key])

  return isNameActive && areParamsActive && isQueryActive
}

/**
 * @api private
 */
Cherrytree.prototype.doTransition = function (method, params) {
  let previousUrl = this.location.getURL()

  let url = params[0]
  if (url[0] !== '/') {
    url = this.href.apply(this, params)
    url = url.replace(/^#/, '/')
  }

  if (this.options.pushState) {
    url = this.location.removeRoot(url)
  }

  let transition = this.dispatch(url)

  this.location[method](url, {trigger: false})

  return transition
}

/**
 * Match the path against the routes
 * @param  {String} path
 * @return {Object} the list of matching routes and params
 *
 * @api private
 */
Cherrytree.prototype.match = function (path) {
  path = (path || '').replace(/\/$/, '') || '/'
  let found = false
  let params
  let routes = []
  let pathWithoutQuery = Path.withoutQuery(path)
  let qs = this.options.qs
  this.matchers.forEach(function (matcher) {
    if (!found) {
      params = Path.extractParams(matcher.path, pathWithoutQuery)
      if (params) {
        found = true
        routes = matcher.routes
      }
    }
  })
  return {
    routes: routes.map(route => route.descriptor),
    params: params || {},
    query: Path.extractQuery(qs, path) || {}
  }
}

Cherrytree.prototype.dispatch = function (path) {
  let router = this
  let match = this.match(path)
  let query = match.query
  let pathname = Path.withoutQuery(path)

  let currTransition = this.state.currTransition

  // if we already have an active transition with all the same
  // params - return that and don't do anything else
  if (currTransition &&
      currTransition.descriptor.pathname === pathname &&
      isEqual(currTransition.descriptor.query, query)) {
    return currTransition.completed
  }

  // otherwise, cancel the current transition
  // and queue up the next transition
  if (currTransition) {
    if (this.state.nextTransition) this.state.nextTransition.cancel('redirect')
    this.state.nextTransition = createTransition()
    currTransition.cancel('redirect')
    return this.state.nextTransition.completed
  }

  this.state.currTransition = createTransition()
  this.state.currTransition.run(onTransitionDone())

  function createTransition () {
    return transition({
      id: router.state.nextId++,
      path: path,
      match: match,
      router: router
    }, router.options.Promise)
  }

  function onTransitionDone () {
    return function done (err) {
      if (err) setTimeout(() => { throw err }, 1)

      let { lastTransition, currTransition, nextTransition } = router.state
      if (currTransition.descriptor.state === 'cancelled' && lastTransition) {
        let previousUrl = lastTransition.descriptor.path
        router.location.replace(previousUrl, {trigger: false})
      }
      router.state.lastTransition = currTransition
      router.state.currTransition = null
      if (nextTransition) {
        router.state.currTransition = nextTransition
        router.state.nextTransition = null
        nextTransition.run(onTransitionDone())
      }
    }
  }

  return this.state.currTransition.completed
}

/**
 * Create the default location.
 * This is used when no custom location is passed to
 * the listen call.
 * @return {Object} location
 *
 * @api private
 */
Cherrytree.prototype.createLocation = function (path) {
  let location = this.options.location
  if (!isString(location)) {
    return location
  }
  if (location === 'browser') {
    return new BrowserLocation(pick(this.options, ['pushState', 'root']))
  } else if (location === 'memory') {
    return new MemoryLocation({path})
  } else {
    throw new Error('Location can be `browser`, `memory` or a custom implementation')
  }
}

/**
 * When using pushState, it's important to setup link interception
 * because all link clicks should be handled via the router instead of
 * browser reloading the page
 */
Cherrytree.prototype.interceptLinks = function () {
  let clickHandler = typeof this.options.interceptLinks === 'function'
    ? this.options.interceptLinks
    : defaultClickHandler
  this.disposeIntercept = intercept((event, link) => clickHandler(event, link, this))

  function defaultClickHandler (event, link, router) {
    event.preventDefault()
    router.push(router.location.removeRoot(link.getAttribute('href')))
  }
}

Cherrytree.prototype.getRouteOptions = function (name) {
  return this.routeOptions[name]
}

export default function cherrytree (routes, middleware, options) {
  let router = new Cherrytree(routes, middleware, options)
  return router.api
}

cherrytree.BrowserLocation = BrowserLocation
cherrytree.MemoryLocation = MemoryLocation
