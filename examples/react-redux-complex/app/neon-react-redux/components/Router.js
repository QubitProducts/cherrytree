let React = require('react')
let connect = require('react-redux').connect
let { PropTypes, createElement } = React

function mapStateToProps (state) {
  return state.router
}

const Router = React.createClass({
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
    const { router, routes } = this.props
    if (!routes) return null
    return routes.reduceRight((children, route) => {
      let component = router.components[route.name]
      if (!component) {
        return children
      } else {
        return createElement(component, { children })
      }
    }, null)
  }
})

module.exports = connect(mapStateToProps)(Router)
