# Changelog

## 0.5.0

* New shiny docs.
* Renamed `cherrytree/location/history_location` to `cherrytree/locations/history`
* Renamed `cherrytree/location/none_location` to `cherrytree/locations/none`

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