## Router

### var router = new Router(options)

* **options.map** - specify the [route map](#routermapfn)
* **options.handlers** - a hash specifying your [route handlers](#routerhandlers-hash). Key is the name of the route, value is the route handler class
* **options.logging** - default is false
* **options.onURLChanged** - called if URL changes. e.g. function (url) {}
* **options.onDidTransition** - called if router transitioned. e.g. function (routeName) {}

Location related options

* **options.pushState** - default is false, which means using hashchange events. Set to true to use pushState.
* **options.root** - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.
* **options.interceptLinks** - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. Read more on [intercepting links below](#intercepting-links).

Or a custom location

* **options.location** - default is an instance of HistoryLocation

Advanced options

* **options.resolver** - specify a custom route resolver. Default resolver loads the routes from `router.handlers[routeName]` by name. The code of the default resolver is `function (name, cb) { cb(router.handlers[name]); }`
* **options.defaultRouteHandler** - default is `cherrytree/route`. Change this to specify a different default route handler class that will be used for all routes that don't have a specific handler provided

### router.map(fn)

Configure the router with a route map. Example

```js
router.map(function () {
  this.route("about");
  this.resource("post", {path: "/:postId"}, function () {
    this.route("show", {queryParams: ['commentId']);
    this.route("edit"});
  });
})
```

### router.handlers hash

This is where you register all your custom route handlers. Each route in your route map can have specific behaviour, such as loading data and specifying how to render the views. Each resource in the map can have an associated route handlers. The name of the resource is what you use to attach the route handler to it, e.g. `post`. Each route in the map has a name that can be created by combining the name of the resource and the route, e.g. `post.show`. Top level route names don't include a prefix, e.g. `about`. There are a couple of special routes that are always available - `application`, `index` and `loading`.

```js
var Route = require('cherrytree/route');

router.handlers['post.show'] = Route.extend({
  model: function () {
    return $.getJSON('/url');
  },
  activate: function (data) {
    // render data
  }
});
```

### router.startRouting()

After the router has been configured with a route map and route handlers - start listening to URL changes and transition to the appropriate route based on the current URL.

### router.transitionTo(name, ...params)

Transition to a route, e.g.

```js
router.transitionTo('about');
router.transitionTo('posts.show', 1);
router.transitionTo('posts.show', 2, {queryParams: {commentId: 2}});
router.transitionTo('posts.show', 2, {queryParams: {commentId: null}});
```

### router.replaceWith(name, ...params)

Same as transitionTo, but don't add an entry in browser's history, instead replace the current entry. Useful if you don't want this transition to be accessible via browser's Back button, e.g. if you're redirecting, or if you're navigating upon clicking tabs in the UI, etc.

### router.generate(name, ...params)

Generate a URL for a route, e.g.

```js
router.generate('about');
router.generate('posts.show', 1);
router.generate('posts.show', 2, {queryParams: {commentId: 2}});
router.generate('posts.show', 2, {queryParams: {commentId: null}});
```

It generates a URL with # if router is in hashChange mode and with no # if router is in pushState mode.


### router.activeRoutes()

List currently active route instances. Recommended to only use this for debugging.
Pass in the name of a route to return only the instance of that route.

### router.activeRouteNames()

List currently active route names. Recommended to only use this for debugging.

## Route

The Route class should be extend to create specific route handlers.

```js
var route = Route.extend({...})
```

Within a route you can access the router via `this.router`.

## Route Hooks

These are all of the hooks that you can implement in the routes.

### initialize(options)

Will be called upon constructing the route - only once per application lifetime. The passed in options will contain the `router` instance and the `name` of the route. Options are also available at `route.options`.

### beforeModel(transition)

Useful for route entry validations and redirects if we don't want to proceed. Return a promise to block the loading of further route model hooks.

### model(params, transition)

Useful for loading in data. Query params can be found at `params.queryParams`. Return a promise to block the loading of further route model hooks.

### afterModel(context, transition)

The first param is the route's context.

### activate(context, transition)

The first param is the route's context. This is called on each route starting at the root after all model hooks have been resolved. If during a transition the route is already active and the params/context hasn't changed - activate won't be called for those routes. This is where you should render your views (if any).

### deactivate()

If the route is not needed anymore it will be deactivated. This is where you should cleanup your views.

### update(context, transition)

If the route is already active, but the context of the route has changed, the update will be called first to check if the route wants to handle this update without having to `deactivate` and `activate` again. That is useful when you can rerender the view when data updates instead of destroying it and recreating it. Return `false` in this hook if you want to indicate that you can't handle the graceful update and want to fallback to reactivating the route.

### queryParamsDidChange(changed, all, removed)

If the right set of routes is already active and query params change, the queryParamsDidChange method will be called on each route to let them update. Return false to stop propagation of this event. Call `this.refresh()` if you just want to reactivate this route (including the model hook).

### willTransition(transition)

Called when router is about to transition away from this route. You can abort the transition using `transition.abort()`, e.g.

```js
willTransition: function (transition) {
  transition.abort();
  if (confirm("You have unsaved changed")) {
    transition.retry();
  }
}
```

This is an event that bubbles up to the root starting at the child route - return false to stop the propagation.

### error(err)

Called when transitioning fails. This is an event that bubbles up to the root starting at the route that caused the error while transitioning (in other words this method is called on each route). Return false to stop propagation.

## Route Methods

These are all of the methods that you can call on your route (e.g. from within the route hooks)

### route.setContext

Set route's context. It's useful to set route's context when you want it to be accessible by children routes. `route.get` method makes it easy to access context of parent routes. The context is also passed as the first argument to the `route.activate` and `route.update` hooks.

### route.getContext

Get the route's context.

### route.get(field)

Get a field from the context of this route or any of the parent routes. For example, if you fetched the `post` model in the `post` resource and set it as context using `this.setContext({post: model})` you can retrieve it in all child routes with `this.get('post')`.

Example

```js
var PostRoute = Route.extend({
  model: function (params) {
    var post = new Post();
    this.setContext({
      postId: params.postId,
      post: post
    });
    return post.fetch();
  }
})

var PostShowRoute = Route.extend({
  activate: function () {
    this.test = 1;
    var view = new PostShowView({
      model: this.get('post'), // grabbed from the parent context
      postId: this.get('postId') // grabbed from the parent route instance
      test: this.get('test') // grabbed from this route's instance
    });
    this.parent.view.$('.outlet').html(view.render().el);
  }
});
```

### route.refresh()

Reactivate all the child routes of this route including this route.

### route.transitionTo()

An alias to `this.router.transitionTo`.

### replaceWith

An alias to `this.router.replaceWith`.



## HistoryLocation

Cherrytree can be configured to use differet implementations of libraries that manage browser's URL/history. By default, Cherrytree will use a very versatile implementation - `locations/history` which supports `pushState` and `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities.

Configure HistoryLocation by passing options directly to the router.

```js
  var Router = require("cherrytree");
  var router = new Router({
    pushState: true
  });
```

You can also pass the location in explicitly. This is how you could provide your own custom location implementation.

```js
  var Router = require("cherrytree");
  var HistoryLocation = require("cherrytree/locations/history");
  var router = new Router({
    location: new HistoryLocation({
      pushState: true
    })
  });
```

### var location = new HistoryLocation(options)

Create an instance of history location. Note that only one instance of HistoryLocation should be created per page since it's managing the browser's URL.

**Note** these options can be passed in as router options, since HistoryLocation is the default location.

* options.pushState - default is false, which means using hashchange events. Set to true to use pushState.
* options.root - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.
* options.interceptLinks - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router.

### Intercepting Links

The clicks **are** intercepted only if :

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
var Cherrytree = require("cherrytree");
var MemoryLocation = require("cherrytree/locations/memory");
var router = new Cherrytree({
  location: new MemoryLocation()
});
```