import { clone, defer } from './dash'
import Path from './path'

export default function createTransition (options, Promise) {
  let { id, path, match, router } = options
  let { log } = router
  let { lastTransition } = router.state
  let { routes, params, query } = match

  let done

  let deferred = defer()

  let transition = {
    descriptor: {
      id: id,
      routes: clone(routes),
      path: path,
      pathname: Path.withoutQuery(path),
      params: clone(params),
      query: clone(query),
      state: 'queued',
      prev: lastTransition && lastTransition.descriptor
    },

    // A promise to signal the completion of transition
    // this promise will resolve either when transition
    // completes with 'completed' or 'cancelled' state amd
    // in case of 'redirected' state will only complete
    // once redirect is fully resolved.
    // It will get rejected in case of transitioning completing
    // in 'failed' state.
    promise: deferred.promise,

    cancel: function (reason) {
      if (transition.descriptor.state === 'queued') {
        deferred.resolve()
      } else if (transition.descriptor.state === 'transitioning') {
        if (reason === 'redirect') {
          handleRedirect()
        } else {
          log('Transition #' + id, 'cancelled')
          handleCancel()
        }
      }
      return deferred.promise
    },

    redirect: function (options) {
      log('Transition #' + id, 'redirecting to', options)
      router.transitionTo(options)
    },

    run: function (doneCallback) {
      done = doneCallback
      transition.startTime = new Date().getTime()
      transition.descriptor.state = 'transitioning'
      setTimeout(() => {
        log('---')
        log('Transition #' + id, 'to', path)
        log('Transition #' + id, 'routes', routes.map(r => r.name))
        log('Transition #' + id, 'params', params)
        log('Transition #' + id, 'query', query)
        runNext()
      }, 1)
    }
  }

  function afterNext (err) {
    if (err) return handleError(err)
    if (transition.descriptor.state !== 'transitioning') return
    transition.descriptor.state = 'completed'
    setTimeout(runDone, 1)
  }

  function handleCancel () {
    if (transition.descriptor.state !== 'transitioning') return
    transition.descriptor.state = 'cancelled'
    setTimeout(runDone, 1)
  }

  function handleRedirect () {
    if (transition.descriptor.state !== 'transitioning') return
    transition.descriptor.state = 'redirected'
    setTimeout(runDone, 1)
  }

  function handleError (err) {
    transition.descriptor.state = 'failed'
    setTimeout(() => runError(err), 1)
  }

  function afterDone (err) {
    if (transition.descriptor.state === 'failed' && !err) transition.descriptor.state = 'completed'
    transition.duration = new Date().getTime() - transition.startTime
    log('Transition #' + id, 'DONE -', transition.descriptor.state, '- (' + transition.duration + 'ms)')
    done(err, transition)
    if (transition.descriptor.state === 'failed') {
      deferred.reject(err)
    } else if (transition.descriptor.state === 'redirected') {
      router.state.currTransition.promise
        .then(deferred.resolve)
        .catch(deferred.reject)
    } else {
      deferred.resolve()
    }
  }

  function runNext () {
    let middlewares = router.middleware
    reduce(middlewares, function (context, middleware, i, list, cb) {
      if (transition.descriptor.state !== 'transitioning') return false
      log('Transition #' + id, 'resolving middleware.next:', name(middleware, 'next'))
      transition.middlewareReached = i
      if (!middleware.next) return cb(null, context)
      let next = cb
      let redirect = transition.redirect
      let cancel = () => transition.cancel()
      hook(middleware, 'next', next)(transition.descriptor, redirect, cancel)
    }, undefined, afterNext)
  }

  function runDone () {
    let middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse()
    reduce(middlewares, function (context, middleware, i, list, cb) {
      log('Transition #' + id, 'resolving middleware.done:', name(middleware, 'done'))
      if (!middleware.done) return cb()
      let next = cb
      hook(middleware, 'done', next)(transition.descriptor)
    }, undefined, err => err ? handleError(err) : afterDone(err))
  }

  function runError (err) {
    let middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse()
    reduce(middlewares, function (context, middleware, i, list, cb) {
      log('Transition #' + id, 'resolving middleware.error:', name(middleware, 'error'))
      if (!context) return cb(null)
      if (!middleware.error) return cb(null, context)
      let next = err => cb(null, err)
      hook(middleware, 'error', next)(context, transition.descriptor)
    }, err, (internalErr, err) => afterDone(internalErr || err))
  }

  function reduce (list, fn, initial, cb) {
    if (list.length === 0) return cb(initial)

    callNext(initial, 0)

    function callNext (memo, i) {
      if (i === list.length) return cb(null, memo)
      let ret = fn(memo, list[i], i, list, function (err, nextMemo) {
        if (err) return cb(err)
        callNext(nextMemo, i + 1)
      })
      if (ret === false) cb(null, memo)
    }
  }

  function hook (middleware, hook, next) {
    return (...args) => {
      new Promise(resolve => resolve(middleware[hook](...args)))
        .then(() => next()).catch(next)
    }
  }

  function name (middleware, hook) {
    return (middleware.name || 'anonymous') + (middleware[hook] ? '' : ' (skipping)')
  }

  return transition
}
