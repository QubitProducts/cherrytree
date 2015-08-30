let {assert} = require('referee')
let {suite, test} = window
let _ = require('../../lib/dash')

suite('_')

test('map', () => {
  assert.equals(_.map([1, 2, 3], i => i * 2), [2, 4, 6])
})

test('pick', () => {
  assert.equals(_.pick({a: 1, b: 2, c: 3}, ['a', 'c']), {a: 1, c: 3})
})

test('pluck', () => {
  assert.equals(_.pluck([{a: 1, b: 2}, {a: 3, b: 4}], 'a'), [1, 3])
})

test('isArray', () => {
  assert.equals(_.isArray([]), true)
  assert.equals(_.isArray({}), false)
})
