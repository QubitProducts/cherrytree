Cherrytree is an awesome hierarchical stateful router for JavaScript applications.

It's build on top of [tildeio/router.js](https://github.com/tildeio/router.js) which is a micro library extracted from Ember. Cherrytree is based on Ember's own router, but is made to be independant of the framework and has a slightly different take on what a State is.

Cherrytree is AMD and a bower component.

TODO
  * docs
  * tests :-"
  * look into removing depdendency on underscore
  * look into submitting tildeio packages into bower
  * figure out if it's really useful to have State instead of just using handlers
  * figure out why we can't transitionTo within activate while transitioning
    it seems that the only good place for redirecting is afterPrepare
  * using transitionTo("some.state", {param1: 1}) doesn't work well, possibly dissalow
    this usage for now completely and only allow the new transitionTo("some.state", 1).
    I think this makes some sense, in case we wanna be able to pass in models like route.js
    intended this feature to be used.