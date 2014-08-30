# Cherrytree

![build status](https://www.codeship.io/projects/aa5e37b0-aeb1-0131-dd5f-06fd12e6a611/status)

Cherrytree is a hierarchical router for clientside web applications. Using cherrytree applications can be modelled as a tree of routes where a number of routes are active at any given time. A URL is deserialized into a set of routes and each route gets a chance to perform some work like loading data and rendering views. Sharing parent routes between the different pages of your application means you can share data, model instances or compose your page with nested views (nav, sidebar, content area, etc.). It's heavily inspired by Ember.js router and is built on top of [tildeio/router.js](https://github.com/tildeio/router.js) - a library extracted from Ember. Cherrytree, however, does not depend on Ember or any other framework and so can be used with other libraries such as Backbone, React or Angular.

With cherrytree - routes are the central part of the application - that's are where you create models, views and manage their lifecycle.

The whole of Cherrytree is something around 15.54KB gzipped (50.79KB uncompressed).

# Motivation

The main idea in cherrytree is describing your application in a route map. Each route could be a different page if you have multiple pages in your app, or different states of your UI (like expanding panels or displaying lightboxes) - any state of your application that you want to have a URL for. URLs are very important for web apps - reloading a page should keep the UI in a similar state, urls of the app should be shareable and useful. Check out this [talk by Tom Dale about URLs in webapps](https://www.youtube.com/watch?v=OSEXpsVcTxI).

Here is an example of a route map.

```js
router.map(function () {
  this.resource("organisation")
  this.resource("user");
  this.resource("repository", {path: "/:owner/:repository"}, function () {
    this.resource("commits", function () {
      this.route("index");
      this.route("commit", {path: "/:sha"})
    });
    this.resource("settings", function () {
      this.route("teams");
      this.route("integrations");
    });
  });
  this.resource("account", function () {
    this.route("sshKeys");
    this.route("notifications");
    this.route("billing");
  });
});
```

In Cherrytree, being in a certain state of your app means that several Routes are active. For example, if you're at `app.com/QubitProducts/cherrytree/commits` - the list of active routes would look like `['application', 'repository', 'commits', 'commits.index']`. You can define behaviour of each route by extending `cherrytree/route` and registering the routes in the `router.routes` hash. 

Application route could render the outer shell of the application, e.g. the nav and container for child routes, it could also initialize some base models, e.g. user model. The repository route would load in the repository model from the server based on the URL params, the `commits.index` would load the specific commit model and render that out.

# Benefits of using Cherrytree

* switching between pushState or hashState is trivial - all urls in your app are generated the right way depending on which mode you're in
* generating links everywhere in your application is simple and systematic, e.g. `router.generate("commit.index", "1e2760")`
* route identifiers are decoupled from URL paths which means you can rename URL segments without having to change the names of routes and rewriting all links (e.g. if you want `account` to be called `profile`)
* it's possible to load parts of your app on demand via `preload` hook in the route map
* a router is a missing peace in an MVC architecture - a place where model and view lifecycle is managed - e.g. destroy and cleanup views when navigating between different parts of the application 
* support for query params
* flexible error handling and displaying of loading screens
* transition is a first class citizen - abort, pause, resume, retry failed ones. E.g. display pause the transition to display "There are unsaved changes" message if the user clicked some link on the page or used browser's back/forward buttons
* it's not coupled to browser URLs - e.g. use multiple routers to manage substates of your application
* it's possible to navigate around your app programatically - URL management is just an optional side effect
* you can replace the URL management library - use none if you don’t need to touch the URL
* built on top of `router.js`, `route-recognizer` and `rsvp` from Ember

# Installation

Cherrytree supports both AMD and CJS. It's on `bower` and on `npm`. If you're using bower - you'll need to figure out how to setup all of the paths to cherrytree and it's dependencies. With npm - just require away.

# Docs

This covers the basic usage and the API of Cherrytree. For introduction to more concepts check out the [Ember.js Routing Guide](http://emberjs.com/guides/routing/) - the API there is slightly different, but a lot of concepts are similar.

## Basic Example

```js
var $ = require("jquery");
var Router = require("cherrytree");
var Route = require("cherrytree/route");

// for router to keep the app's state in sync with the url
// we need to use a custom location, the default `none` location
// doesn't touch the URL. This allows you implementing your own
// URL manager say if you want to save some space, or you already
// use a framework that can manage URLs like Backbone.
// The default HistoryLocation is a powerful url manager based on
// backbone's router - it supports pushState, hashState and
// can automatically fallback to hashState for browsers that don't
// support pushState
var HistoryLocation = require("cherrytree/location/history_location");

var Post = function () {};
Post.prototype.fetch = function () {};
Post.prototype.get = function () { return "Hello cherrytree"; };

// create the router
var router = new Router({
  location: new HistoryLocation()
});

// your route map
router.map(function () {
  this.resource("post", {path: "/post/:postId"}, function () {
    this.route("show", {path: "/"});
    this.route("edit")
  });
});

// your routes
// application route is always the root route
router.routes["application"] = Route.extend({
  activate: function () {
    this.view = $("<div><h1>My Blog</h1><div class='outlet'></div></div>");
    $(document.body).html(this.view);
  }
});
// let's load in the model
router.routes["post"] = Route.extend({
  model: function (params) {
    var post = new Post({
      id: params.postId
    });
    this.setContext({post: post});
    return post.fetch();
  },
  activate: function () {
    this.outlet = this.parent.view.find(".outlet");
  }
});
// and display it
router.routes["post.show"] = Route.extend({
  activate: function () {
    this.view = $("<p>" + this.get("post").get("content") + "</p>");
    this.parent.outlet.html(this.view);
  },
  deactivate: function () {
    this.view.remove();
  }
});

// let's do this!
router.startRouting();

// programatically navigate to the `posts.show` page.
router.transitionTo('post.show', 42);
```

Check out [http://requirebin.com/?gist=11292543](http://requirebin.com/?gist=11292543) to see this example in action.

## Route IDs

After the router is initialized every route gets an ID generated based on the hierarchy of the routes. These IDs can be used when registering route handlers, performing transitions or generating links.

Every cherrytree application has the default topmost route with an ID `application`. That's a good spot for implementing application wide behaviour, creating global models, e.g. user model. You can specify an application route handler like so

```js
router.routes["application"] = Route.extend({
  model: function () {
    this.setContext({user: new User()})
  }
});
```

Now all child routes can access the user object by calling `this.get("user")`.

In the route map, we can define top level routes, resources and resource routes. Resources can be nested. Here's an example of all possible types of routes.

```js
router.map(function () {
  this.route("issues");
  this.resource("settings", function () {
    this.route("teams");
    this.route("integrations");
    this.resource("tokens", function () {
      this.route("applications");
      this.route("integrations");
    })
  });
});
```

An ID of a top level route is just the name of the route, e.g. `issues`. To generate a link to that route call `router.generate("issues");`.

An ID of a top level resource is also the name - for example `settings`.

An ID of a resource route is constructed by joining resource name with the route name, e.g. `settings.teams` and `settings.integrations`.

The nested resource IDs don't inherit the names of the parent resources. So in this case the IDs of the nested resource and nested resource routes are `tokens`, `tokens.applications` and `tokens.integrations`.

Every resource has an implicit `index` route. Generating a link or transitioning to a resource is equivalent of generating the link to the `index` route of that resource. For example `router.transitionTo("tokens")` is the same as `router.transitionTo("tokens.index")`.

## Router

### var router = new Router(options)

Create a router.

* options.location - default is NoneLocation. Use HistoryLocation if you want router to hook into the URL (see example above)
* options.logging - default is false
* options.BaseRoute - default is `cherrytree/route`. Change this to specify a different default route class that will be used for all routes that don't have a specific class configured
* options.map - specify the route map
* options.resolver - specify a custom route resolver. Default resolver loads the routes from the router.routes by name `function (name, cb) { cb(router.routes[name]); }`
* options.routes - a hash specifying your route classes. Key is the name of the route, value is the route class
* options.onURLChanged - e.g. function (url) {}
* options.onDidTransition: function (path) {}

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

### router.routes hash

This is where you register all your custom route classes. Each route in your route map can have specific behaviour, such as loading data and specifying how to render the views. Each resource in the map can have an associated route class, the name of the resource is what you use to attach the route class to it, e.g. `post`. Each route in the map has a name that can be created by combining the name of the resource and the route, e.g. `post.show`. Top level route names don't include a prefix, e.g. `about`. There are a couple of special routes that are always available - `application` and `loading`.

```js
var Route = require('cherrytree/route');

router.routes['post.show'] = Route.extend({
  model: function () {
    return $.getJSON('/url');
  },
  activate: function (data) {
    // render data
  }
});
```

### router.startRouting()

After the router has been configured with a route map and route classes - start listening to URL changes and transition to the appropriate route based on the current URL.

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

The Route class should be extend to create specific routes.

```js
var route = Route.extend({...})
```

Within a route you can access the router via `this.router`.

## Route Hooks

These are all of the hooks that you can implement in the routes.

### initialize(options)

Will be called upon constructing the route - only once per application lifetime. The passed in options will contain the `router` instance and the `name` of the route. Options are also set at `route.options`.

### beforeModel(transition)

Useful for route entry validations and redirects if we don't want to proceed. Return a promise to block the loading of further route model hooks.

### model(params, transition)

Useful for loading in data. Query params can be found at `params.queryParams`. Return a promise to block the loading of further route model hooks.

### afterModel(context, transition)

The first param is the context of the route.

### activate(context, transition)

The first param is the route's context. This is called on each route starting at the root after all model hooks have been resolved. If during a transition the route is already active and the params/context hasn't changed - activate won't be called for those routes. This is where you should render your views (if any)

### deactivate()

If the route is not needed anymore it will be deactivated. This is where you should cleanup your views.

### update(context, transition)

If the route is already active, but the context of the route or some parent route has changed, the update will be called first to check if the route wants to handle this update without having to `deactivate` and `activate` again. That is useful when you can rerender the view when data updates instead of destroying it and recreating it. Return `false` in this hook if you want to indicate that you can't handle the graceful update and want to fallback to reactivating the route.

### queryParamsDidChange(changed, all, removed)

If the right set of routes is already active and query params change, the queryParamsDidChange method will be called on each route to let them update. Return false to stop propagation of this event. Call `this.refresh()` if you just want to reactivate this route (including the model hook).

### willTransition(transition)

Called when router is about to transition. You can abort the transition using `transition.abort()`, e.g.

```js
willTransition: function (transition) {
  transition.abort();
  this.t = transition;
  if (confirm("You have unsaved changed")) {
    this.t.retry();
  }
}
```

This is also an event that bubbles up to the root starting at the child route - return false to stop propagation.

### error(err)

Called when transitioning fails. This is an event that bubbles up to the root starting at the route that caused the error while transitioning meaning it's called on each route. Return false to stop propagation.

## Route Methods

These are all of the methods that you can call on your route (e.g. from within the route hooks)

### route.setContext

Set route's context. It's useful to set route's context when you want it to be accessible by children routes. `route.get` method makes it easy to access context of parent routes. The context is also passed as the first argument to the `route.activate` hook.

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
      example: this.get('postId') // grabbed from the parent route instance
      test: this.get('test') // grabbed from this route's instance
    });
    this.parent.view.$('.outlet').html(view.render().el);
  }
});
```

### route.refresh()

Reenter all the routes starting at this route.

### route.transitionTo()

An alias to `this.router.transitionTo`.

### replaceWith

An alias to `this.router.replaceWith`.



## HistoryLocation

Cherrytree can be configured to use differet implementations of libraries that manage browser's URL/history. By default, Cherrytree will use `location/none_location` which means browser's URL/history won't be managed at all, and navigating around the application will only be possible programatically. However, Cherrytree also ships with a very versatile `location/history_location` which uses `location-bar` module to enable `pushState` or `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities. What his means is that out of the box cherrytree can hook into browser's URL for managing your application's state. Here's an example of how to use this functionality:

