var _ = require('./dash')
var invariant = require('./invariant')
var Path = require('./path')

module.exports = function transition (options, Promise) {
  options = options || {}

  let router = options.router
  let log = router.log
  let logError = router.logError

  let path = options.path
  let match = options.match
  let routes = match.routes
  let params = match.params
  let query = match.query

  let id = options.id
  let startTime = Date.now()
  log('---')
  log('Transition #' + id, 'to', path)
  log('Transition #' + id, 'routes:', _.pluck(routes, 'name'))
  log('Transition #' + id, 'params:', params)
  log('Transition #' + id, 'query:', query)

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
    log('Transition #' + id, 'completed in', (Date.now() - startTime) + 'ms')
  }).catch(function (err) {
    if (err.type !== 'TransitionRedirected' && err.type !== 'TransitionCancelled') {
      log('Transition #' + id, 'FAILED')
      logError(err.stack)
    }
  })

  var cancelled = false

  var transition = {
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
    redirectTo: function () {
      return router.transitionTo.apply(router, arguments)
    },
    retry: function () {
      return router.transitionTo(path)
    },
    cancel: function (err) {
      if (router.state.activeTransition !== transition) {
        return
      }

      if (transition.isCancelled) {
        return
      }

      router.state.activeTransition = null
      transition.isCancelled = true
      cancelled = true

      if (!err) {
        err = new Error('TransitionCancelled')
        err.type = 'TransitionCancelled'
      }
      if (err.type === 'TransitionCancelled') {
        log('Transition #' + id, 'cancelled')
      }
      if (err.type === 'TransitionRedirected') {
        log('Transition #' + id, 'redirected')
      }

      reject(err)
    },
    followRedirects: function () {
      return promise['catch'](function (reason) {
        if (router.state.activeTransition) {
          return router.state.activeTransition.followRedirects()
        }
        return Promise.reject(reason)
      })
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
      log('Transition #' + id, 'resolving middleware:', middlewareName)
      let middlewarePromise
      try {
        middlewarePromise = router.middleware[i](transition, prevResult)
        invariant(transition !== middlewarePromise, 'Middleware %s returned a transition which resulted in a deadlock', middlewareName)
      } catch (err) {
        router.state.activeTransition = null
        return reject(err)
      }
      Promise.resolve(middlewarePromise)
        .then(function (result) {
          callNext(i + 1, result)
        })
        .catch(function (err) {
          log('Transition #' + id, 'resolving middleware:', middlewareName, 'FAILED')
          router.state.activeTransition = null
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

  if (!options.noop) {
    Promise.resolve().then(() => callNext(0))
  } else {
    resolve()
  }

  if (options.noop) {
    transition.noop = true
  }

  return transition
}
