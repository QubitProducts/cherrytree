let asyncRoute = (fn) => () => new Promise(fn)

let Application = require('./views/application')
let Home = require('./views/home')
let Messages = asyncRoute(resolve => require(['./views/messages'], delay(resolve)))
let Profile = require('./views/profile')
let ProfileIndex = require('./views/profile_index')

let route = (options, children) => Object.assign({ children }, options)
module.exports = [
  route({ name: 'application', path: '/', component: Application, abstract: true }, [
    route({ name: 'home', path: '', component: Home }),
    route({ name: 'messages', async: Messages }),
    route({ name: 'status', path: ':user/status/:id' }),
    route({ name: 'profile', path: ':user', component: Profile, abstract: true }, [
      route({ name: 'profile.index', component: ProfileIndex, path: '' }),
      route({ name: 'profile.lists' }),
      route({ name: 'profile.edit' })
    ])
  ])
]

// module.exports = function routes () {
//   // We can pass arbitrary options in the second argument of the route
//   // function call. Because in this case we're using React, let's attach
//   // the relevant components to each route.
//   // Path is the only special option that is used to construct and
//   // match URLs as well as extract URL parameters.
//   route('application', {path: '/', component: Application, abstract: true}, function () {
//     route('home', {path: '', component: Home})
//     route('messages', {async: Messages})
//     route('status', {path: ':user/status/:id'})
//     route('profile', {path: ':user', component: Profile, abstract: true}, function () {
//       route('profile.index', {component: ProfileIndex, path: ''})
//       route('profile.lists')
//       route('profile.edit')
//     })
//   })
// }

// /* eslint-disable object-property-newline */
// module.exports = [
//   { name: 'application', path: '/', component: Application, abstract: true, children: [
//     { name: 'home', path: '', component: Home },
//     { name: 'messages', async: Messages },
//     { name: 'status', path: ':user/status/:id' },
//     { name: 'profile', path: ':user', component: Profile, abstract: true, children: [
//       { name: 'profile.index', path: '', component: ProfileIndex },
//       { name: 'profile.lists' },
//       { name: 'profile.edit' }
//     ]}
//   ]}
// ]

function delay (resolve) {
  return function (component) {
    setTimeout(function () {
      resolve(component)
    }, 500)
  }
}
