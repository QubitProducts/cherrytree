import { intercept } from '../lib/links'

let mouse = window.effroi.mouse

let $container, onClick

suite('links')

beforeEach(() => {
  $container = document.createElement('div')
  document.body.appendChild($container)
})
afterEach(() => {
  $container.parentElement.removeChild($container)
  document.removeEventListener('click', onClick)
})

test('intercepts link clicks', () => {
  let $a = document.createElement('a')
  $a.href = '/foo'
  $a.innerHTML = 'foo'
  $container.appendChild($a)
  // prevent navigation

  let calledWith = []
  let cb = (event, el) => calledWith.push({event, el})

  // proxy all clicks via this callback
  let dispose = intercept(cb)

  // install another click handler that will prevent
  // the navigation, we must install this after the
  // link.intercept has been already called
  let navPreventedCount = 0
  onClick = e => {
    navPreventedCount++
    e.preventDefault()
  }
  document.addEventListener('click', onClick)

  // now test that when clicking the link, the calledWith
  mouse.click($a)
  // it calls back with event and el
  assert.equals(calledWith[0].event.target, calledWith[0].el)
  // and the el is the link that was clicked
  assert.equals(calledWith[0].el, $a)
  assert.equals(navPreventedCount, 1)

  // test that cleanup works
  dispose()
  // clicking this time
  mouse.click($a)
  // should not call the cb again
  assert.equals(calledWith.length, 1)
  // only the nav prevention should kick in
  assert.equals(navPreventedCount, 2)
})
