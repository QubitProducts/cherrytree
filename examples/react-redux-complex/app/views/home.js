let React = require('react')

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },
  render: function () {
    return (
      <div className='Home'>
        <h2>Tweets</h2>
        <div className='Tweet'>
          <div className='Tweet-author'>
            <a href={this.context.router.generate('profile.index', {user: 'dan_abramov'})}>Dan Abramov ‏@dan_abramov</a>
          </div>
          <div className='Tweet-time'>12m12 minutes ago</div>
          <div className='Tweet-content'>Another use case for \`this.context\` I think might be valid: forms. They are too painful right now.</div>
        </div>
        <div className='Tweet'>
          <div className='Tweet-author'>
            <a href={this.context.router.generate('profile.index', {user: 'afanasjevas'})}>Eduardas Afanasjevas ‏@afanasjevas</a>
          </div>
          <div className='Tweet-time'>12m12 minutes ago</div>
          <div className='Tweet-content'>I just published “What will Datasmoothie bring to the analytics startup landscape?” https://medium.com/@afanasjevas/what-will-datasmoothie-bring-to-the-analytics-startup-landscape-f7dab70d75c3?source=tw-81c4e81fe6f8-1427630532296</div>
        </div>
        <div className='Tweet'>
          <div className='Tweet-author'>
            <a href={this.context.router.generate('profile.index', {user: 'LNUGorg'})}>LNUG ‏@LNUGorg</a>
          </div>
          <div className='Tweet-time'>52m52 minutes ago</div>
          <div className='Tweet-content'> new talks uploaded on our YouTube page - check them out http://bit.ly/1yoXSAO</div>
        </div>
      </div>
    )
  }
})