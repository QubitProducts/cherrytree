let referee = require('referee')
let {assert, beforeEach, afterEach} = window

// assertions counting
let expected = 0
referee.add('expect', {
  assert: (exp) => {
    expected = exp
    return true
  }
})
beforeEach(() => {
  referee.count = 0
})
afterEach(function () {
  var self = this
  try {
    assert(expected === referee.count - 1, 'Expected ' + expected + ' assertions')
  } catch (err) {
    self.currentTest.emit('error', err)
  }
})

let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
