let React = require('react')
let connect = require('react-redux').connect
let createElement = React.createElement
let PropTypes = React.PropTypes

function mapStateToProps (state) {
  return state.router.current
}

let App = React.createClass({
  propTypes: {
    router: PropTypes.object.isRequired
  },

  childContextTypes: {
    router: PropTypes.object
  },

  getChildContext () {
    return {
      router: this.props.router
    }
  },

  render: function () {
    let { routes, params, query } = this.props

    if (!routes) return null

    return routes.reduceRight((element, route) => {
      if (!route.options.component) {
        return element
      } else {
        return createElement(route.options.component, {
          params: params,
          query: query,
          children: element
        })
      }
    }, null)
  }
})

module.exports.App = connect(mapStateToProps)(App)
