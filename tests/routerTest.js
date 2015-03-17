let _ = require('lodash')
let {assert} = require('referee')
let {suite, test, beforeEach, afterEach} = window
let cherrytree = require('..')

suite('Cherrytree')

let router

let routes = (route) => {
  route('application', () => {
    route('home', {path: ''})
    route('notifications')
    route('messages')
    route('status', {path: ':user/status/:id'})
  })
}

beforeEach(() => {
  router = cherrytree()
})

afterEach(() => {
  router.destroy()
})

// @api public

test('#use registers middleware', () => {
  let m = () => {}
  router.use(m)
  assert(router.middleware.length === 1)
  assert(router.middleware[0] === m)
})

test('#map registers the routes', () => {
  router.map(routes)
  // check that the internal matchers object is created
  assert.equals(_.pluck(router.matchers, 'path'), [
    '/application',
    '/application/notifications',
    '/application/messages',
    '/application/:user/status/:id'
  ])
  // check that the internal routes object is created
  assert.equals(router.routes[0].name, 'application')
  assert.equals(router.routes[0].routes[3].options.path, ':user/status/:id')
})

test('#generate generates urls given route name and params as object', () => {
  router.map(routes).listen()
  var url = router.generate('status', {user: 'foo', id: 1, queryParams: {withReplies: true}})
  assert.equals(url, '#application/foo/status/1?withReplies=true')
})

test('#generate generates urls given route name and params as args', () => {
  router.map(routes).listen()
  var url = router.generate('status', 'foo', 1, {queryParams: {withReplies: true}})
  assert.equals(url, '#application/foo/status/1?withReplies=true')
})

test('#generate throws a useful error when listen has not been called', () => {
  router.map(routes)
  try {
    router.generate('messages')
  } catch (err) {
    assert.equals(err.message, 'Invariant Violation: call .listen() before using .generate()')
  }
})

test('#use middleware can not modify routers internal state by changing transition.routes', (done) => {
  window.location.hash = '/application/messages'
  router.map(routes)
  router.use((transition) => {
    assert.equals(transition.routes[0].name, 'application')
    transition.routes[0].foo = 1
    transition.routes[0].options.bar = 2
  })
  router.use((transition) => {
    assert.equals(transition.routes[0].name, 'application')
    assert.equals(transition.routes[0].foo, 1)
    assert.equals(transition.routes[0].options.bar, 2)

    assert.equals(router.routes[0].name, 'application')
    assert.equals(router.routes[0].foo, undefined)
    assert.equals(router.routes[0].options.foo, undefined)
    done()
  })
  router.listen()
})

test('#use transition fails if a middleware returns a transition', (done) => {
  window.location.hash = '/application/messages'
  router.map(routes)
  router.logError = function () {}
  router.use((transition) => {
    transition.catch((err) => {
      assert.equals(err.message, 'Invariant Violation: Middleware anonymous returned a transition which resulted in a deadlock')
    }).then(done).catch(done)
  })
  router.use((transition) => transition)
  router.listen()
})

// @api private

test('#match matches a path against the routes', () => {
  router.map(routes)
  let match = router.match('/application/KidkArolis/status/42')
  assert.equals(match.params, {
    user: 'KidkArolis',
    id: '42',
    queryParams: {}
  })
  assert.equals(_.pluck(match.routes, 'name'), ['application', 'status'])
})

test('#match matches a path with query params', () => {
  router.map(routes)
  let match = router.match('/application/KidkArolis/status/42?withReplies=true&foo=bar')
  assert.equals(match.params, {
    user: 'KidkArolis',
    id: '42',
    queryParams: {
      withReplies: 'true',
      foo: 'bar'
    }
  })
})

test('#match returns an array of route descriptors', () => {
  router.map((route) => {
    route('foo', {customData: 1}, () => {
      route('bar', {customData: 2})
    })
  })
  let match = router.match('/foo/bar')
  assert.equals(match.routes, [{
    name: 'foo',
    path: 'foo',
    paramNames: [],
    options: {
      customData: 1,
      path: 'foo'
    },
    ancestors: []
  }, {
    name: 'bar',
    path: 'bar',
    paramNames: [],
    options: {
      customData: 2,
      path: 'bar'
    },
    ancestors: ['foo']
  }])
})

test('#match ignores the trailing slash', () => {
  router.map(routes)
  assert(router.match('/application/messages').routes.length)
  assert(router.match('/application/messages/').routes.length)
})

test('#match returns an empty route array if nothing matches', () => {
  router.map(routes)
  let match = router.match('/foo/bar')
  assert.equals(match, {routes: [], params: {queryParams: {}}})
})

suite('route maps')

beforeEach(() => {
  router = cherrytree()
})

afterEach(() => {
  router.destroy()
})

test('routes with name "index" or that end int ".index" default to an empty path', () => {
  router.map((route) => {
    route('index')
    route('foo')
    route('bar', () => {
      route('bar.index')
    })
  })
  assert.equals(_.pluck(router.matchers, 'path'), [
    '/',
    '/foo',
    '/bar'
  ])
})

test('a complex route map', () => {
  router.map((route) => {
    route('application', () => {
      route('home', {path: ''})
      route('notifications')
      route('messages', () => {
        route('unread', () => {
          route('priority')
        })
        route('read')
        route('draft', () => {
          route('recent')
        })
      })
      route('status', {path: ':user/status/:id'})
    })
    route('anotherTopLevel', () => {
      route('withChildren')
    })
  })
  // check that the internal matchers object is created
  assert.equals(_.pluck(router.matchers, 'path'), [
    '/application',
    '/application/notifications',
    '/application/messages/unread/priority',
    '/application/messages/read',
    '/application/messages/draft/recent',
    '/application/:user/status/:id',
    '/anotherTopLevel/withChildren'
  ])
})

test('routes with duplicate names throw a useful error', () => {
  try {
    router.map((route) => {
      route('foo', () => {
        route('foo')
      })
    })
  } catch (e) {
    assert.equals(e.message, 'Invariant Violation: Route names must be unique, but route "foo" is declared multiple times')
    return
  }
  assert(false, 'Should not reach this')
})
