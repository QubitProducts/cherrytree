let $ = require('jquery')
let cherrytree = require('cherrytree')

require('./style.css')

// create the router
let router = cherrytree({
  log: true
})

// create some handlers
let application = {
  activate: function () {
    this.view = $(`
      <div class='App'>
        <div class='App-header'>
          <h1>Application</h1>
          <ul class='Nav'>
            <li class='Nav-item'><a href=${router.generate('home')}>Home</a></li>
            <li class='Nav-item'><a href=${router.generate('messages')}>Messages</a></li>
            <li class='Nav-item'><a href=${router.generate('profile.index', {user: 'scrobblemuch'})}>Profile</a></li>
          </ul>
        </div>
        <div class='Container'></div>
      </div>
    `)
  }
}

let home = {
  activate: function () {
    this.view = $(`
      <div class='Home'>
        <h2>Tweets</h2>
        <div class='Tweet'>
          <div class='Tweet-author'>
            <a href='${router.generate('profile.index', {user: 'dan_abramov'})}'>Dan Abramov ‏@dan_abramov</a>
          </div>
          <div class='Tweet-time'>12m12 minutes ago</div>
          <div class='Tweet-content'>Another use case for \`this.context\` I think might be valid: forms. They're too painful right now.</div>
        </div>
        <div class='Tweet'>
          <div class='Tweet-author'>
            <a href='${router.generate('profile.index', {user: 'afanasjevas'})}'>Eduardas Afanasjevas ‏@afanasjevas</a>
          </div>
          <div class='Tweet-time'>12m12 minutes ago</div>
          <div class='Tweet-content'>I just published “What will Datasmoothie bring to the analytics startup landscape?” https://medium.com/@afanasjevas/what-will-datasmoothie-bring-to-the-analytics-startup-landscape-f7dab70d75c3?source=tw-81c4e81fe6f8-1427630532296</div>
        </div>
        <div class='Tweet'>
          <div class='Tweet-author'>
            <a href='${router.generate('profile.index', {user: 'LNUGorg'})}'>LNUG ‏@LNUGorg</a>
          </div>
          <div class='Tweet-time'>52m52 minutes ago</div>
          <div class='Tweet-content'> new talks uploaded on our YouTube page - check them out http://bit.ly/1yoXSAO</div>
        </div>
      </div>
    `)
  }
}

let messages = {
  activate: function () {
    this.view = $(`
      <div class='Messages'>
        <h2>Messages</h2>
        <p>You have no direct messages</p>
      </div>
    `)
  }
}

let profile = {
  activate: function () {
    this.view = $(`
      <div class='Profile'>
        <div class='Container'></div>
      </div>
    `)
  }
}

let profileIndex = {
  activate: function (params) {
    this.view = $(`
      <div class='ProfileIndex'>
        <h2>${params.user} profile</h2>
      </div>
    `)
  }
}

// provide your route map
// in this particular case we configure handlers by attaching
// them to routes via options. This is one of several ways you
// could choose to handle transitions in your app.
//  * you can attach handlers to the route options like here
//  * you could get the route handlers of some map somewhere by name
//  * you can have a dynamic require that pulls in the route from a file by name
router.map((route) => {
  route('application', {path: '/', handler: application}, () => {
    route('home', {path: '', handler: home})
    route('messages', {handler: messages})
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user', handler: profile}, () => {
      route('profile.index', {handler: profileIndex})
      route('profile.lists')
      route('profile.edit')
    })
  })
})

// install middleware that will handle transitions
router.use(function activate (transition) {
  transition.routes.forEach((route, i) => {
    let handler = route.options.handler
    router.log(`Transition #${transition.id} activating '${route.name}'`)
    handler.activate(transition.params)
    if (handler.view) {
      let parent = transition.routes[i - 1]
      let $container = parent ? parent.options.handler.view.find('.Container') : $(document.body)
      $container.html(handler.view)
    }
  })
})

// start listening to browser's location bar changes
router.listen()
