let React = require('react')
let PropTypes = React.PropTypes

module.exports = React.createClass({
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
    return this.props.children
  }
})
