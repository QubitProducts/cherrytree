/**
 * This is a generic render helper for
 * cherrytree + react + express
 *
 * There are more concerns in a real life app
 * than are addressed in this simple example,
 * but this should be a good starting point.
 *
 * In particular, with further tweaks, this could
 * be turned into an isomorphic app, since we could
 * render the same routes on the client.
 *
 * Data fetching is not addressed here, but see
 * the https://github.com/KidkArolis/cherrytree-redux-react-example
 * for how data management could be addressed in
 * a cherrytree routed app.
 *
 * Data fetching could be configured via cherrytree
 * middleware since the middleware would get the transition
 * with all required routes passed in and returning a
 * promise there will block the rendering.
 */

let cherrytree = require('cherrytree')
let { Router } = require('cherrytree-for-react')
let React = require('react')

module.exports = function (routes, options) {
  return function render (req, res, next) {
    let url = req.url
    let router = cherrytree(options)
      .map(routes())
      // just an example of how redirects work,
      // you can setup various redirect strategies
      // in general e.g.
      // * define a `redirect` option in your route map
      //   and handle it in a middleware
      // * redirect in a static method in your components
      //   and call that method from within a middleware
      // * in this case, we just redirect straight from the
      //   middleware
      .use(function adminRedirectDemo (transition) {
        if (transition.path === '/admin') {
          router.transitionTo('home')
          return
        }
      })

    let location = new cherrytree.MemoryLocation(url)

    // kick off routing
    let transition = router.listen(location)

    // after transitioning completes - render or redirect
    transition
      .then(function () {
        // the <Router> component from cherrytree-for-react
        // behaves differently when you pass in an already
        // started cherrytree - on the client, the usage
        // is slightly different
        res.send(React.renderToString(<Router router={router} />))
      }).catch(function (err) {
        if (err.type === 'TransitionRedirected' && err.nextPath) {
          res.redirect(err.nextPath)
        } else {
          next(err)
        }
      })

    // after everything - clean up
    // this also makes sure transitions are cancelled
    // during redirects. I.e. a redirect will reject
    // this transition #1 and destroying the router
    // will make sure that all subsequence transitions
    // won't happen anymore
    transition.then(cleanup).catch(cleanup)
    function cleanup () {
      router.destroy()
    }
  }
}
