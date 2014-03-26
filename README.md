# Cherrytree

![build status](https://www.codeship.io/projects/bb769230-5ec0-0131-1b78-16ee4fa09096/status)

Cherrytree is a hierarchical router for JavaScript applications.

# Motivation

The main idea is to describe all the different parts of your application in a route map. Those could be the different pages if you have multiple pages in your app, or different states of your UI, some panel expanded, or lightbox displayed - anything that you want to have a URL for. URLs are very important for web apps - reloading the page should display the UI in the same state as it was before, people should be able to share urls, etc.(link to URL talk by tomdale).

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

In Cherrytree, being in a certain state of your app means that several Routes are active. For example, if you're at `app.com/KidkArolis/cherrytree/commits` - the list of active routes would look like `['application', 'repository', 'commits', 'commits.index']`. You can define behaviour of each route by extending `cherrytree/route`. Application route could render the outer shell of the application, e.g. the nav and container for child routes, it could also initialize some base models, e.g. user model. The repository route would load in the repository model from the server based on the URL params, the `commits.index` would load the specific commit model and render that on the screen.

With cherrytree - routes become the central part of how you compose the application - routes are where you create models, views and manage their lifecycle.

Why you should be using Cherrytree?

* switching between using pushState or hashState is trivial - all urls in your app are generated the right way depending on which mode you're in
* generating links everywhere in your application is easy and systematic, e.g. `router.generate("commit.index", "1e2760")`
* decoupled route ids from URL paths means renaming URL segments is easy (e.g. if you want `account` to be called `profile`)
* easy to load parts of your app on demand
* a missing peace in your MVC architecture - a place where model and view lifecycle is managed - e.g. destroy and cleanup views when navigating between different parts of the application 
* support for query params
* flexible error handling and displaying of loading screens
* transition is a first class citizen - abort, pause, resume, retry failed ones. E.g. display pause the transition to display "You have unsaved changes" message no matter if the user clicked another link on the page, or used browser back/forward buttons
* it's not coupled to URLs - e.g. use multiple routers to manage substates of your application
* it's possible to navigate around your app programatically - URL management is just an optional sideeffect
* swappable URL management libraries - none if you don’t need one
* built on top of `router.js`, `route-recognizer` and `rsvp` from Ember


Cherrytree is built on top of [tildeio/router.js](https://github.com/tildeio/router.js) which is a micro library extracted from Ember. Cherrytree is based on Ember's own router, but is made to be independant of the framework and has a slightly different take on Route's lifecycle.


## Install

Cherrytree supports both AMD and CJS. It's on bower and on npm. If you're using bower - you'll need to figure out how to setup all of the paths to cherrytree and it's dependencies. With npm - just require away.

# Docs

## Basic Example

```js
var Router = require("cherrytree");
var Route = require("cherrytree/route");
var HistoryLocation = require("cherrytree/locations/history");

// for router to keep the app's state in sync with the url
// we need to use a custom location, the default `none` location
// doesn't touch the URL. This allows you implementing your own
// URL manager say if you want to save some space, or you already
// use a framework that can manage URLs like Backbone.
// The default HistoryLocation is a powerful url manager based on
// backbone's router - it supports pushState, hashState and
// can automatically fallback to hashState for browsers that don't
// support pushState

// create the router
var router = new Router({
  location: new HistoryLocation({
    pushState: false
  })
});

// your route map
router.map(function () {
  this.resource("post", {path: "/:postId"}, function () {
    this.route("show");
    this.route("edit")
  });
});

// your routes
// application route is always the root route
router.addRoute("application", Route.extend({
  activate: function () {
    this.view = $("<h1>My Blog</h1><div class='outlet'></div>");
    $(document.body).html(this.view);
  }
}));
// let's load in the model
router.addRoute("post", Route.extend({
  model: function (params) {
    this.post = new Post({
      id: params.postId
    });
    return this.post.fetch();
  }
}));
// and display it
router.addRoute("post.show", Route.extend({
  activate: function () {
    this.view = $("<p>" + this.get("post").get("content") + "</p>");
    this.parent.view.$(".outlet").html(this.view);
  },
  deactivate: function () {
    this.view.remove();
  }
}));

// let's do this!
router.startRouting();

// programatically navigate to the `posts.show` page.
router.transitionTo('posts.show', 42);
```

Go to the `cherrytree-reactjs-demo` for a more realistic example.


## Router

Creating a router.

### constructor

The available options are

```js
new Router({
  location: new NoneLocation() | new HistoryLocation(),
  logging: true,
  onURLChanged: function (url) {

  },
  onDidTransition: function (path) {

  }
});
```

### map

### addRoute

### addRoutes

### transitionTo

### replaceWith

### startRouting

### activeRoutes

List currently active route instances. Recommended to only use this for debugging.

### activeRouteNames

List currently active route names. Recommended to only use this for debugging.

## Route

### constructor

These are all of the hooks that you can implement in the routes.

### initialize
### beforeModel
### model
### afterModel
### activate
### deactivate
### update
### events.error
### events.willTransition
### events.queryParamsDidChange

These are all of the methods that you can call on your route (e.g. from within)

### get
### refresh
### transitionTo
### replaceWith

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

* options.pushState - default is true. Whether to use pushState, set false for hashState.
* options.root - default is `/`. Use this if your application is not being served from the root url /.
* options.interceptLinks - default is true. When pushState is used - intercepts all link clicks when appropriate, prevents the default behaviour and instead uses pushState to update the URL and handle the transition via the router. Appropriate link clicks are links that are clicked with the left mouse button with no cmd or shift key. External links, `javascript:` links, links with a `data-bypass` attribute and links starting with `#` are not intercepted.

### getURL



## Changelog

### 0.2.0

* A major rewrite. Simplify code, route lifecycle, API and many other things. Route instances are now singletons that say around for the lifetime of the application. This rewrite fixes many issues such as redirecting midst transition and transitions between similar states with different params at the parent routes.
* Upgrade to the latest versions of `router.js`, `route-recognizer` and `rsvp`.
* queryParam changes - queryParams are now passed via `params.queryParams`. Transitions that only change queryParams fire a `queryParamsDidChange` event.
* `interceptLinks` feature for a seamless pushState experience - previously this had to be implemented externally.

### 0.1.3.

* Fix double `router.urlChanged` calls, only called once per transition now

### 0.1.2

* Fix query param support by updating to `location-bar@2.0.0-beta.1`.