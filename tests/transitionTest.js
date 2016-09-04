/* global suite, test, beforeEach, afterEach, assert */

import createRouter from '../lib'
import routes from './fixtures/routes'
import { html } from './lib/dom'

suite('Cherrytree')

let router

beforeEach(async () => {
  window.location.hash = ''
  router = createRouter({
    pushState: false,
    routes: routes(),
    middleware: router => transition => {
      document.body.innerHTML = 'Rendered: ' + [
        transition.routes.map(r => r.name).join('/'),
        JSON.stringify(transition.params),
        JSON.stringify(transition.query)
      ].join('/')
    }
  })
  await router.start()
})

afterEach(async () => {
  await router.stop()
})

test('transition occurs when location.hash changes', done => {
  router.use(router => ({
    done: transition => {
      assert.equals(transition.path, '/about')
      assert.equals(html('body'), 'Rendered: application/about/{}/{}')
      done()
    },
    error: done
  }))

  window.location.hash = '#about'
})

test('the original transition promise rejects if redirect fails', async () => {
  let transitioned1
  let transitioned1Rejected = false
  let transitioned2Rejected = false

  await router.transitionTo({ route: 'application' })
  // initiate a transition
  transitioned1 = router.transitionTo({ route: '/posts/filter/foo' })
    .catch(err => { transitioned1Rejected = err })
  // and a failing redirect
  router.transitionTo({ route: '/about' })
    .catch(err => { transitioned2Rejected = err })
  router.use(router => transition => { throw new Error('fail') })

  assert.equals(transitioned1Rejected, false)
  assert.equals(transitioned2Rejected, false)
  await transitioned1
  assert.equals(transitioned1Rejected.message, 'fail')
  assert.equals(transitioned2Rejected.message, 'fail')
  assert.equals(router.location.url(), '/about')
})

test('programmatic transition via url and route names', async () => {
  await router.transitionTo({ route: 'about' })
  await router.transitionTo({ route: '/faq?sortBy=date' })
  assert.equals(html('body'), 'Rendered: application/faq/{}/{"sortBy":"date"}')
  await router.transitionTo({ route: 'faq', query: { sortBy: 'user' } })
  assert.equals(html('body'), 'Rendered: application/faq/{}/{"sortBy":"user"}')
})

test('cancelling transitions', async function () {
  await router.transitionTo({ route: '/posts/filter/foo' })
  assert.equals(router.location.url(), '/posts/filter/foo')

  router.use(router => (transition, redirect, cancel) => {
    cancel()
  })
  await router.transitionTo({ route: 'about' })
  assert.equals(router.location.url(), '/posts/filter/foo')
  assert.equals(router.state.lastTransition.descriptor.state, 'cancelled')
})

test('the original transition promise resolves when all redirects complete', async function () {
  let transitioned1
  let transitioned1Resolved = false
  let transitioned2Resolved = false

  await router.transitionTo({ route: 'application' })
  // initiate a transition
  transitioned1 = router.transitionTo({ route: '/posts/filter/foo' })
    .then(() => { transitioned1Resolved = true })
  // and a redirect
  router.transitionTo({ route: '/about' })
    .then(() => { transitioned2Resolved = true })

  assert.equals(transitioned1Resolved, false)
  assert.equals(transitioned2Resolved, false)
  await transitioned1
  assert.equals(transitioned1Resolved, true)
  assert.equals(transitioned2Resolved, true)
  assert.equals(router.location.url(), '/about')
})

test.skip('cancelling transition does not add a history entry', async () => {
  // we start of at index
  await router.transitionTo({ route: 'application' })

  // we start of at faq
  await router.transitionTo({ route: 'faq' })

  // then go to posts.filter
  await router.transitionTo({ route: 'posts.filter', params: { filterId: 'foo' } })
  assert.equals(window.location.hash, '#posts/filter/foo')

  // now attempt to transition to about and cancel
  let cancelled = false
  router.use(router => (transition, redirect, cancel) => {
    if (!cancelled) cancel()
    cancelled = true
  })
  await router.transitionTo({ route: '/about' })

  // the url is still posts.filter
  assert.equals(window.location.hash, '#posts/filter/foo')

  // going back should now take as to faq
  await new Promise((resolve, reject) => {
    router.use(router => ({
      done: () => {
        console.log('DONE!')
        assert.equals(window.location.hash, '#faq')
        resolve()
      },
      error: reject
    }))
    console.log('GOING BACK!')
    window.history.back()
  })
})

test('url behaviour during transitions', async () => {
  assert.equals(window.location.hash, '')
  let transitioned = router.transitionTo({ route: 'about' })
  assert.equals(window.location.hash, '#about')
  await transitioned
  assert.equals(window.location.hash, '#about')
  // would be cool to test history.back() here
  // but in IE it reloads the karma iframe, so let's
  // use a regular location.hash assignment instead
  // window.history.back()
  window.location.hash = ''
  await new Promise((resolve) => {
    router.use(router => transition => {
      assert.equals(window.location.hash, '')
      resolve()
    })
  })
})

test('url behaviour during failed transitions', async () => {
  await router.transitionTo({ route: 'about' })
  await new Promise((resolve, reject) => {
    // setup a middleware that will fail
    router.use(router => ({
      next: transition => { throw new Error('failed') },
      error: err => {
        assert.equals(err.message, 'failed')
        assert.equals(window.location.hash, '#faq')
        resolve()
      }
    }))
    router.transitionTo({ route: 'faq' })
  })
})

test('navigating around the app', async () => {
  assert.equals(html('body'), 'Rendered: application/{}/{}')

  await router.transitionTo({ route: 'about' })
  assert.equals(html('body'), 'Rendered: application/about/{}/{}')

  await router.transitionTo({ route: '/faq?sortBy=date' })
  assert.equals(html('body'), 'Rendered: application/faq/{}/{"sortBy":"date"}')

  await router.transitionTo({ route: 'faq', query: { sortBy: 'user' } })
  assert.equals(html('body'), 'Rendered: application/faq/{}/{"sortBy":"user"}')

  // we can also change the url directly to cause another transition to happen
  await new Promise(resolve => {
    router.use(router => resolve)
    window.location.hash = '#posts/filter/mine'
  })
  assert.equals(html('body'), 'Rendered: application/posts/posts.filter/{"filterId":"mine"}/{}')

  await new Promise(resolve => {
    router.use(router => resolve)
    window.location.hash = '#posts/filter/foo'
  })
  assert.equals(html('body'), 'Rendered: application/posts/posts.filter/{"filterId":"foo"}/{}')
})
