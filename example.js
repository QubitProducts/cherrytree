const cherrytree = require('cherrytree')
const React = require('react')
const ReactDOM = require('react-dom')
const createElement = React.createElement

const routes = [{
  name: 'app',
  path: '/',
  component: props => <div>{props.children ? props.children : 'Hello'}</div>,
  children: [{
    name: 'issues',
    component: () => <div>This is issues</div>
  }, {
    name: 'pulls',
    content: () => <div>This is pulls</div>
  }]
}]

const render = transition => {
  let App = transition.routes.reduceRight((children, route) => {
    const { component } = route
    return component ? createElement(component, { children }) : children
  }, null)
  ReactDOM.render(<App />, document.body)
}

cherrytree(routes, render)
