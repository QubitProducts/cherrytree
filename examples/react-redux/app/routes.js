let components = require('./components')

let Application = components.Application
let Home = components.Home
let Messages = components.Messages
let Profile = components.Profile
let ProfileIndex = components.ProfileIndex

module.exports = function routes (route) {
  // We can pass arbitrary options in the second argument of the route
  // function call. Because in this case we're using React, let's attach
  // the relevant components to each route.
  // Path is the only special option that is used to construct and
  // match URLs as well as extract URL parameters.
  route('application', {path: '/', component: Application, abstract: true}, function () {
    route('home', {path: '', component: Home})
    route('messages', {component: Messages})
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user', component: Profile, abstract: true}, function () {
      route('profile.index', {component: ProfileIndex, path: ''})
      route('profile.lists')
      route('profile.edit')
    })
  })
}
