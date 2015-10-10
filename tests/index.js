// do the webpack thing
let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
