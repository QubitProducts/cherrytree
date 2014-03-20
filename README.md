# Cherrytree

![build status](https://www.codeship.io/projects/bb769230-5ec0-0131-1b78-16ee4fa09096/status)

Cherrytree is an awesome hierarchical stateful router for JavaScript applications.

It's build on top of [tildeio/router.js](https://github.com/tildeio/router.js) which is a micro library extracted from Ember. Cherrytree is based on Ember's own router, but is made to be independant of the framework and has a slightly different take on what a State/Route is.

Cherrytree is AMD and a bower component.

## Location

Cherrytree can be configured to use differet implementations of libraries that manager browser's URL/history. By default, Cherrytree will use `location/none_location` which means browser's URL/history won't be managed at all, and navigating around the application will only be possible programatically. However, Cherrytree also ships with a very versatile `location/history_location` which uses `location-bar` module to enable `pushState` or `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities. What his means is that out of the box cherrytree can hook into browser's URL for managing your application's state. Here's an example of how to use this functionality:

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

## API

The following methods have been added to provide an easy way to access entities within your application, mostly for debugging purposes during dev time. I haven't consider how these methods should/shouldn't be used in application logic.

### activeStates()

Get the list of currently active state objects, e.g.

### activeStateNames()

Get the list of currently active state ids.

### activeState(id)

Get a specific currently active state object, e.g.

```
// an easy way to access resources within the state like models and views
router.activeState("posts.show").model.get("name");
```


## Changelog

### 0.1.2

* Fix query param support by updating to location-bar 2.0.0.

### 0.1.3.

* Fix double `cherrytree.urlChanged` calls, only called once per transition now


TODO
  * docs
  * remove dependency on underscore
  * look into submitting tildeio packages into bower
  * figure out if it's really useful to have State instead of just using handlers
  * figure out why we can't transitionTo within activate while transitioning
    it seems that the only good place for redirecting is afterModel
  * using transitionTo("some.state", {param1: 1}) doesn't work well, possibly dissalow
    this usage for now completely and only allow the new transitionTo("some.state", 1).
    I think this makes some sense, in case we wanna be able to pass in models like route.js
    intended this feature to be used.
  * consider pulling in router.js and route-recognizer as vendored dependencies
  * refactor and simplify get_handler_function - avoid using closure variables, instead keep state on the handler object
  * don't pass in params as a top level object to the state constructor, pass them in as {params: params, queryParams, queryParams, router: router}
  * write a test re "identicalTransition" when params are different
  * rename destroy to deactivate - it's an opposite action to activate, not to initialize - routes are never destroyed
  * ensure routes are exited right to left when something in the middle is reactivated
  * finish cherrytree-abyssa-demo + webpack + npm install
  * make a cherrytree-reactjs-demo + webpack + npm install
  * publish cherrytree to npm and make sure both bower install cherrytree and npm install cherrytree work out of the box - document the path config, etc.
  * consider cherrytree-standalone.js for jsbins or so. Alternatively requirebin should be fine.
  * add interceptLinks method to the router / history location or somewhere
  * update semantics - existance of update method should indicate that the route won't be reloaded, returning false overrides that behaviour
  * document how to do 404s using /*path
  * document how to do redirects in beforeModel (or anywhere else) using this.router.transitionTo
  * document transitionTo vs replaceWith
  * document get method - explain it's experimental - it's important to be able to access parent models, but not clear of the best way yet
  * consolidate router.js logging and cherrytree logging into the same system somehow


## Roadmap

* explore triggering events on routes that bubble up (a bit like error and willTransition events), this way less need to access parent things like this.parent.view, etc.
* explore a way to activate a state right after it's model is fetched without waiting for child states. Atm it's possible to just call `this.activate()` in the model manually, but if a transition away from this route occurs, cherrytree won't deactivate the route as it was never entered (?). Latest versions of router.js has the substates, so those might be the answer.
* explore a way to call model on multiple routes at once - sometimes we can parallelize the model calls.


# v0.2 design doc
  
get_handler.js

similar to how it's now, except no closure variables, it immediately returns an object either from cache, or puts one there. That object proxies all methods into the route instance which it contains at this.route. This.route is created when model is called via prepare mechanism. Once this.route exists, the before model is created everywhere. Perhaps we could even create this.route in the beforeModel. If this.route is loaded, then we skip this step.. Crazy? Might work..
