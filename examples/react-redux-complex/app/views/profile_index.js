let React = require('react')

module.exports = React.createClass({
  propTypes: {
    params: React.PropTypes.object
  },
  render: function () {
    return (
      <div className='ProfileIndex'>
        <h2>{this.props.params.user} profile</h2>
      </div>
    )
  }
})
