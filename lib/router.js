import {
  pick,
  clone,
  extend,
  isEqual,
  isString,
  isArray,
  find,
  mapNested
} from './dash'
import qs from './qs'
import Path from './path'
import invariant from './invariant'
import transition from './transition'
import { intercept } from './links'
import createLogger from './logger'
import BrowserLocation from './locations/browser'
import MemoryLocation from './locations/memory'

let createRouter = options => new Cherrytree(options)
let route = (options, children) => extend({ children }, options)

export default createRouter
export { BrowserLocation, MemoryLocation, route }

class Cherrytree {

  constructor (options) {
    this.options = extend({
      location: 'browser',
      interceptLinks: true,
      pushState: true,
      Promise: Promise,
      qs: qs
    }, options)

    let { routes, middleware, log, location } = this.options

    invariant(typeof this.options.Promise === 'function',
      'ES6 Promise implementation is required as an explicit option or a global Promise')

    this.state = {
      nextId: 1,
      lastTransition: null,
      currTransition: null,
      nextTransition: null
    }

    if (routes) {
      this.map(routes)
    }

    this.middleware = []
    if (middleware) {
      middleware = isArray(middleware) ? middleware : [middleware]
      middleware.map(m => this.use(m))
    }

    this.log = createLogger(log)
    this.location = this.createLocation(location)
  }

  /**
   * Add a middleware
   * @param  {Function}  middleware
   * @return {Object}    router
   * @api public
   */
  use (createMiddleware) {
    let router = this
    let middleware = createMiddleware(router)
    if (!middleware.name) {
      middleware.name = createMiddleware.name || middleware.next.name
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
  map (routes) {
    // to keep track of unique names
    let names = {}
    // to keep track of unique paths
    let paths = {}

    this.routes = mapNested(routes, 'children', function (route) {
      let name = route.name
      invariant(name, 'Route name is required')
      invariant(name.indexOf('/') === -1, 'Route names can not contain /')
      invariant(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name)

      // remember which names have already been used
      names[name] = true

      // never mutate input data
      route = clone(route)

      // fill in optional paths
      if (typeof route.path !== 'string') route.path = route.name

      // create a descriptor object that we will be passing to
      // transitions middleware
      route.descriptor = clone(route)
      delete route.descriptor.children

      return route
    })

    // create the matcher list, which is like a flattened
    // list of routes = a list of all branches of the route tree
    let matchers = this.matchers = []
    // keep track of whether duplicate paths have been created,
    // in which case we'll warn the dev

    eachBranch({children: this.routes}, [], function (routes) {
      // concatenate the paths of the list of routes
      let path = routes.reduce(function (memo, r) {
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

      // duplicate path detection
      let lastRoute = routes[routes.length - 1]
      invariant(!paths[path], 'Routes "%s" and "%s" have the same path %s',
        paths[path], lastRoute.name, path)
      paths[path] = lastRoute.name
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
  start () {
    let { location } = this

    // start listening to location events
    location.start()
    // setup the location onChange handler
    location.onChange((url) => this.dispatch(url))
    // start intercepting links
    if (this.options.interceptLinks && location.usesPushState()) {
      this.interceptLinks()
    }
    // and also kick off the initial transition
    return this.dispatch(location.url())
  }

  /**
   * Stop listening to URL changes
   * @api public
   */
  stop () {
    let { location, state } = this

    location && location.destroy && location.destroy()
    this.disposeIntercept && this.disposeIntercept()

    if (state.currTransition) {
      state.currTransition.cancel()
      state.lastTransition = null
      state.currTransition = null
      state.nextTransition = null
    }

    return this.options.Promise.resolve()
  }

  /**
   * Transition to a different route.
   * Passe in url or a route name followed by params and query
   *
   * @param  {String}  options.route    route name, url or parametrised url
   * @param  {Object}  options.params   Optional
   * @param  {Object}  options.query    Optional
   * @param  {Boolean} options.replace  Optional
   * @return {Promise}        promise that resolves upon transition completing
   *
   * @api public
   */
  transitionTo (options) {
    let method = options.replace ? 'replace' : 'push'

    invariant(options && options.route, '"route" option must be used when calling "transitionTo"')

    if (this.state.currTransition) {
      method = 'replace'
    }

    return this.doTransition(method, options)
  }

  /**
   * Create an href
   *
   * @param  {String} options.route   route name, url or parametrised url
   * @param  {Object} options.params  optional
   * @param  {Object} options.query   optional
   * @return {String}        href
   *
   * @api public
   */
  href ({ route, params = {}, query = {} }) {
    let path

    invariant(route, '"route" option must be used when calling "href"')

    if (route.indexOf('/') > -1) {
      path = route
    } else {
      let matcher = find(this.matchers, m => m.name === route)
      invariant(matcher, 'No route is named %s', route)
      path = matcher.path
    }

    let url = Path.withQuery(this.options.qs, Path.injectParams(path, params), query)
    return this.location.format(url)
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
  isActive (state, name, params, query) {
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
  doTransition (method, options) {
    let url = this.href(options)
    url = url.replace(/^#/, '/')

    if (this.options.pushState) {
      url = this.location.removeRoot(url)
    }

    let completed = this.dispatch(url)

    this.location[method](url, { trigger: false })

    return completed
  }

  /**
   * Match the path against the routes
   * @param  {String} path
   * @return {Object} the list of matching routes and params
   *
   * @api private
   */
  match (path) {
    path = (path || '').replace(/\/$/, '') || '/'

    let qs = this.options.qs
    let pathWithoutQuery = Path.withoutQuery(path)
    let matcher = find(this.matchers, matcher => Path.extractParams(matcher.path, pathWithoutQuery)) || {}
    let routes = matcher.routes || []

    return {
      routes: routes.map(route => route.descriptor),
      params: (matcher.path && Path.extractParams(matcher.path, pathWithoutQuery)) || {},
      query: Path.extractQuery(qs, path) || {}
    }
  }

  /**
   * @api private
   */
  dispatch (path) {
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
      return function done () {
        // if (err) setTimeout(() => { throw err }, 1)

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
   * This is used when no custom location is passed in options
   *
   * @return {Object} location
   *
   * @api private
   */
  createLocation (location) {
    if (!isString(location)) {
      return location
    } else if (location === 'browser') {
      return new BrowserLocation(pick(this.options, ['pushState', 'root']))
    } else if (location === 'memory') {
      return new MemoryLocation()
    } else {
      throw new Error('Location can be `browser`, `memory` or a custom implementation')
    }
  }

  /**
   * When using pushState, it's important to setup link interception
   * because all link clicks should be handled via the router instead of
   * browser reloading the page
   *
   * @api private
   */
  interceptLinks () {
    let { interceptLinks } = this.options

    let clickHandler = typeof interceptLinks === 'function' ? interceptLinks : defaultClickHandler
    this.disposeIntercept = intercept((event, link) => clickHandler(event, link, this))

    function defaultClickHandler (event, link, router) {
      event.preventDefault()
      router.transitionTo({ route: router.location.removeRoot(link.getAttribute('href')) })
    }
  }
}
