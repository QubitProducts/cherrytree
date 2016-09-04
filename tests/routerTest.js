/* global suite, test, beforeEach, afterEach, assert, effroi */

import cherrytree, { route } from '../lib'

let delay = t => new Promise(resolve => setTimeout(resolve, t))

suite('Cherrytree')

let router

let routes = [
  route({ name: 'application' }, [
    route({ name: 'notifications' }),
    route({ name: 'messages' }),
    route({ name: 'status', path: ':user/status/:id' })
  ])
]

beforeEach(() => {
  window.location.hash = ''
  router = cherrytree({ pushState: false, routes })
})

afterEach(async () => {
  await router.stop()
})

// @api public

test('#use registers middleware', () => {
  let middleware = router => ({ name: 'test' })
  router.use(middleware)
  assert(router.middleware.length === 1)
  assert(router.middleware[0].name === 'test')
})

test('#use middleware gets passed a transition object', async () => {
  let next = transition => {
    assert.equals(transition, {
      id: 3,
      routes: [
        { name: 'application', path: 'application' },
        { name: 'status', path: ':user/status/:id' }
      ],
      path: '/application/1/status/2?withReplies=true',
      pathname: '/application/1/status/2',
      params: { user: '1', id: '2' },
      query: { withReplies: 'true' },
      state: 'transitioning',
      prev: {
        id: 2,
        routes: [{ name: 'application', path: 'application' }],
        path: '/application',
        pathname: '/application',
        params: {},
        query: {},
        state: 'completed'
      }
    })
  }
  let middleware = router => ({ next })

  router = cherrytree({ pushState: false, routes })
  await router.start()
  await router.transitionTo({ route: 'application' })
  router.use(middleware)
  await router.transitionTo({ route: 'status', params: { user: 1, id: 2 }, query: { withReplies: true } })
})

test('#map registers the routes', () => {
  // check that the internal matchers object is created
  assert.equals(router.matchers.map(m => m.path), [
    '/application',
    '/application/notifications',
    '/application/messages',
    '/application/:user/status/:id'
  ])
  // check that the internal routes object is created
  assert.equals(router.routes[0].name, 'application')
  assert.equals(router.routes[0].children[2].path, ':user/status/:id')
})

test('#href generates urls given route name and params as object', () => {
  router.map(routes)
  var url = router.href({ route: 'status', params: {user: 'foo', id: 1}, query: {withReplies: true} })
  assert.equals(url, '#application/foo/status/1?withReplies=true')
})

if (window.history && window.history.pushState) {
  test('#href when pushState: true and root != "/" in modern browsers', () => {
    router = cherrytree({ pushState: true, root: '/foo/bar', routes })
    var url = router.href({ route: 'status', params: {user: 'usr', id: 1}, query: {withReplies: true} })
    assert.equals(url, '/foo/bar/application/usr/status/1?withReplies=true')
  })
}

if (window.history && !window.history.pushState) {
  test('#href when pushState: true and root != "/" in old browsers', async () => {
    let browserRedirectedTo
    let location = new cherrytree.BrowserLocation({
      pushState: true,
      root: '/foo/bar',
      location: {
        href: '/different/#location',
        pathname: '/different',
        hash: '#location',
        search: '',
        replace: function (path) {
          browserRedirectedTo = path
        }
      }
    })

    router = cherrytree({ routes, location })
    await router.start()

    var url = router.href({ route: 'status', params: {user: 'usr', id: 1}, query: {withReplies: true} })
    assert.equals(browserRedirectedTo, '/foo/bar/#different')
    assert.equals(url, '#application/usr/status/1?withReplies=true')
  })
}

test('middleware can not modify routers internal state by changing transition.routes', async () => {
  window.location.hash = '/application/messages'
  router.use(router => transition => {
    assert.equals(transition.routes[0].name, 'application')
    transition.routes[0].name = 'modified'
    transition.routes[0].foo = 1
    transition.routes[0].bar = 2
  })
  router.use(router => transition => {
    assert.equals(transition.routes[0].name, 'modified')
    assert.equals(transition.routes[0].foo, 1)
    assert.equals(transition.routes[0].bar, 2)

    assert.equals(router.routes[0].name, 'application')
    assert.equals(router.routes[0].foo, undefined)
    assert.equals(router.routes[0].foo, undefined)

    assert.equals(router.routes[0].descriptor.foo, 1)
    assert.equals(router.routes[0].descriptor.bar, 2)
  })
  await router.start()
})

// @api private

test('#match matches a path against the routes', () => {
  let match = router.match('/application/KidkArolis/status/42')
  assert.equals(match.params, { user: 'KidkArolis', id: '42' })
  assert.equals(match.routes.map(r => r.name), ['application', 'status'])
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
  router.map([
    route({ name: 'foo', customData: 1 }, [
      route({ name: 'bar', customData: 2 })
    ])
  ])
  let match = router.match('/foo/bar')
  assert.equals(match.routes, [{
    name: 'foo',
    path: 'foo',
    customData: 1
  }, {
    name: 'bar',
    path: 'bar',
    customData: 2
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

test('#match always parses query parameters even if a route does not match', () => {
  router.map(routes)
  let match = router.match('/foo/bar?hello=world')
  assert.equals(match, {routes: [], params: {}, query: { hello: 'world' }})
})

test('#transitionTo called multiple times reuses the active transition', async () => {
  await router.start()
  router.use(() => () => delay(50))

  router.transitionTo({ route: 'status', params: { user: 'me', id: 1 } })
  assert.equals(router.state.currTransition.descriptor.id, 2)
  assert.equals(router.state.nextTransition, null)

  router.transitionTo({ route: 'status', params: { user: 'me', id: 1 } })
  assert.equals(router.state.currTransition.descriptor.id, 2)
  assert.equals(router.state.nextTransition, null)
})

test('#transitionTo called on the same route without running any middleware', async () => {
  let called = false
  await router.start()
  await router.transitionTo({ route: 'status', params: { user: 'me', id: 1 }, query: { r: 1 } })
  router.use(() => () => { called = true })
  let completed = router.transitionTo({ route: 'status', params: { user: 'me', id: 1 }, query: { r: 1 } })
  assert(typeof completed.then === 'function')
  await completed
  assert.equals(called, false)
})

test('#isActive returns true if arguments match current state and false if not', async () => {
  await router.start()
  await router.transitionTo({ route: 'notifications' })
  assert.equals(router.isActive({ route: 'notifications' }), true)
  assert.equals(router.isActive({ route: 'messages' }), false)
  await router.transitionTo({ route: 'status', params: {user: 'me', id: 1} })
  assert.equals(router.isActive({ route: 'status', params: {user: 'me'} }), true)
  assert.equals(router.isActive({ route: 'status', params: {user: 'notme'} }), false)
  await router.transitionTo({ route: 'messages', query: {foo: 'bar'} })
  assert.equals(router.isActive({ route: 'messages', query: {foo: 'bar'} }), true)
  assert.equals(router.isActive({ route: 'messages', query: {foo: 'baz'} }), false)
})

test('custom link intercept click handler', async () => {
  if (!window.history || !window.history.pushState) return

  let interceptCalledWith = false
  function interceptLinks (event, link) {
    event.preventDefault()
    interceptCalledWith = link.getAttribute('href')
  }

  router = cherrytree({ interceptLinks, routes })
  await router.start()

  let a = document.createElement('a')
  a.href = '/hello/world'
  a.innerHTML = 'hello'
  document.body.appendChild(a)
  effroi.mouse.click(a)
  assert.equals(interceptCalledWith, '/hello/world')
  document.body.removeChild(a)
})
