## Cherrytree

### var router = cherrytree(options)

* **options.log** - a function that is called with logging info, default is noop
* **options.pushState** - default is false, which means using hashchange events. Set to true to use pushState.
* **options.root** - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.
* **options.interceptLinks** - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. Read more on [intercepting links below](#intercepting-links).

### router.map(fn)

Configure the router with a route map. Example

```js
router.map(function (route) {
  route('app', {path: '/'}, function () {
    route('about')
    route('post', {path: ':postId'}, function () {
      this.route('show')
      this.route('edit')
    })
  })
})
```

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

Same as transitionTo, but don't add an entry in browser's history, instead replace the current entry. Useful if you don't want this transition to be accessible via browser's Back button, e.g. if you're redirecting, or if you're navigating upon clicking tabs in the UI, etc.

### router.generate(name, params, query)

Generate a URL for a route, e.g.

```js
router.generate('about')
router.generate('posts.show', {postId: 1})
router.generate('posts.show', {postId: 2}, {commentId: 2})
```

It generates a URL with # if router is in hashChange mode and with no # if router is in pushState mode.


### router.state

...


## HistoryLocation

Cherrytree can be configured to use differet implementations of libraries that manage browser's URL/history. By default, Cherrytree will use a very versatile implementation - `locations/history` which supports `pushState` and `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities.

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
  var HistoryLocation = require('cherrytree/locations/history')
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
var cherrytree = require("cherrytree");
var MemoryLocation = require("cherrytree/locations/memory");
var router = cherrytree();
routerlisten(new MemoryLocation());
```