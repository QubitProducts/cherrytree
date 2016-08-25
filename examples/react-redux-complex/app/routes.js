let asyncRoute = (fn) => () => new Promise(fn)

let Application = require('./views/application')
let Home = require('./views/home')
let Messages = asyncRoute(resolve => require(['./views/messages'], delay(resolve)))
let Profile = require('./views/profile')
let ProfileIndex = require('./views/profile_index')


module.exports = function routes (route) {
  // We can pass arbitrary options in the second argument of the route
  // function call. Because in this case we're using React, let's attach
  // the relevant components to each route.
  // Path is the only special option that is used to construct and
  // match URLs as well as extract URL parameters.
  route('application', {path: '/', component: Application, abstract: true}, function () {
    route('home', {path: '', component: Home})
    route('messages', {async: Messages})
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user', component: Profile, abstract: true}, function () {
      route('profile.index', {component: ProfileIndex, path: ''})
      route('profile.lists')
      route('profile.edit')
    })
  })
}

function delay (resolve) {
  return function (component) {
    setTimeout(function () {
      resolve(component)
    }, 3000)
  }
}