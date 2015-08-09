// need to do this for co to work
let Promise = require('es6-promise').Promise
window.Promise = Promise

// do the webpack thing
let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
