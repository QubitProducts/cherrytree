### v2.0.0-rc4

* BrowserLocation and HistoryLocation can now be accessed at cherrytree.BrowserLocation and cherrytree.MemoryLocation again. This is to make it easier to use those modules for UMD users (#116).

### v2.0.0-rc3

Breaking changes:

* `HistoryLocation` has been renamed to `BrowserLocation`. Location in cherrytree is the place that stores the current location of the app. Location is updated with the new path when cherytree transitions. Location also triggers updates when someone changes the location externally (e.g. by navigating with back/forward buttons or updating the URL). `BrowserLocation` is a more apt name since this location implementation represents browser's location bar and is configurable to use pushState or hashchange. This way, the other location that ships with cherrytree, `MemoryLocation`- also makes more sense, in this case we're saying the URL is simply stored in this in memory object and not really connected to the browser (which is what makes it useful on the server, for example).

### v2.0.0-rc2

* Fix: query params were stringified incorrectly when more than 2 params and when some of params were undefined. `router.generate('/a/b/c', {}, { id: 'def', foo: 'bar', baz: undefined })` results in `/a/b/c?id=def&foo=bar` now as in the older versions of cherrytree.

### v2.0.0-rc1

Breaking changes:

* Every route is now routable. Previously it was only possible to generate links and transition to leaf routes. This simplifies the typical usage of the router and opens up new use cases as well. For example, if you want to redirect from '/' to '/some/:id', it's now easier to implement this kind of redirect behaviour without needing to create many reduntant '.index' routes.
* The special `.index` treatment has been removed. Previously, if the route name ended with `.index`, the path was automatically set to ''. Now, such path will default to 'index' as with all other routes. Set `path: ''` on your index routes when upgrading.
* An exception is now thrown when multiple routes have the same URL pattern.
* Given all the above changes - a new route option `abstract: true` was introduced for making non leaf routes non routable. This also solves the problem where using `path: ''` would result in multiple routes with the same path.
* The `paramNames` array (e.g. ['id', 'filter']) was replaced with `params` object (e.g. {id: 1, filter: 'foo'}) in the route descriptor on the transition object.
* The `ancestors` attribute was removed from the route descriptor.
* Switching between using `history` and `memory` locations has been simplified. Previously, you'd need to pass `new MemoryLocation(path)` when calling `listen`. Now, specify the location to use with `location: 'memory'` when creating the router and pass the path when calling `listen`.
* The `qs` module was removed from dependencies and was replaced with a tiny, simple query string parser. This can be sufficient for a lot of applications and saves a couple of kilobytes. If you want to use `qs` or any other query parsing module, pass it as `qs: require('qs')` option to the router.
* params, query and route array are now immutable between transitions, i.e. modifying those directly on the transition only affects that transition
* Drop out-of-the-box support for ES3 environments (IE8). To use Cherrytree in older environments - es5 polyfills for native `map`, `reduce` and `forEach` need to be used now.
* An undocumented, noop function `reset` was removed from the router.

New features:

* Support for custom [click intercept handlers](docs/api.md#intercepting-links)

Under the hood improvements:

* Update all dependencies to the latest versions
* Tests are being run in more browsers now
* Replaced `co` with `babel-creed-async` in tests
* Removed the dependency on `lodash`

Documentation:

* Moved docs back to a separate [`docs/api.md`](docs/api.md) file
* Documented [router.matchers](docs/api.md#routermatchers)
* Documented [404 handling](docs/api.md#handling-404)

### v2.0.0-alpha.12

* BYOP - Cherrytree now requires a global Promise implementation to be available or a Promise constructor passed in as an option

### v2.0.0-alpha.11

* Add `transition.redirectTo` so that middleware could initiate redirects without having the router

### v2.0.0-alpha.10

* Log errors by default (i.e. options.logError: true by default)

### v2.0.0-alpha.9

* Fix router.destroy() - DOM click events for link interception are now cleaned up when router.destroy() is called
* Add server side support
  * events.js now exports an {} object on the server instead of crashing due to missing `window`
  * MemoryLocation correctly handles option flags and can be instantiated with a starting `path`
* Add a [server-side-react example](../examples/server-side-react)
* When transition is rejected with a `TransitionRedirected` error - the `err.nextPath` is now available)

### v2.0.0-alpha.8

* Fix dependencies - lodash was declared as a devDependency

### v2.0.0-alpha.7

* Fix the URL generation when `pushState: true` and root !== '/'

### v2.0.0-alpha.1

A brand new and improved cherrytree!

### v0.x.x

See https://github.com/QubitProducts/cherrytree/tree/677f2c915780d712968023b8d24306ff787a426d