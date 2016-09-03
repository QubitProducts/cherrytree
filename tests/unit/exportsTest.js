/* global suite, test, assert */

import BrowserLocationDirect from '../../lib/locations/browser'
import MemoryLocationDirect from '../../lib/locations/memory'
import createRouter, { MemoryLocation, BrowserLocation, route } from '../../'

suite('Exports')

test('createRouter', () => {
  assert(typeof createRouter === 'function')
  assert.equals(createRouter, createRouter)
})

test('route', () => {
  assert(typeof createRouter.route === 'function')
  assert.equals(createRouter.route, route)
})

test('BrowserLocation', () => {
  assert.equals(createRouter.BrowserLocation, BrowserLocationDirect)
  assert.equals(createRouter.MemoryLocation, MemoryLocation)
})

test('MemoryLocation', () => {
  assert.equals(createRouter.MemoryLocation, MemoryLocationDirect)
  assert.equals(createRouter.BrowserLocation, BrowserLocation)
})
