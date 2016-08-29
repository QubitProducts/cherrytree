import { clone } from './dash'
import invariant from './invariant'
import Path from './path'

export default function transition (options, Promise) {
  options = options || {}

  let router = options.router
  let log = router.log

  let path = options.path
  let match = options.match
  let routes = match.routes
  let params = match.params
  let query = match.query

  let done

  let id = options.id

  let resolveCompleted, rejectCompleted
  let completed = new Promise((resolve, reject) => {
    resolveCompleted = resolve
    rejectCompleted = reject
  }).catch(err => { throw err })

  let transition = {
    descriptor: {
      id: id,
      routes: clone(routes),
      path: path,
      pathname: Path.withoutQuery(path),
      params: clone(params),
      query: clone(query),
      state: 'queued'
    },

    // A promise to signal the completion of transition
    // this promise will resolve either when transition
    // completes with 'completed' or 'cancelled' state amd
    // in case of 'redirected' state will only complete
    // once redirect is fully resolved.
    // It will get rejected in case of transitioning completing
    // in 'failed' state.
    completed: completed,

    cancel: function (reason) {
      if (transition.descriptor.state === 'queued') {
        return resolveCompleted()
      }
      if (transition.descriptor.state === 'transitioning') {
        if (reason === 'redirect') {
          return handleRedirect()
        } else {
          return handleCancel()
        }
      }
    },

    run: function (doneCallback) {
      done = doneCallback
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
    if (transition.descriptor.state !== 'transitioning') return
    transition.descriptor.state = 'failed'
    setTimeout(() => runError(err), 1)
  }

  function afterDone (err) {
    log('Transition #' + id, 'DONE:', transition.descriptor.state)
    done(err, transition)
    if (transition.descriptor.state === 'failed') {
      rejectCompleted(err)
    } else if (transition.descriptor.state === 'redirected') {
      router.state.currTransition.completed
        .then(resolveCompleted)
        .catch(rejectCompleted)
    } else {
      resolveCompleted()
    }
  }

  function runNext () {
    let middlewares = router.middleware
    reduce(middlewares, function (context, middleware, i, list, cb) {
      if (transition.descriptor.state !== 'transitioning') return false
      log('Transition #' + id, 'resolving middleware.next:', name(middleware, 'next'))
      transition.middlewareReached = i
      if (!middleware.next) return cb(null, context)
      let next = (err, nextContext) => cb(err, nextContext)
      let redirect = (...args) => {
        log('Transition #' + id, 'redirecting to', ...args)
        router.push(...args)
      }
      let cancel = handleCancel
      middleware.next(next, redirect, cancel)(context)
    }, transition.descriptor, afterNext)
  }

  function runDone () {
    let middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse()
    reduce(middlewares, function (context, middleware, i, list, cb) {
      log('Transition #' + id, 'resolving middleware.done:', name(middleware, 'done'))
      if (!middleware.done) return cb()
      let next = (err) => cb(err)
      middleware.done(next)(transition.descriptor)
    }, undefined, afterDone)
  }

  function runError (err) {
    let middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse()
    reduce(middlewares, function (context, middleware, i, list, cb) {
      log('Transition #' + id, 'resolving middleware.error:', name(middleware, 'error'))
      if (!context) return cb(null)
      if (!middleware.error) return cb(null, context)
      let next = err => cb(null, err)
      middleware.error(next)(context)
    }, err, (internalErr, err) => afterDone(internalErr || err))
  }

  function reduce (list, fn, initial, cb) {
    if (list.length === 0) return initial

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

  function name (middleware, hook) {
    return (middleware.name || 'anonymous') + (middleware[hook] ? '' : ' (skipping)')
  }

  return transition
}
