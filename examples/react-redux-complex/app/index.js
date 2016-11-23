/**
  The idea here is to only every do this:

               +---> router
               |      +
               |      |
               |      v
    transition |     store  <----+
               |      +          |
               |      |          | dispatch
               |      v          |
               +---+ views  +----+

  1. Router has no state.
  2. Router only ever updates the store.
  3. The store causes views to rerender.
  4. To update store in a way that does not impact URL - dispatch.
  5. To update url - transition, which restarts this unidirectional loop.
 */

let React = require('react')
let ReactDOM = require('react-dom')
let Redux = require('redux')
let Provider = require('react-redux').Provider
let createRouter = require('cherrytree').default
let { Router, routerReducer, dispatchTransition } = require('./neon-react-redux')
let routes = require('./routes')

// create a store
let reducers = Redux.combineReducers({ router: routerReducer })
let store = Redux.createStore(reducers, window.devToolsExtension && window.devToolsExtension())

// we'll be fetching some routes asynchronously
let fetchAsyncRoutes = transition => Promise.all(transition.routes.map(route => {
  router.components = router.components || {}
  if (route.component) {
    router.components[route.name] = route.component
  }
  if (route.async) {
    return route.async().then(component => {
      router.components[route.name] = component
    })
  }
}))

// let cancelMessages = (transition, redirect, cancel) => {
//   if (transition.path === '/messages') {
//     cancel()
//   }
// }

let redirectMessages = (transition, redirect, cancel) => {
  if (transition.path === '/messages') {
    redirect({ route: '/messages?abc=123' })
  }
}

let errorsToWarnings = {
  name: 'warnErrors',
  error: err => {
    console.warn('ERRORED', err)
    // throw err
  }
}

let fail = transition => {
  if (transition.query.abc === '123') {
    throw new Error('Access Denied!')
  }
}

// // create a router
let middleware = [ errorsToWarnings, redirectMessages, fetchAsyncRoutes, fail, dispatchTransition(store) ]
let router = createRouter({ routes, log: true, pushState: false }, middleware)

router.start()

// render the app
let rootEl = document.querySelector('#app')
ReactDOM.render(
  <Provider store={store}>
    <Router router={router} />
  </Provider>,
  rootEl
)

window.router = router
