let cherrytree = require('cherrytree')
let React = require('react')
let components = require('./components')

let Application = components.Application
let Home = components.Home
let Messages = components.Messages
let Profile = components.Profile
let ProfileIndex = components.ProfileIndex

let router = cherrytree({log: true})

// This is how we define the route map or app structure.
// The nesting here means that all routes in that branch
// of the route tree will get "resolved" and can load data or
// render things on the screen. For example going to 'profile.edit'
// route would load ['application', 'profile', 'profile.edit'] routes
router.map(function (route) {
  // We can pass arbitrary options in the second argument of the route
  // function call. Because in this case we're using React, let's attach
  // the relevant components to each route.
  // Path is the only special option that is used to construct and
  // match URLs as well as extract URL parameters.
  route('application', {path: '/', component: Application}, function () {
    route('home', {path: '', component: Home})
    route('messages', {component: Messages})
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user', component: Profile}, function () {
      route('profile.index', {component: ProfileIndex})
      route('profile.lists')
      route('profile.edit')
    })
  })
})

// Middleware are used to action the transitions.
// For example, here, we grab the React component that
// is backing each route and render them in a nested manner.
router.use(function render (transition) {
  let { routes, params, query } = transition
  let el = routes.reduceRight(function (element, route) {
    let Component = route.options.component
    if (Component) {
      return React.createElement(Component, {
        link: function () {
          return router.generate.apply(router, arguments)
        },
        params: params,
        query: query,
        children: element
      })
    } else {
      return element
    }
  }, null)
  React.render(el, document.querySelector('#app'))
})

// Finally, now that everything is set up
// start listening to URL changes and transition the
// app to the route that matches the current browser URL
router.listen().then(function () {
  console.log('App started.')
  console.log('Try transitioning programmatically with `router.transitionTo("messages")`.')
  window.router = router
})
