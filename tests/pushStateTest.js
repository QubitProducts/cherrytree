/* global suite, test, beforeEach, afterEach, assert */

import createRouter from '../lib'
import routes from './fixtures/routes'
import fakeHistory from './lib/fakeHistory'
import { html } from './lib/dom'

// This is to avoid running these tests in IE9 in CI
if (window.history && window.history.pushState) {
  suite('Using pushState')

  let router, history, el

  beforeEach(async () => {
    window.location.hash = ''
    el = document.createElement('div')
    document.body.appendChild(el)
    router = createRouter({
      pushState: true,
      root: '/app',
      routes: routes()
    }, (transition) => {
      el.innerHTML = 'Rendered: ' + [
        transition.routes.map(r => r.name).join('/'),
        JSON.stringify(transition.params),
        JSON.stringify(transition.query)
      ].join('/')
    })
    await router.start()
    history = fakeHistory(router.location)
  })

  afterEach(async () => {
    await router.stop()
    history.restore()
    document.body.removeChild(el)
  })

  test('transition occurs when location.hash changes', async () => {
    history.url('/app/about')
    await router.state.currTransition.promise
    assert.equals(router.state.lastTransition.descriptor.path, '/about')
    assert.equals(el.innerHTML, 'Rendered: application/about/{}/{}')
  })

  test('programmatic transition via url and route names', async function () {
    await router.transitionTo({ route: 'about' })
    assert.equals(history.url(), '/app/about')

    await router.transitionTo({ route: '/faq?sortBy=date' })
    assert.equals(history.url(), '/app/faq?sortBy=date')
    assert.equals(html(el), 'Rendered: application/faq/{}/{"sortBy":"date"}')

    await router.transitionTo({ route: 'faq', query: { sortBy: 'user' } })
    assert.equals(html(el), 'Rendered: application/faq/{}/{"sortBy":"user"}')
  })
}
