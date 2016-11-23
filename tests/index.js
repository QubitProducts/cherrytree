import 'babel-regenerator-runtime'
import { assert } from 'referee'
import { Promise } from 'es6-promise'

window.Promise = window.Promise || Promise

window.assert = assert

// do the webpack thing
let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
