let neon = require('neon-router')
let Application = require('./Application')

let routes = [
  { name: 'application', path: '/', component: Application }
]

let middleware = [
  // common case
  transition => { /* do stuff */ },

  // arrows
  ({
    next: (transition, redirect, cancel, router) => { /* main hook */ },
    done: (transition, router) => { /* check transition.state = 'completed' | 'redirected' | 'cancelled' */ },
    error: (err, transition, router) => { if (err) throw err /* when transition fails */ }
  }),

  // no arrows
  (function showLoadingAnimation (router) {
    let loading = true
    return {
      next: function (transition, redirect, cancel) {
        return !loading && console.log('Loading...')
      },
      done: function (transition) {
        if (transition.state === 'completed') {
          console.log('Loaded:', transition.path)
          loading = false
        }
      }
    }
  }())
]

let router = neon({ routes }, middleware)

router.start()
router.stop()
router.start()

router.transitionTo({ route: '/foo' }).then(() => {})
router.transitionTo({ route: '/bar', replace: true }).then(() => {})
