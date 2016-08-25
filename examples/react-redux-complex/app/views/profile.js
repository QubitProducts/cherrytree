let React = require('react')

module.exports = React.createClass({
  propTypes: {
    children: React.PropTypes.any
  },
  render: function () {
    return (
      <div className='Profile'>
        <div className='Container'>{this.props.children}</div>
      </div>
    )
  }
})