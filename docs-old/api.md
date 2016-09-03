# Docs

## API

* **neon()** - create the router
* **router.start**
* **router.stop**
* **router.transitionTo**
* **router.href**
* **router.back**
* **router.forward**
* **router.use**
* **router.getState**
* **router.matchers**

### var router = neon(options)

* **routes** - a route map, see below for more details
* **middleware** - a set of middleware that will get applied to each transition
* **options.log** - a function that is called with logging info, default is noop. Pass in `true`/`false` or a custom logging function.
* **options.pushState** - default is true. Set to `false` to use hashchange instead.
* **options.base** - default is `/`. Use in combination with `pushState: true` if your application is not being served from the base url /.
* **options.interceptLinks** - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. You can also set this option to a custom function that will get called whenever a link is clicked if you want to customize the behaviour. Read more on [intercepting links below](#intercepting-links).
* **options.qs** - default is a simple built in query string parser. Pass in an object with `parse` and `stringify` functions to customize how query strings get treated.
* **options.Promise** - default is window.Promise or global.Promise. Promise implementation to be used when constructing transitions.

#### routes

This is an example route map:

```js
let routes = [
  { name: 'app', path: '/', children: [
    { name: 'about' }
    { name: 'post', path: ':postId', children: [
      { name: 'show' }
      { name: 'edit' }
    ]}
  ]}
]
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
{ name: 'foo', path: '/hello/:myParam' } // single named param, matches /hello/1
{ name: 'foo', path: '/hello/:myParam/:myOtherParam' } // two named params, matches /hello/1/2
{ name: 'foo', path: '/hello/:myParam?' } // single optional named param, matches /hello and /hello/1
{ name: 'foo', path: '/hello/:splat*' } // match 0 or more segments, matches /hello and /hello/1 and /hello/1/2/3
{ name: 'foo', path: '/hello/:splat+' } // match 1 or more segments, matches /hello/1 and /hello/1/2/3
```

#### Abstract routes

By default, both leaf and non leaf routes can be navigated to. Sometimes you might not want it to be possible to navigate to certain routes at all, e.g. if the route is only used for data fetching and doesn't render anything by itself. In that case, you can set `abstract: true` in the route options. Abstract routes can still form a part of the URL.

```js
router.map(function (route) {
  route('application', {path: '/'}, function () {
    route('dashboard', {path: 'dashboard/:accountId', abstract: true}, function () {
      route('defaultDashboard', {path: ''})
      route('realtimeDashboard', {path: 'realtime'})
    });
  })
})
```

Abstract routes are especially useful when creating `index` subroutes as demonstrated above. The above route map results in the following URLs:

```
/ - ['application']
/dashboard/:accountId - ['application', 'dashboard', 'defaultDashboard']
/dashboard/:accountId/realtime - ['application', 'dashboard', 'realtimeDashboard']
```

It's also common to redirect from non leaf routes. In this example we might want to redirect from `application` to the `defaultDashboard` route. If each of your routes are backed by some route handler object, you can achieve the redirect with the following middleware:

```js
router.use(function redirect (transition) {
  var lastRoute = transition.routes[transition.routes.length - 1]
  if (lastRoute.handler.redirect) {
    lastRoute.handler.redirect(transition.params, transition.query)
  }
})
```

### router.use(fn)

Middleware has the following shape `router => { next: (transition) }`, e.g.:

```js
function middleware (router) {
  return {
    name: 'name-of-the-middleware',
    next: function (transition, redirect, cancel) {},
    done: function (transition) {},
    error: function (err, transition) {}
  }
}
```

or in ES6

```js
const middleware = router => ({
  name: 'name-of-the-middleware',
  next: (transition, redirect, cancel) => {},
  done: (transition) => {},
  error: (err, transition) => {}
})
```

You can implement all or only some of the lifecycle hooks. E.g. typically you'll only need the `next` hook.

Add a transition middleware. Every time a transition takes place this middleware will be called with a transition as the argument. You can call `use` multiple times to add more middlewares. The middleware function can return a promise and the next middleware will not be called until the promise of the previous middleware is resolved. The result of the promise is passed in as a second argument to the next middleware. E.g.

```js
router.use(router => ({
  next: (transition, redirect, cancel) =>
    Promise.all(transition.routes.map(route =>
      route.options.handler.fetchData()
    })).then(data => {
      router.data = data
    })
  }
}))

router.use(router => ({
  next: transition =>
    transition.routes.forEach((route, i) =>
      route.options.handler.activate(datas[i]))
  })
})
```

#### transition

Transition contains the following attributes

* `id`
* `routes`
* `path`
* `pathname`
* `params`
* `query``
* `state`
* `prev`
  * `id`
  * `routes`
  * `path`
  * `pathname`
  * `params`
  * `query`
  * `state`

#### route

During every transition, you can inspect `transition.routes` and `transition.prev.routes` to see where the router is transitioning to. These are arrays that contain a list of route descriptors. Each route descriptor has the following attributes

* `name` - e.g. `'message'`
* `path` - the path segment, e.g. `'message/:id'`
* `state` - an object that can be used to store route state

This will also contain any other extra attributes that were set on the route. E.g. you might want to attach `component`, `view`, `layout` and similar attributes that will then get passed through to the middleware.

### router.start()

After the router has been configured with a route map and middleware - start listening to URL changes and transition to the appropriate route based on the current URL.

When using `location: 'memory'`, the current URL is not read from the browser's location bar and instead can be passed in via listen: `listen(path)`.

### router.stop()

Stop listening to URL changes

### router.transitionTo({ route, params, query, replace })

Transition to a route, e.g.

```js
router.transitionTo({ route: 'about' })
router.transitionTo({ route: 'about', replace: true })
router.transitionTo({ route: 'posts.show', params: { postId: 1 } })
router.transitionTo({ route: 'posts.show', params: { postId: 2 }, query: {commentId: 2 } })
```

Passing `replace: true` doesn't add an entry in browser's history, instead replaces the current entry. Useful if you don't want this transition to be accessible via browser's Back button, e.g. if you're redirecting, or if you're navigating upon clicking tabs in the UI, etc.

### router.href({ route, params, query })

Generate a URL for a route, e.g.

```js
router.href({ route: 'about'} )
router.href({ route: 'posts.show', params: { postId: 1 } })
router.href({ route: 'posts.show', params: { postId: 2 }, query: { commentId: 2 } })
```

It generates a URL with # if router is in hashChange mode and with no # if router is in pushState mode.

### router.isActive({ route, params, query })

Check if a given route, params and query is currently active.

```js
router.isActive({ route: 'status' })
router.isActive({ route: 'status', params: { user: 'me' } })
router.isActive({ route: 'status', params: { user: 'me' }, query: { commentId: 2 } })
```

### router.getState()

Get current router state.

### router.matchers

Use this to inspect all the routes and their URL patterns that exist in your application. It's an array of:

```js
{
  name,
  path,
  routes
}
```

listed in the order that they will be matched against the URL.

## Query params

Cherrytree will extract and parse the query params using a very simple query string parser that only supports key values. For example, `?a=1&b=2` will be parsed to `{a: 1, b:2}`. If you want to use a more sophisticated query parser, pass in an object with `parse` and `stringify` functions - an interface compatible with the popular [qs](https://github.com/hapijs/qs) module e.g.:

```js
neon({
  qs: require('qs')
})
```


## Errors

Transitions can fail, in which case the transition promise is rejected with the error object. This could happen, for example, if some middleware throws or returns a rejected promise.

There are also two special errors that can be thrown when a redirect happens or when transition is cancelled completely.

In case of redirect (someone initiating a router.transitionTo() while another transition was active) and error object will have a `type` attribute set to 'TransitionRedirected' and `nextPath` attribute set to the path of the new transition.

In case of cancelling (someone calling transition.cancel()) the error object will have a `type` attribute set to 'TransitionCancelled'.

If you have some error handling middleware - you most likely want to check for these two special errors, because they're normal to the functioning of the router, it's common to perform redirects.

## BrowserLocation

Cherrytree can be configured to use differet implementations of libraries that manage browser's URL/history. By default, Cherrytree will use a very versatile implementation - `cherrytree/lib/locations/browser` which supports `pushState` and `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities.

Configure BrowserLocation by passing options directly to the router.

```js
var router = neon({
  pushState: true
})
```

* options.pushState - default is false, which means using hashchange events. Set to true to use pushState.
* options.root - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.

## MemoryLocation

MemoryLocation can be used if you don't want router to touch the address bar at all. Navigating around the application will only be possible programatically by calling `router.transitionTo` and similar methods.

e.g.

```js
var router = neon({
  location: 'memory'
})
```

## CustomLocation

You can also pass a custom location in explicitly. This is an advanced use case, but might turn out to be useful in non browser environments. For this you'll need to investigate how BrowserLocation is implemented.

```js
var router = neon({
  location: myCustomLocation()
})
```


## Intercepting Links

Cherrytree intercepts all link clicks when using pushState, because without this functionality - the browser would just do a full page refresh on every click of a link.

The clicks **are** intercepted only if:

  * router is passed a `interceptLinks: true` (default)
  * the currently used location and browser supports pushState
  * clicked with the left mouse button with no cmd or shift key

The clicks that **are never** intercepted:

  * external links
  * `javascript:` links
  * `mailto:` links
  * links with a `data-bypass` attribute
  * links starting with `#`

The default implementation of the intercept click handler is:

```js
function defaultClickHandler (event, link, router) {
  event.preventDefault()
  router.transitionTo(router.location.removeRoot(link.getAttribute('href')))
}
```

You can pass in a custom function as the `interceptLinks` router option to customize this behaviour. E.g. to use `replace` option in `transitionTo`.


## Handling 404

There are a couple of ways to handle URLs that don't match any routes.

You can create a middleware to detects when `transition.routes.length` is 0 and render a 404 page.

Alternatively, you can also declare a catch all path in your route map:

```js
router.map(function (route) {
  route('application', {path: '/'}, function () {
    route('blog')
    route('missing', {path: ':path*'})
  })
})
```

In this case, when nothing else matches, a transition to the `missing` route will be initiated with `transition.routes` as ['application', 'missing']. This gives you a chance to activate and render the `application` route before rendering a 404 page.
