/* global suite, test, assert, afterEach */

import { Promise } from 'es6-promise'
import createRouter from '../lib'
import routes from './fixtures/routes'

suite('Custom Promise')

let router

afterEach(async () => {
  await router.stop()
})

test('uses a custom provided Promise implementation', async () => {
  let called = 0
  var LocalPromise = function (fn) {
    called++
    return new Promise(fn)
  }
  let statics = ['reject', 'resolve', 'race', 'all']
  statics.forEach(s => { LocalPromise[s] = Promise[s].bind(Promise) })

  router = createRouter({
    routes: routes(),
    Promise: LocalPromise,
    middleware: router => transition => {}
  })

  await router.start()
  assert.equals(called, 1)

  await router.transitionTo({ route: 'faq' })
  assert.equals(called, 2)
})
