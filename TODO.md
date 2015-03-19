- [x] convert example to webpack
- [x] create a react example
- [x] rename abort to cancel
- [x] remove usage of the Backbone regexes and route matching, use the react-router Path code instead
- [x] implement queryParams
- [x] prove that resolver middleware is possible
- [x] make sure that joining patterns from routes is done correctly (the react-router way)
- [x] make sure router errors are logged loudly
- [x] make sure handler errors are logged loudly (i.e. errors from the dispatchHandlers)
- [x] log every middleware upon start/end (log function name)
- [x] log transition start/end
- [x] log redirects / cancel
- [x] implement redirecting (unhandled rejection is currently thrown)
- [x] implement cancelling/resuming transitions
- [x] make sure the route options are attached to the route descriptors in transitions
- [x] fix trailing slash bug
- [x] prove that all this works using mdashboard
- [x] prove that redirects can be handled effectively in the model middleware
- [x] make sure transition and route descriptors are immutable (modifyng route descriptors only affect that transition), but doesn't modify the state of the router. Perhaps transition could be completely immutable, you could instead return stuff in the middleware to pass data on, e.g. the resolved RouteHandlers.
- [x] make error reporting consistent for checking invariants, etc.
- [x] add (standard) linting
- [x] throw a warning when middleware returns a transition, since that's basically a deadlock
- [x] check if we still need `update` hook...
- [x] separate params and queryParams objects, rename things to path, pathname, params, query
- [x] rename prev* to prev.
- [x] unit test some of the stuff
- [x] implement named splats
- [x] implement optional params
- [x] implement optional splats
- [x] consider using path-to-regexp
- [ ] detect noop transitions
- [ ] scenario test the router
- [ ] proof of concept backend example



- [ ] throw a more specific error when trying to transitionTo/generate a route that is not a leaf node
- [ ] a function for listing all possible routes (leaf routes with their patterns)
- [ ] add transition.followRedirects()
- [ ] lower level createRoute function that takes location, qs and Promise implementations as params and this way avoids pulling them in as dependencies.
- [ ] add a code example in the README
- [ ] avoid pulling in when or lodash (location-bar is fine, install Promise as npm dep)
- [ ] add the size of the lib to README
- [ ] update docs
- [ ] support CJS and AMD... (will need to do smth about qs)
- [ ] create a backbone example (the backbone-route workflow)
- [ ] create cherrytree-for-backbone
- [ ] create cherrytree-for-react
- [ ] create examples folder where various middlewares are demonstrated
- [ ] write a blogpost draft about the journey to 2.0 (sketchy bulletpoints)
- [ ] a better name for generate



- [x] consider making transitions not promises (since it's complicated when it comes to redirects, etc.). Instead have 1 global error handler (or many like middlewares). It gets called if transition fails. Also, each .use() can take another callback for when transition is cancelled/redirected (?). Finally, the last .use callback to get called basically indicates that the transition completed. Other than that, there is no other callback?
- [x] consider passing in error handlers to the .use, or have a .error middleware (an alternative to .then on transitions)
- [x] consider providing a reference to the parent route object
- [x] consider handling matchPoint computation + annotating what changed in each route (previouslyActive | paramsChanged, queryParamsChanged)