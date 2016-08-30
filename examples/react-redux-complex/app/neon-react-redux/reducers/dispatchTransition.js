const dispatchTransition = store => router => ({
  name: 'dispatchTransition',
  next: transition => {
    store.dispatch({
      type: '@@neon-router/TRANSITION',
      payload: {
        routes: transition.routes.map(r => ({
          name: r.name,
          path: r.path,
          params: r.params
        })),
        params: transition.params,
        query: transition.query
      }
    })
  }
})

module.exports = dispatchTransition
