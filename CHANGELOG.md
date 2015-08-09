### v2.0.0-alpha.9

* Fix router.destroy() - DOM click events for link interception are now cleaned up when router.destroy() is called
* Add server side support
  * events.js now exports an {} object on the server instead of crashing due to missing `window`
  * MemoryLocation correctly handles option flags and can be instantiated with a starting `path`
* Add a [server-side-react example](../examples/server-side-react)
* When transition is rejected with a `TransitionRedirected` error - the `err.nextPath` is now available
* Log errors by default (i.e. options.logError: true by default)

### v2.0.0-alpha.8

* Fix dependencies - lodash was declared as a devDependency

### v2.0.0-alpha.7

* Fix the URL generation when `pushState: true` and root !== '/'

### v2.0.0-alpha.1

A brand new and improved cherrytree!

### v0.x.x

See https://github.com/QubitProducts/cherrytree/tree/677f2c915780d712968023b8d24306ff787a426d