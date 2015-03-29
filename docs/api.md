## Cherrytree

### var router = cherrytree(options)

* **options.log** - a function that is called with logging info, default is noop. Pass in `true` or a custom logging function.
* **options.pushState** - default is false, which means using hashchange events. Set to `true` to use pushState.
* **options.root** - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.
* **options.interceptLinks** - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. Read more on [intercepting links below](#intercepting-links).

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
* options.interceptLinks - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router.

### Intercepting Links

The clicks **are** intercepted only if:

  * clicked with the left mouse button with no cmd or shift key

The clicks that **are never** intercepted:

  * external links
  * `javascript:` links
  * links with a `data-bypass` attribute
  * links starting with `#`



# MemoryLocation

MemoryLocation can be used if you don't want router to touch the address bar at all. Navigating around the application will only be possible programatically by calling `router.transitionTo` and similar methods.

e.g.

```js
var cherrytree = require('cherrytree')
var MemoryLocation = require('cherrytree/lib/locations/memory')
var router = cherrytree()
routerlisten(new MemoryLocation())
```
