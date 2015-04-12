// let referee = require('referee')
// let {assert} = referee
// let {beforeEach, afterEach} = window
//
// // assertions counting
// let expected = 0
// referee.add('expect', {
//   assert: (exp) => {
//     expected = exp
//     return true
//   }
// })
// beforeEach(() => {
//   referee.count = 0
// })
// afterEach(function () {
//   var self = this
//   if (expected === false) return
//   try {
//     assert(expected === referee.count - 1, 'expected ' + expected + ' assertions, got ' + referee.count)
//   } catch (err) {
//     err.message = err.message + ' in ' + self.currentTest.title
//     throw err
//     // self.currentTest.emit('error', err)
//     // self.test.emit('error', err)
//   }
//   expected = false
// })

// need to do this for co to work
let Promise = require('es6-promise').Promise
window.Promise = Promise

let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
