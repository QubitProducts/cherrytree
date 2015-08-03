let $ = require('jquery')
let co = require('co')
let {assert} = require('referee')
let fakeHistory = require('../lib/fakeHistory')
let {suite, test, beforeEach, afterEach} = window
let TestApp = require('./testApp')
let app, router, history

// This is to avoid running these tests in IE9 in CI
if (window.history && window.history.pushState) {

  suite('Cherrytree app using pushState')

  beforeEach(() => {
    window.location.hash = ''
    app = new TestApp({
      pushState: true,
      root: '/app'
    })
    router = app.router
    return app.start().then(() => history = fakeHistory(router.location))
  })

  afterEach(() => {
    app.destroy()
    history.restore()
  })

  test('transition occurs when location.hash changes', (done) => {
    router.use((transition) => {
      transition.then(() => {
        assert.equals(transition.path, '/about')
        assert.equals($('.application .outlet').html(), 'This is about page')
        done()
      }).catch(done, done)
    })

    history.setURL('/app/about')
  })

  test('programmatic transition via url and route names', co.wrap(function * () {
    yield router.transitionTo('about')
    assert.equals(history.getURL(), '/app/about')
    yield router.transitionTo('/faq?sortBy=date')
    assert.equals(history.getURL(), '/app/faq?sortBy=date')
    assert.equals($('.application .outlet').html(), 'FAQ. Sorted By: date')
    yield router.transitionTo('faq', {}, { sortBy: 'user' })
    assert.equals($('.application .outlet').html(), 'FAQ. Sorted By: user')
  }))

}
