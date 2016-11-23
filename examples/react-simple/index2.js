// const cherrytree = require('../..').default
// const React = require('react')
// const ReactDOM = require('react-dom')
// const createElement = React.createElement

// const root = document.createElement('div')
// document.body.appendChild(root)

// const routes = [{
//   name: 'app',
//   path: '/',
//   component: props => <div>{props.children ? props.children : 'Hello'}</div>,
//   children: [{
//     name: 'issues',
//     component: () => <div>This is issues</div>
//   }, {
//     name: 'pulls',
//     component: () => <div>This is pulls</div>
//   }, {
//     name: 'pull',
//     path: 'pulls/:pullId',
//     component: (props) => <div>This is pull #{props.pullId}</div>
//   }]
// }]

// const render = {
//   next: function render (transition) {
//     // transition.then(() => {})

//     let matchedRoutes = transition.routes
//     console.log(transition)
//     let App = matchedRoutes.reduceRight((children, route) => {
//       const component = route.component
//       const { params } = transition
//       // return component ? <Component ...Object.assign({}, params, { children })) /> : children
//       return component ? createElement(component, Object.assign({}, params, { children })) : children
//     }, null)
//     ReactDOM.render(App, root)
//   },
//   error: function () {},
//   done: function () {}
// }

// const track = function (router) {
//   return function (transition) {
//     console.log('Track in GA:', transition.routes.map(r => r.path).join('/').replace(/\/\//g, '/'))
//   }
// }

// const middleware = [
//   require('neon-load-async-routes'),
//   require('neon-router-react'),
//   require('neon-dispatch-redux'),
//   require('neon-vue'),
//   require('neon-backbone'),
//   require('neon-loading-animation')
//   track
// ]

// const router = cherrytree({ routes, middleware, log: true, pushState: false, location: 'memory' })
// router.start()

// console.log('WHAT')
// window.router = router

// redirect home
// router.transitionTo({ route: 'app' })
// router.transitionTo({ route: '/' })

// // redirect to pulls
// router.transitionTo({ route: 'pulls' })
// // with query params
// router.transitionTo({ route: 'pulls', query: { org: 'qubit' } })
// // replace the state instead of pushing, back button will not include this page
// router.transitionTo({ route: '/issues', replace: true })
