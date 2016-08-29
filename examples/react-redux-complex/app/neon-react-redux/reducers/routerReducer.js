const routerReducer = (state = {}, action) => {
  switch (action.type) {
    case '@@neon-router/TRANSITION':
      let transition = action.payload
      return transition
    default:
      return state
  }
}

module.exports = routerReducer
