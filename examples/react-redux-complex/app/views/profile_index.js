let React = require('react')
let connect = require('react-redux').connect

function mapStateToProps (state) {
  return state.router.params
}

let ProfileIndex = React.createClass({
  propTypes: {
    user: React.PropTypes.string
  },
  render: function () {
    return (
      <div className='ProfileIndex'>
        <h2>{this.props.user} profile</h2>
      </div>
    )
  }
})

module.exports = connect(mapStateToProps)(ProfileIndex)
