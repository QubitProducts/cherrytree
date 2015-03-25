# Cherrytree

![build status](https://www.codeship.io/projects/aa5e37b0-aeb1-0131-dd5f-06fd12e6a611/status)

Cherrytree is a flexible hierarchical client side router. Use the middleware mechanism to partially load parts of your app, load data, render views, perform redirects, etc.

# Installation

You can get cherrytree from npm - it supports both AMD and CJS.

```sh
npm install --save QubitProducts/cherrytree#2.0
```

# Usage

```js
var cherrytree = require('cherrytree')

// create the router
var router = cherrytree();

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
// middleware can be asynchronouse
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

Read [the guide](docs/guide.md) or [the API docs](docs/api.md).

# Examples

* [Hello World standalone](http://requirebin.com/embed?gist=543a9f1a36382683f422) - you can see the URL change
* [Hello World with code](http://requirebin.com/?gist=543a9f1a36382683f422)

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

* **Backbone router** is much simpler and that can be fine it that's all you need (in fact cherrytree uses some bits from Backbone router under the hood). However, Backbone's simple approach is not great for more ambitious applications that want to handle asynchronous transitions.
* **Ember router / router.js** is the inspiration for cherrytree. This is where cherrytree inherits the idea of declaring hierarchical nested route maps. The scope of cherrytree is slightly different than that of **router.js**, for example cherrytree doesn't have the concept of handler objects or model hooks. On the other hand, unlike `router.js` - cherrytree handles browser url changes and intercepts link clicks with pushState out of the box. The handler concept and model hooks can be implemented based on the specific application needs using the middleware mechanism.
* **react-router** - is in many ways also similar and inspired by `router.js`. You should be able to achieve a lot of the same things you get in **react-router** minus all the coupling to React.js. Also, arguably, cherrytree has a better support for asynchronous transitions via the promise based middleware API.

Because cherrytree is not coupled to any specific framework you should be able to plug into any kind of app with different rendering and data fetching pipelines and requirements.
