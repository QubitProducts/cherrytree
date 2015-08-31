// need to do this for co to work
import { Promise } from 'es6-promise'
window.Promise = Promise

// do the webpack thing
let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
