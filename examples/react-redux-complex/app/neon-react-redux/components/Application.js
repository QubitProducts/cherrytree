let React = require('react')
let connect = require('react-redux').connect
let PropTypes = React.PropTypes
let render = require('./render')

function mapStateToProps (state) {
  return state.router
}

let Application = React.createClass({
  contextTypes: {
    router: PropTypes.object
  },

  propTypes: {
    routes: PropTypes.array
  },

  render: function () {
    return render(this.context.router, this.props.routes)
  }
})

module.exports = connect(mapStateToProps)(Application)
