let $ = require('jquery')
let co = require('co')
let {assert} = require('referee')
let {suite, test, beforeEach, afterEach} = window
let TestApp = require('./testApp')
let Promise = require('es6-promise').Promise
let app, router

suite('Cherrytree app')

beforeEach(() => {
  window.location.hash = '/'
  app = new TestApp()
  router = app.router
  return app.start()
})

afterEach(() => {
  app.destroy()
})

test('transition occurs when location.hash changes', (done) => {
  router.use((transition) => {
    transition.then(() => {
      assert.equals(transition.path, '/about')
      assert.equals($('.application .outlet').html(), 'This is about page')
      done()
    }).catch(done, done)
  })

  window.location.hash = '#about'
})

test('programmatic transition via url and route names', () => {
  return co(function * () {
    yield router.transitionTo('about')
    yield router.transitionTo('/faq?sortBy=date')
    assert.equals($('.application .outlet').html(), 'FAQ. Sorted By: date')
    yield router.transitionTo('faq', {}, { sortBy: 'user' })
    assert.equals($('.application .outlet').html(), 'FAQ. Sorted By: user')
  })
})

test('cancelling and retrying transitions', () => {
  return co(function * () {
    yield router.transitionTo('/posts/filter/foo')
    assert.equals(router.location.getURL(), '/posts/filter/foo')
    var transition = router.transitionTo('about')
    transition.cancel()
    yield transition.catch(() => {})
    assert.equals(router.location.getURL(), '/posts/filter/foo')

    yield transition.retry()
    assert.equals(router.location.getURL(), '/about')
  })
})

test('navigating around the app', () => {
  return co(function * () {
    assert.equals($('.application .outlet').html(), 'Welcome to this application')

    yield router.transitionTo('about')
    assert.equals($('.application .outlet').html(), 'This is about page')

    yield router.transitionTo('/faq?sortBy=date')
    assert.equals($('.application .outlet').html(), 'FAQ. Sorted By: date')

    yield router.transitionTo('faq', {}, { sortBy: 'user' })
    assert.equals($('.application .outlet').html(), 'FAQ. Sorted By: user')

    // we can also change the url directly to cause another transition to happen
    yield new Promise(function (resolve) {
      router.use(resolve)
      window.location.hash = '#posts/filter/mine'
    })
    assert.equals($('.application .outlet').html(), 'My posts...')

    yield new Promise(function (resolve) {
      router.use(resolve)
      window.location.hash = '#posts/filter/foo'
    })
    assert.equals($('.application .outlet').html(), 'Filter not found')
  })
})
