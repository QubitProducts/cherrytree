const routerReducer = (state = { current: {} }, action) => {
  switch (action.type) {
    case 'TRANSITION':
      let transition = action.payload
      return Object.assign({}, state, {
        prev: state.current,
        current: {
          routes: transition.routes,
          params: transition.params,
          query: transition.query
        }
      })
    default:
      return state
  }
}

const dispatchTransition = (store) => (transition) =>
  store.dispatch({ type: 'TRANSITION', payload: transition })

module.exports.routerReducer = routerReducer
module.exports.dispatchTransition = dispatchTransition
