let React = require('react')

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },
  propTypes: {
    children: React.PropTypes.any
  },
  render: function () {
    return (
      <div className='App'>
        <div className='App-header'>
          <h1>Application</h1>
          <ul className='Nav'>
            <li className='Nav-item'><a href={this.context.router.generate('home')}>Home</a></li>
            <li className='Nav-item'><a href={this.context.router.generate('messages')}>Messages</a></li>
            <li className='Nav-item'><a href={this.context.router.generate('profile.index', {user: 'scrobblemuch'})}>Profile</a></li>
          </ul>
        </div>
        <div className='Container'>
          {this.props.children}
        </div>
      </div>
    )
  }
})