```js
  var Router = require("cherrytree");
  var HistoryLocation = require("cherrytree/location/history_location");

  var router = new Router({
    location: new HistoryLocation({
      pushState: true
    })
  });
```

As you can see you can also provide your own implementation of location. For example, if you're already using `Backbone`, you might wanna use `Backbone.History` to manage the `hashChange` events and you could easily hook that into Cherrytree.

### var location = new HistoryLocation(options)

Create an instance of history location. Note that only one instance of HistoryLocation should be created per page since it's managing the browser's URL.

* options.pushState - default is false, which means using hashchange events. Set to true to use pushState.
* options.root - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.
* options.interceptLinks - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. Appropriate link clicks are links that are clicked with the left mouse button with no cmd or shift key. External links, `javascript:` links, links with a `data-bypass` attribute and links starting with `#` are not intercepted.


## Custom resolvers

By default, cherrytree always look at your `router.routes` hash to find all the route classes. However, you can override the resolver to load routes from anywhere else. That is especially useful if you want to be loading your routes asynchronously. It's possible to override the global resolver or specify a per route/resource resolver in the route map. For example, if we wanted to load each route asynchronously using AMD style require, we could do this:

```js
var router = new Router({
  resolver: function (name, cb) {
    require(["app/routes/" + name + ".route.js"], function (Route) {
      cb(Route);
    });
  },
  map: function () {
    this.resource("branches", function () {
      this.route("stale");
      this.route("merged");
    });
  }
});
```

