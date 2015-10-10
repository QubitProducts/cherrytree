import _ from 'lodash'
import when from 'when'
import keys from 'when/keys'
import React from 'react'
import cherrytree from 'cherrytree'
import loader from './loader'

let router = window.router = cherrytree({
  log: true
})

router.map(function (route) {
  route('application', {path: '/', abstract: true}, function () {
    route('index', {path: ''})
    route('organisation', {path: ':org'})
    route('repo', {path: ':org/:repo'}, function () {
      route('repo.code', {path: 'code/:path*'})
      route('repo.commits')
    })
  })
})

// install a global loading animation
router.use(loader)

// load route handlers
router.use((transition) => {
  transition.routes.forEach(
    (route) => route.RouteHandler = route.RouteHandler || getRouteHandler(route, transition.routes)
  )
})

// load data (or context) for each route
router.use((transition) => {
  return when.all(transition.routes.map((route) => {
    if (route.RouteHandler.fetchData) {
      return keys.all(route.RouteHandler.fetchData(transition.params, transition))
    }
  }))
})

// render
router.use((transition, contexts) => {
  // use React context feature to pass in router into every
  // React component in this app, so that they could use it to
  // generate links and initiate transitions.
  // (Not to be confused with the context data for each route
  // that we loaded using fetchData and pass into each RouteHandler
  // as props)
  React.withContext({router: router}, () => {
    let childRouteHandler
    // start rendering with the child most route first
    // working our way up to the parent
    let i = transition.routes.length - 1
    _.clone(transition.routes).reverse().forEach((route) => {
      let RouteHandler = route.RouteHandler
      let context = contexts[i--]
      childRouteHandler = <RouteHandler {...context}>{childRouteHandler}</RouteHandler>
    })
    // when we finish the loop above, childRouteHandler
    // contains the top most route, which is the application
    // route. Let's render that into the page
    var app = childRouteHandler
    React.render(app, document.body)
  })
})

// kick off the routing
router.listen()

// This is a webpack specific way of automatically
// loading the route file for each route. We construct the path
// to the filename based on route.ancestors and route.name.
// e.g. for route 'repo.commits' which has the following route hierarchy
// ['application', 'repo', 'repo.commits'], we construct a filename
// ./screens/application/screens/repo/screens/commits/index
//
// Alternatively we could just require each file one by one manually and key by the
// route name in an object, e.g.
// { 'repo.commits': require('./screens/application/screens/repo/screens/commits/index')}
//
// We could also load the routes asynchronously here if we wanted to split the app
// into multiple bundles based on routes.
function getRouteHandler (route, routes) {
  let ancestors = []
  routes.find(function (r) {
    if (r.name === route.name) {
      return true
    }
    ancestors.push(r.name)
  })
  let path = ancestors.concat(route.name)
  let normalizedPath = path.map((a) => a.includes('.') ? a.split('.')[1] : a)
  var req = require.context('./', true, /^\.(\/screens\/[^\/]*)+\/index$/)
  return req('./screens/' + normalizedPath.join('/screens/') + '/index')
}
