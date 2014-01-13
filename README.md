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


TODO
  * docs
  * tests :-", I know, I know..
  * look into removing dependency on underscore
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