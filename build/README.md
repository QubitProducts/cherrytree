# Cherrytree

[![build status](https://www.codeship.io/projects/aa5e37b0-aeb1-0131-dd5f-06fd12e6a611/status)](https://codeship.com/projects/19734)

Cherrytree is a flexible hierarchical client side router. Cherrytree translates every URL change to a transition object and a list of matching routes. You then apply a middleware function to translate the transition data into the desired state of your application.


# Installation

You can get cherrytree from npm - it supports both AMD and CJS.

    $ npm install --save cherrytree

In a CJS environment, simply require it as usual, the dependencies will be loaded from npm

    require('cherrytree')

In an AMD environment, require the standalone UMD build - this version has all of the dependencies bundled

    require('cherrytree/standalone')

# Size

The size excluding all deps is ~10.23 kB gzipped and the standalone build with all deps is ~15.27 kB gzipped.

# Usage

```js
var cherrytree = require('cherrytree')

// create the router
var router = cherrytree()

// provide your route map
router.map(function (route) {
  route('application', {path: '/'}, function () {
    route('messages')
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user'}, function () {
      route('profile.index')
      route('profile.lists')
      route('profile.edit')
    })
  })
})

// install any number of middleware
// middleware can be asynchronous
router.use(function (transition) {
  // e.g. use require.js to partially
  // load your app
  return Promise.all(transition.routes.map(function (route) {
    return new Promise(function (resolve) {
      require(['./views/' + route.name], function (ViewClass) {
        route.ViewClass = ViewClass
        resolve()
      })
    })
  }))
})

// middleware can also be synchronous
router.use(function (transition) {
  transition.routes.forEach(function (route, i) {
    route.view = new route.ViewClass({
      // access dynamic params and query params
      params: transition.params,
      query: transition.query
    })
    var parent = transition.routes[i-1]
    var $outlet = parent ? parent.view.$el.find('.outlet') : $(document.body)
    $outlet.html(view.render().el)
  })
})

// transition itself is a promise
// use .then to know when transition has completed
// use .catch to know when transition has failed
router.use(function (transition) {
  transition.catch(function (err) {
    // transition can fail if it is cancelled or redirected
    // ignore those errors if you want to only listen to real errors
    // such as when one of the middleware fails, e.g. to fetch data
    if (err.type !== 'TransitionCancelled' && err.type !== 'TransitionRedirected') {
      dispatchError(err.message)
    }
  })
})

// start listening to browser's location bar changes
router.listen()

```


# Docs

Read [the API docs](docs/api.md) or [the brief guide](docs/guide.md).


# Examples

You can clone this repo if you want to run the `examples` locally. Currently the examples are

* [hello-world](examples/hello-world) - a single file example of how to get started
* [cherry-pick](examples/cherry-pick) - a mini GitHub clone written in React.js
* [vanilla-blog](examples/vanilla-blog) - a simple static demo of blog like app that uses no framework


# Features

* generate links in your application in a systematic way, e.g. `router.generate('commit', {sha: '1e2760'})`
* use pushState with automatic hashchange fallback - all urls in your app are generated the right way depending on which mode you're in
* link clicks on the page are intercepted automatically when using pushState
* partially load your app during transitions
* dynamic segments, optional params and query params
* transition is a first class citizen - abort, pause, resume, retry. E.g. pause the transition to display "There are unsaved changes" message if the user clicked some link on the page or used browser's back/forward buttons
* navigate around the app programatically, e.g. `router.transitionTo('commits')`
* rename URL segments (e.g. /account -> /profile) without having to change route names or manuall update any links
* not coupled to any framework


# How does it compare to other routers?

* **Backbone router** is nice and simple and can be enough. In fact cherrytree uses some bits from Backbone router under the hood. Cherrytree adds nested routing, support for asynchronous transitions, more flexible dynamic params, url generation, automatic click handling.
* **Ember router / router.js** is the inspiration for cherrytree. It's where cherrytree inherits the idea of declaring hierarchical nested route maps. The scope of cherrytree is slightly different than that of router.js, for example cherrytree doesn't have the concept of handler objects or model hooks. On the other hand, unlike router.js - cherrytree handles browser url changes and intercepts link clicks with pushState out of the box. The handler concept and model hooks can be implemented based on the specific application needs using the middleware mechanism. Overall, cherrytree is less prescriptive, more flexible and easier to use out of the box.
* **react-router** is also inspired by router.js. React-router is trying to solve a lot of routing related aspects out of the box in the most React idiomatic way whereas with `cherrytree` you'll have to write all of the glue code for integrating into React yourself. However, what you get instead is a smaller, simpler and hopefully more flexible library which should be more adaptable to your specific needs. This also means that you can use a `react-router` like a approach with other `React` inspired libraries such as `mercury`, `riot` or `om`.
