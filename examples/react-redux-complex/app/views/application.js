let React = require('react')

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },
  propTypes: {
    children: React.PropTypes.any
  },
  render: function () {
    let router = this.context.router
    let href = router.href.bind(router)
    return (
      <div className='App'>
        <div className='App-header'>
          <h1>Application</h1>
          <ul className='Nav'>
            <li className='Nav-item'><a href={href({ route: 'home' })}>Home</a></li>
            <li className='Nav-item'><a href={href({ route: 'messages' })}>Messages</a></li>
            <li className='Nav-item'><a href={href({ route: 'profile.index', params: { user: 'scrobblemuch' } })}>Profile</a></li>
            <li className='Nav-item'><a href={href({ route: 'https://twitter.com/:user', params: { user: 'scrobblemuch' } })}>Twitter</a></li>
          </ul>
        </div>
        <div className='Container'>
          {this.props.children}
        </div>
      </div>
    )
  }
})
