/**
 * This is where the route tree is defined
 * together with corresponding React components.
 * Notice how there's nothing cherrytree pecific here,
 * it's just components and a generic function.
 */

let React = require('react')

module.exports = function routes () {
  return (route) => {
    route('application', {path: '/', component: application, abstract: true}, () => {
      route('home', {path: '', component: home})
      route('messages', {component: messages})
      route('status', {path: ':user/status/:id'})
      route('profile', {path: ':user', component: profile, abstract: true}, () => {
        route('profile.index', {path: '', component: profileIndex})
        route('profile.lists')
        route('profile.edit')
      })
    })
  }
}

// create some components, these could be split into
// multiple files, but keeping them here to simplify the example
let application = React.createClass({
  propTypes: {
    children: React.PropTypes.array
  },
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  render: function () {
    let router = this.context.router
    return (
      <html>
        <head>
          <link rel='stylesheet' type='text/css' href='/style.css' />
        </head>
        <body>
          <div className='App'>
            <div className='App-header'>
              <h1>Application</h1>
              <ul className='Nav'>
                <li className='Nav-item'><a href={router.generate('home')}>Home</a></li>
                <li className='Nav-item'><a href={router.generate('messages')}>Messages</a></li>
                <li className='Nav-item'><a href={router.generate('profile.index', {user: 'scrobblemuch'})}>Profile</a></li>
              </ul>
            </div>
            <div className='Container'>
              {this.props.children}
            </div>
          </div>
        </body>
      </html>
    )
  }
})

let home = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  render: function () {
    let router = this.context.router
    return (
      <div className='Home'>
        <h2>Tweets</h2>
        <div className='Tweet'>
          <div className='Tweet-author'>
            <a href={router.generate('profile.index', {user: 'dan_abramov'})}>Dan Abramov ‏@dan_abramov</a>
          </div>
          <div className='Tweet-time'>12m12 minutes ago</div>
          <div className='Tweet-content'>Another use case for \`this.context\` I think might be valid: forms. They are too painful right now.</div>
        </div>
        <div className='Tweet'>
          <div className='Tweet-author'>
            <a href={router.generate('profile.index', {user: 'afanasjevas'})}>Eduardas Afanasjevas ‏@afanasjevas</a>
          </div>
          <div className='Tweet-time'>12m12 minutes ago</div>
          <div className='Tweet-content'>I just published “What will Datasmoothie bring to the analytics startup landscape?” https://medium.com/@afanasjevas/what-will-datasmoothie-bring-to-the-analytics-startup-landscape-f7dab70d75c3?source=tw-81c4e81fe6f8-1427630532296</div>
        </div>
        <div className='Tweet'>
          <div className='Tweet-author'>
            <a href={router.generate('profile.index', {user: 'LNUGorg'})}>LNUG ‏@LNUGorg</a>
          </div>
          <div className='Tweet-time'>52m52 minutes ago</div>
          <div className='Tweet-content'> new talks uploaded on our YouTube page - check them out http://bit.ly/1yoXSAO</div>
        </div>
      </div>
    )
  }
})

let messages = React.createClass({
  render: function () {
    return (
      <div className='Messages'>
        <h2>Messages</h2>
        <p>You have no direct messages</p>
      </div>
    )
  }
})

let profile = React.createClass({
  propTypes: {
    children: React.PropTypes.array
  },
  render: function () {
    return (
      <div className='Profile'>
        <div className='Container'>{this.props.children}</div>
      </div>
    )
  }
})

let profileIndex = React.createClass({
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