Now the right routes will only be resolved if needed by a given transition, e.g. `router.transitionTo('branches.merged')` would load `app/routes/application.route.js`, `app/routes/branches.route.js` and `app/routes/branches.merged.route.js`, but would not load the `app/routes/branches.stale.route.js`. This allows splitting your application into multiple bundles.


# Changelog

## 0.4.0

* Simplified how route contexts are handled. Route's context should now be set using the new `route.setContext` method. It can then be retrieved using `route.getContext` or individual fields can be accessed by using `route.get`. `route.get` also traverses all parent routes when looking for a context field. The context is also passed into the activate hook as the first argument. Breaking changes:
  * `route.get` no longer looks at route attributes when looking up fields
  * the return value of `route.model` hook is not set as context any longer, it's only used to block the loading of children routes
* Made update hook simple for common cases by flipping the meaning of the return value - returning false now continues with reactivating the route, returning anything else assumes update handled the reactivation.

## 0.3.0

* Global and per route/resource resolvers allow loading in each route asyncronously on demand. Read more about it in the "Custom resolvers" section. `addRoute` and `addRoutes` methods have been removed. The default global resolver expects the routes to be added to the `router.routes` hash.

## 0.2.1

* Fix: don't exit the loading route during redirects

## 0.2.0

* A major rewrite. Simplify code, route lifecycle, API and many other things. Route instances are now singletons that say around for the lifetime of the application. This rewrite fixes many issues such as redirecting midst transition and transitions between similar states with different params at the parent routes.
* Upgrade to the latest versions of `router.js`, `route-recognizer` and `rsvp`.
* queryParam changes - queryParams are now passed via `params.queryParams`. Transitions that only change queryParams fire a `queryParamsDidChange` event.
* `interceptLinks` feature for a seamless pushState experience - previously this had to be implemented externally.
* documentation!

## 0.1.3.

* Fix double `router.urlChanged` calls, only called once per transition now

## 0.1.2

* Fix query param support by updating to `location-bar@2.0.0-beta.1`.