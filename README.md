# Cherrytree

[![Build Status](https://travis-ci.org/QubitProducts/cherrytree.svg?branch=master)](https://travis-ci.org/QubitProducts/cherrytree)
[![build status](https://www.codeship.io/projects/aa5e37b0-aeb1-0131-dd5f-06fd12e6a611/status)](https://codeship.com/projects/19734)

Cherrytree is a flexible hierarchical router. Cherrytree translates each URL change to a transition object and applies your middleware functions that translate the transition data into the desired state of your application.


# Installation

You can get cherrytree from npm - it supports both AMD and CJS.

**IMPORTANT!** - to get the latest (alpha) version, atm you need to use the `@latest` tag. There are a couple of small API tweaks I want to make before I release the 2.0.0 stable.

    $ npm install --save cherrytree@latest

In a CJS environment, simply require it as usual, the dependencies will be loaded from npm

    require('cherrytree')

In an AMD environment, require the standalone UMD build - this version has all of the dependencies bundled

    require('cherrytree/standalone')

# Size

The size excluding all deps is ~10.96 kB gzipped and the standalone build with all deps is ~12.82 kB gzipped.

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
  // e.g. use require.js to partially load your app
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
      params: transition.params,
      query: transition.query
    })
    var parent = transition.routes[i-1]
    var containerEl = parent ? parent.view.el.querySelector('.outlet') : document.body
    containerEl.appendChild(view.render().el)
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

// start listening to URL changes
router.listen()

```


# Guide

Read [the brief guide](guide.md).


# Examples

You can clone this repo if you want to run the `examples` locally. Currently the examples are:

* [hello-world-react](examples/hello-world-react) - a small example of how to get started
* [hello-world-jquery](examples/hello-world-jquery) - a single file example of how to get started
* [cherry-pick](examples/cherry-pick) - a mini GitHub clone written in React.js
* [vanilla-blog](examples/vanilla-blog) - a small static demo of blog like app that uses no framework
* [server-side-react](examples/server-side-react) - a server side express app using cherrytree for routing and react for rendering

There is also an example in a separate repo:

* [cherrytree-redux-react-example](https://github.com/KidkArolis/cherrytree-redux-react-example) - a more modern stack - redux + react + react-hot-loader + cherrytree-for-react


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
* **react-router** is also inspired by router.js. React-router is trying to solve a lot of routing related aspects out of the box in the most React idiomatic way whereas with `cherrytree` you'll have to write all of the glue code for integrating into React yourself. However, what you get instead is a smaller, simpler and hopefully more flexible library which should be more adaptable to your specific needs. This also means that you can use a `react-router` like approach with other `React` inspired libraries such as `mercury`, `riot`, `om`, `cycle`, `deku` and so on.

# Plugins

To use `cherrytree` with React, check out [`cherrytree-for-react`](https://github.com/KidkArolis/cherrytree-for-react).


# Docs

### var router = cherrytree(options)

* **options.log** - a function that is called with logging info, default is noop. Pass in `true`/`false` or a custom logging function.
* **options.logError** - default is true. A function that is called when transitions error (except for the special `TransitionRedirected` and `TransitionCancelled` errors). Pass in `true`/`false` or a custom error handling function.
* **options.pushState** - default is false, which means using hashchange events. Set to `true` to use pushState.
* **options.root** - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.
* **options.interceptLinks** - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. Read more on [intercepting links below](#intercepting-links).
* **options.Promise** - default is window.Promise or global.Promise. Promise implementation to be used when constructing transitions.

### router.map(fn)

Configure the router with a route map. E.g.

```js
router.map(function (route) {
  route('app', {path: '/'}, function () {
    route('index')
    route('about')
    route('post', {path: ':postId'}, function () {
      route('show')
      route('edit')
    })
  })
})
```

#### Nested paths

Nested paths are concatenated unless they start with a '/'. For example

```js
router.map(function (route) {
  route('foo', {path: '/foo'}, function () {
    route('bar', {path: '/bar'}, function () {
      route('baz', {path: '/baz'})
    });
  })
})
```

The above map results in 1 URL `/baz` mapping to ['foo', 'bar', 'baz'] routes.

```js
router.map(function (route) {
  route('foo', {path: '/foo'}, function () {
    route('bar', {path: 'bar'}, function () {
      route('baz', {path: 'baz'})
    });
  })
})
```

The above map results in 1 URL `/foo/bar/baz` mapping to ['foo', 'bar', 'baz'] routes.

#### Dynamic paths

Paths can contain dynamic segments as described in the docs of [path-to-regexp](https://github.com/pillarjs/path-to-regexp). For example:

```js
route('foo', {path: '/hello/:myParam'}) // single named param, matches /hello/1
route('foo', {path: '/hello/:myParam/:myOtherParam'}) // two named params, matches /hello/1/2
route('foo', {path: '/hello/:myParam?'}) // single optional named param, matches /hello and /hello/1
route('foo', {path: '/hello/:splat*'}) // match 0 or more segments, matches /hello and /hello/1 and /hello/1/2/3
route('foo', {path: '/hello/:splat+'}) // match 1 or more segments, matches /hello/1 and /hello/1/2/3
```

### router.use(fn)

Add a transition middleware. Every time a transition takes place this middleware will be called with a transition as the argument. You can call `use` multiple times to add more middlewares. The middleware function can return a promise and the next middleware will not be called until the promise of the previous middleware is resolved. The result of the promise is passed in as a second argument to the next middleware. E.g.

```js
router.use(function (transition) {
  return Promise.all(transition.routes.map(function (route) {
    return route.options.handler.fetchData()
  }))
})

router.use(function (transition, datas) {
  transition.routes.forEach(function (route, i) {
    route.options.handler.activate(datas[i])
  })
})
```

#### transition

The transition object is itself a promise. It also contains the following attributes

* `id`
* `routes`
* `path`
* `pathname`
* `params`
* `query`
* `prev`
  * `routes`
  * `path`
  * `pathname`
  * `params`
  * `query`

And the following methods

* `then`
* `catch`
* `cancel`
* `retry`
* `followRedirects`
* `redirectTo`

#### route

During every transition, you can inspect `transition.routes` and `transition.prev.routes` to see where the router is transitioning to. These are arrays that contain a list of route descriptors. Each route descriptor has the following attributes

* `name` - e.g. `'message'`
* `path` - the path segment, e.g. `'message/:id'`
* `paramNames` - a list of dynamic param names, e.g `['id']`
* `options` - the options object that was passed to the `route` function in the `map`
* `ancestors` - an array of route names that are parents of this route, e.g. `['application', 'profile']`

### router.listen()

After the router has been configured with a route map and middleware - start listening to URL changes and transition to the appropriate route based on the current URL.

### router.transitionTo(name, params, query)

Transition to a route, e.g.

```js
router.transitionTo('about')
router.transitionTo('posts.show', {postId: 1})
router.transitionTo('posts.show', {postId: 2}, {commentId: 2})
```

### router.replaceWith(name, params, query)

Same as transitionTo, but doesn't add an entry in browser's history, instead replaces the current entry. Useful if you don't want this transition to be accessible via browser's Back button, e.g. if you're redirecting, or if you're navigating upon clicking tabs in the UI, etc.

### router.generate(name, params, query)

Generate a URL for a route, e.g.

```js
router.generate('about')
router.generate('posts.show', {postId: 1})
router.generate('posts.show', {postId: 2}, {commentId: 2})
```

It generates a URL with # if router is in hashChange mode and with no # if router is in pushState mode.

### router.state

The state of the route is always available on the `router.state` object. It contains `activeTransition`, `routes`, `path`, `pathname`, `params` and `query`.

## Errors

Transitions can fail, in which case the transition promise is rejected with the error object. This could happen, for example, if some middleware throws or returns a rejected promise.

There are also two special errors that can be thrown when a redirect happens or when transition is cancelled completely.

In case of redirect (someone initiating a router.transitionTo() while another transition was active) and error object will have a `type` attribute set to 'TransitionRedirected' and `nextPath` attribute set to the path of the new transition.

In case of cancelling (someone calling transition.cancel()) the error object will have a `type` attribute set to 'TransitionCancelled'.

If you have some error handling middleware - you most likely want to check for these two special errors, because they're normal to the functioning of the router, it's common to perform redirects.

## HistoryLocation

Cherrytree can be configured to use differet implementations of libraries that manage browser's URL/history. By default, Cherrytree will use a very versatile implementation - `cherrytree/lib/locations/history` which supports `pushState` and `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities.

Configure HistoryLocation by passing options directly to the router.

```js
  var cherrytree = require('cherrytree')
  var router = cherrytree({
    pushState: true
  })
  router.listen()
```

You can also pass the location in explicitly. This is how you could provide your own custom location implementation.

```js
  var cherrytree = require('cherrytree')
  var HistoryLocation = require('cherrytree/lib/locations/history')
  var router = cherrytree()
  router.listen(new HistoryLocation({
    pushState: true
  }))
```

### var location = new HistoryLocation(options)

Create an instance of history location. Note that only one instance of HistoryLocation should be created per page since it's managing the browser's URL.

**Note** these options can be passed in as router options, since HistoryLocation is the default location.

* options.pushState - default is false, which means using hashchange events. Set to true to use pushState.
* options.root - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.


# MemoryLocation

MemoryLocation can be used if you don't want router to touch the address bar at all. Navigating around the application will only be possible programatically by calling `router.transitionTo` and similar methods.

e.g.

```js
var cherrytree = require('cherrytree')
var MemoryLocation = require('cherrytree/lib/locations/memory')
var router = cherrytree()
routerlisten(new MemoryLocation())
```


## Intercepting Links

The clicks **are** intercepted only if:

  * router is passed a `interceptLinks: true` (default)
  * the currently used location and browser supports pushState
  * clicked with the left mouse button with no cmd or shift key

The clicks that **are never** intercepted:

  * external links
  * `javascript:` links
  * links with a `data-bypass` attribute
  * links starting with `#`

## FAQ

* Why is `cherrytree` written as one word? You got me, I'd say that represents the [wabisabi](https://en.wikipedia.org/wiki/Wabi-sabi) nature of the library.
