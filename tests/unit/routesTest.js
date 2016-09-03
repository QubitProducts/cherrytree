/* global suite, test, beforeEach, afterEach, assert */

import cherrytree, { route } from '../..'

suite('Routes')

let router

beforeEach(() => {
  router = cherrytree()
})

afterEach(() => {
  router.stop()
})

test('a complex route map', () => {
  router.map([
    route({ name: 'application' }, [
      route({ name: 'notifications' }),
      route({ name: 'messages' }, [
        route({ name: 'unread' }, [
          route({ name: 'priority' })
        ]),
        route({ name: 'read' }),
        route({ name: 'draft' }, [
          route({ name: 'recent' })
        ])
      ]),
      route({ name: 'status', path: ':user/status/:id' })
    ]),
    route({ name: 'anotherTopLevel' }, [
      route({ name: 'withChildren' })
    ])
  ])

  // check that the internal matchers object is created
  assert.equals(router.matchers.map(m => m.path), [
    '/application',
    '/application/notifications',
    '/application/messages',
    '/application/messages/unread',
    '/application/messages/unread/priority',
    '/application/messages/read',
    '/application/messages/draft',
    '/application/messages/draft/recent',
    '/application/:user/status/:id',
    '/anotherTopLevel',
    '/anotherTopLevel/withChildren'
  ])
})

test('a parent route can be excluded from the route map by setting abstract to true', () => {
  router.map([
    route({ name: 'application', abstract: true }, [
      route({ name: 'notifications' }),
      route({ name: 'messages' }, [
        route({ name: 'unread' }, [
          route({ name: 'priority' })
        ]),
        route({ name: 'read' }),
        route({ name: 'draft', abstract: true }, [
          route({ name: 'recent' })
        ])
      ]),
      route({ name: 'status', path: ':user/status/:id' })
    ]),
    route({ name: 'anotherTopLevel' }, [
      route({ name: 'withChildren' })
    ])
  ])

  assert.equals(router.matchers.map(m => m.path), [
    '/application/notifications',
    '/application/messages',
    '/application/messages/unread',
    '/application/messages/unread/priority',
    '/application/messages/read',
    '/application/messages/draft/recent',
    '/application/:user/status/:id',
    '/anotherTopLevel',
    '/anotherTopLevel/withChildren'
  ])
})

test('duplicate names throw a useful error', () => {
  try {
    router.map([{ name: 'foo', children: [{ name: 'foo' }] }])
  } catch (e) {
    assert.equals(e.message, 'Cherrytree: Route names must be unique, but route "foo" is declared multiple times')
    return
  }
  assert(false, 'Should not reach this')
})
