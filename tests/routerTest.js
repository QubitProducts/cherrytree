let _ = require('lodash')
let Promise = require('es6-promise').Promise
let co = require('co')
let {assert} = require('referee')
let {suite, test, beforeEach, afterEach} = window
let cherrytree = require('..')

let delay = (t) => new Promise((resolve) => setTimeout(resolve, t))

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
  window.location.hash = ''
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

test('#use middleware gets passed a transition object', (done) => {
  let m = (transition) => {
    let t = _.omit(transition, ['catch', 'then', 'redirectTo', 'cancel', 'retry', 'followRedirects'])
    let et = {
      id: 3,
      prev: {
        routes: [{
          name: 'application',
          path: 'application',
          params: {},
          options: {
            path: 'application'
          }
        }, {
          name: 'home',
          path: '',
          params: {},
          options: {
            path: ''
          }
        }],
        path: '/application',
        pathname: '/application',
        params: {},
        query: {}
      },
      routes: [{
        name: 'application',
        path: 'application',
        params: {},
        options: {
          path: 'application'
        }
      }, {
        name: 'status',
        path: ':user/status/:id',
        params: {
          user: '1',
          id: '2'
        },
        options: {
          path: ':user/status/:id'
        }
      }],
      path: '/application/1/status/2?withReplies=true',
      pathname: '/application/1/status/2',
      params: {
        user: '1',
        id: '2'
      },
      query: {
        withReplies: 'true'
      }
    }
    assert.equals(t, et)

    done()
  }

  // first navigate to 'home'
  router.map(routes)
  router.listen()
    .then(() => router.transitionTo('home'))
    .then(() => {
      // then install the middleware and navigate to status page
      // this is so that we have a richer transition object
      // to assert
      router.use(m)
      return router.transitionTo('status', {user: 1, id: 2}, {withReplies: true})
    }).catch(done)
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
  var url = router.generate('status', {user: 'foo', id: 1}, {withReplies: true})
  assert.equals(url, '#application/foo/status/1?withReplies=true')
})

if (window.history && window.history.pushState) {
  test('#generate when pushState: true and root != "/" in modern browsers', () => {
    router.options.pushState = true
    router.options.root = '/foo/bar'
    router.map(routes).listen()
    var url = router.generate('status', {user: 'usr', id: 1}, {withReplies: true})
    assert.equals(url, '/foo/bar/application/usr/status/1?withReplies=true')
  })
}

if (window.history && !window.history.pushState) {
  test('#generate when pushState: true and root != "/" in old browsers', () => {
    let browserRedirectedTo

    router.options.pushState = true
    router.options.root = '/foo/bar'
    router.options.location = {
      href: '/different/#location',
      pathname: '/different',
      hash: '#location',
      search: '',
      replace: function (path) {
        browserRedirectedTo = path
      }
    }

    router.map(routes).listen()
    var url = router.generate('status', {user: 'usr', id: 1}, {withReplies: true})
    assert.equals(browserRedirectedTo, '/foo/bar/#different')
    assert.equals(url, '#application/usr/status/1?withReplies=true')
  })
}

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
    id: '42'
  })
  assert.equals(_.pluck(match.routes, 'name'), ['application', 'status'])
})

test('#match matches a path with query params', () => {
  router.map(routes)
  let match = router.match('/application/KidkArolis/status/42?withReplies=true&foo=bar')
  assert.equals(match.params, {
    user: 'KidkArolis',
    id: '42'
  })
  assert.equals(match.query, {
    withReplies: 'true',
    foo: 'bar'
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
    params: {},
    options: {
      customData: 1,
      path: 'foo'
    }
  }, {
    name: 'bar',
    path: 'bar',
    params: {},
    options: {
      customData: 2,
      path: 'bar'
    }
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
  assert.equals(match, {routes: [], params: {}, query: {}})
})

test('#transitionTo called multiple times reuses the active transition', (done) => {
  router.map(routes)
  router.listen().then(() => {
    router.use(() => delay(500))
    assert.equals(router.transitionTo('status', {user: 'me', id: 1}).id, 2)
    assert.equals(router.transitionTo('status', {user: 'me', id: 1}).id, 2)
    done()
  }).catch(done)
})

test('#transitionTo called on the same route, returns a completed transition', (done) => {
  let called = false
  router.map(routes)
  router.listen().then(() => {
    return router.transitionTo('status', {user: 'me', id: 1})
  }).then(() => {
    router.use(() => called = true)
    let t = router.transitionTo('status', {user: 'me', id: 1})
    assert.equals(t.noop, true)
    return t
  }).then(() => {
    assert.equals(called, false)
    done()
  }).catch(done)
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

test('modifying params or query in middleware does not affect the router state', co.wrap(function *() {
  router.map(routes)
  yield router.listen()
  router.use(transition => {
    transition.params.foo = 1
    transition.query.bar = 2
    transition.routes.push({})
    transition.routes[0].foobar = 123
  })
  yield router.transitionTo('status', {user: 'me', id: 42}, {q: 'abc'})
  // none of the modifications to params, query or routes
  // array are persisted to the router state
  assert.equals(router.state.params, {user: 'me', id: '42'})
  assert.equals(router.state.query, {q: 'abc'})
  assert.equals(router.state.routes.length, 2)
}))
