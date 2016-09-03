import { assert } from 'referee'

window.assert = assert

// do the webpack thing
let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
