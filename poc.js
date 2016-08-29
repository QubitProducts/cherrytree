let neon = require('neon-router')
let Application = require('./Application')

let routes = [
  { name: 'application', path: '/', component: Application }
]

let middleware = [
  // common case
  router => next => transition => { /* do stuff */ }

  // arrows
  router => ({
    next: (next, redirect, cancel) => (transition, context) => { /* main hook */ },
    done: next => (err, transition) => { /* check transition.state = 'completed' | 'redirected' | 'cancelled'*/ },
    error: next => transition, err => { /* when transition fails */ }
  }),

  // no arrows
  function showLoadingAnimation (router) {
    let loading = true
    return {
      next: function (next, redirect, cancel) {
        return function (transition) {
          return !loading && console.log('Loading...')
        }
      },
      done: function (next){
        return function (transition) {
          if (transition.state === 'completed') {
            console.log('Loaded:', transition.path)
            loading = false
          }
        }
      }
    }
  }
]

let router = neon({ routes, middleware })

router.start()
router.stop()
router.start()

router.transitionTo('/foo').then(() => {})
router.replaceWith('/bar').then(() => {})
