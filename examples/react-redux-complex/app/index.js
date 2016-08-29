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
let cherrytree = require('cherrytree')
let { Application, Router, routerReducer, dispatchTransition } = require('./neon-react-redux')
let routes = require('./routes')

// create a store
let reducers = Redux.combineReducers({ router: routerReducer })
let store = Redux.createStore(reducers, window.devToolsExtension && window.devToolsExtension())

// we'll be fetching some routes asynchronously
let fetchAsyncRoutes = router => ({
  next: transition => {
    return Promise.all(transition.routes.map(route => {
      let routeOptions = router.getRouteOptions(route.name)
      return routeOptions.async && routeOptions.async().then(component =>
        routeOptions.component = component
      )
    })
  },
  done: transition => {}
})

let cancelMessages = router => (transition, redirect, cancel) => {
  if (transition.path === '/messages') {
    console.log('CANCELLING')
    cancel()
  } else {
    next(null, transition)
  }
}

let redirectMessages = router => (transition, redirect, cancel) => {
  if (transition.path === '/messages') {
    redirect('/messages?abc=123')
  }
}

let errorsToWarnings = router => ({
  error: next => err => {
    console.warn('ERRORED', err.stack)
    throw err
  }
})

let fail = router => transition => {
  if (transition.path.indexOf('123') > -1) {
    throw new Error('Access Denied!')
  }
}

// create a router
let middleware = [ errorsToWarnings, redirectMessages, fetchAsyncRoutes, fail, dispatchTransition(store) ]
let router = cherrytree(routes, middleware, { log: true, pushState: false })

router.start()

// render the app
let rootEl = document.querySelector('#app')
ReactDOM.render(
  <Router router={router}>
    <Provider store={store}>
      <Application />
    </Provider>
  </Router>,
  rootEl
)

window.router = router
