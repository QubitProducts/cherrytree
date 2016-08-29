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
let { App } = require('./cherry-react')
let { routerReducer, dispatchTransition } = require('./cherry-redux')

let routes = require('./routes')

// create a store
let reducers = Redux.combineReducers({ router: routerReducer })
let store = Redux.createStore(reducers, window.devToolsExtension && window.devToolsExtension())

// create a router
let router = cherrytree(routes, { log: true }, dispatchTransition(store))

// render the app
let rootEl = document.querySelector('#app')
ReactDOM.render(
  <Provider store={store}>
    <Shelly router={router} />
    <App router={router} />
  </Provider>,
  rootEl
)
