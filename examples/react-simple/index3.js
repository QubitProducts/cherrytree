const cherrytree = require('cherrytree').default
const React = require('react')
const ReactDOM = require('react-dom')
const createElement = React.createElement

const routes = [{
  name: 'app',
  path: '/',
  component: props => <div>{props.children ? props.children : 'Hello'}</div>,
  children: [{
    name: 'issues',
    path: 'issues',
    component: props => <div>This is issues <div>{props.children}</div></div>,
    children: [{
      name: 'issue',
      path: ':id',
      component: props => <div>Issue #{props.params.id}</div>
    }]
  }, {
    name: 'pulls',
    path: 'pulls',
    component: () => <div>This is pulls</div>
  }]
}]

const render = router => transition => {
  let { params } = transition
  let App = transition.routes.reduceRight((children, route) => {
    const { component } = route
    console.log('RENDERING', route.name, component, params)
    return component ? createElement(component, { params, children }) : children
  }, null)
  ReactDOM.render(App, root)
}

window.router = cherrytree({ routes, middleware: render, log: true, pushState: false })
window.router.start()

const root = document.createElement('div')
document.body.appendChild(root)
