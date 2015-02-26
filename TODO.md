- [x] convert example to webpack
- [x] create a react example
- [x] rename abort to cancel
- [x] remove usage of the Backbone regexes and route matching, use the react-router Path code instead
- [x] implement queryParams
- [x] prove that resolver middleware is possible
- [ ] implement redirecting (unhandled rejection is currently thrown)
- [ ] consider providing a reference to the parent route object
- [ ] fix trailing slash bug
- [ ] prove that all this works using mdashboard
- [ ] unit test some of the stuff
- [ ] scenario test the router
- [ ] implement aborting/resuming transitions
- [ ] prove that redirects can be handled effectively in the model middleware
- [ ] make sure transition and route descriptors are immutable (modifyng route descriptors only affect that transition), but doesn't modify the state of the router. Perhaps transition could be completely immutable, you could instead return stuff in the middleware to pass data on, e.g. the resolved RouteHandlers.
- [ ] make sure the route options are attached to the route descriptors in transitions
- [ ] make sure that joining patterns from routes is done correctly (the react-router way)
- [ ] make sure splats work
- [ ] implement optional params / optional splats
- [ ] check if we still need `update` hook...
- [ ] handle matchPoint computation + annotating what changed in each route (previouslyActive | paramsChanged, queryParamsChanged)
- [ ] make sure router errors are logged loudly
- [ ] make sure handler errors are logged loudly (i.e. errors from the dispatchHandlers)
- [ ] make error reporting consistent for checking invariants, etc.
- [ ] detect noop transitions
- [ ] avoid pulling in when or lodash (location-bar is fine, install Promise as npm dep)



- [ ] proof of concept backend example



- [ ] create examples folder where various middlewares are demonstrated
- [ ] write a blogpost draft about the journey to 2.0 (sketchy bulletpoints)
- [ ] support CJS and AMD... (will need to do smth about qs)
- [ ] lower level createRoute function that takes location, qs and Promise implementations as params and this way avoids pulling them in as dependencies.
- [ ] add a code example in the README
- [ ] add the size of the lib to README
- [ ] update docs
- [ ] create cherrytree-for-backbone
- [ ] create cherrytree-for-react
- [ ] consider using path-to-regexp
- [ ] create a backbone example (the backbone-route workflow)
- [ ] a function for listing all possible routes (leaf routes with their patterns)