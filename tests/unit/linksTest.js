import $ from 'jquery'
import { assert } from 'referee'
import { intercept } from '../../lib/links'

let {suite, test, beforeEach, afterEach} = window
let mouse = window.effroi.mouse
let $container

suite('links')

beforeEach(() => {
  $container = $('<div/>').appendTo('body')
})
afterEach(() => {
  $container.empty().remove()
})

test('intercepts link clicks', () => {
  let $a = $('<a href="/foo">foo</a>').appendTo($container)
  // prevent navigation

  let calledWith = []
  let cb = (event, el) => calledWith.push({event, el})

  // proxy all clicks via this callback
  let dispose = intercept(cb)

  // install another click handler that will prevent
  // the navigation, we must install this after the
  // link.intercept has been already called
  let navPreventedCount = 0
  $(document).on('click', e => {
    navPreventedCount++
    e.preventDefault()
  })

  // now test that when clicking the link, the calledWith
  mouse.click($a.get(0))
  // it calls back with event and el
  assert.equals(calledWith[0].event.target, calledWith[0].el)
  // and the el is the link that was clicked
  assert.equals(calledWith[0].el, $a.get(0))
  assert.equals(navPreventedCount, 1)

  // test that cleanup works
  dispose()
  // clicking this time
  mouse.click($a.get(0))
  // should not call the cb again
  assert.equals(calledWith.length, 1)
  // only the nav prevention should kick in
  assert.equals(navPreventedCount, 2)
})
