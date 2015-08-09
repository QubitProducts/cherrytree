let express = require('express')
let morgan = require('morgan')
let app = express()
let render = require('./render')
let routes = require('./routes')

app.use(morgan('dev'))
app.use(express.static('assets'))

/**
 * handle all urls and pass the req, res to the
 * render helper function that creates a cherrytree
 * instance and renders out the app / or redirects
 */
app.get('*', render(routes, { log: true }))

app.listen(8000, function () {
  console.log('Cherrytree server side app started on http://localhost:8000')
})
