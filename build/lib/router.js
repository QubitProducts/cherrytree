'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _dash = require('./dash');

var _qs = require('./qs');

var _qs2 = _interopRequireDefault(_qs);

var _path = require('./path');

var _path2 = _interopRequireDefault(_path);

var _invariant = require('./invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _transition = require('./transition');

var _transition2 = _interopRequireDefault(_transition);

var _links = require('./links');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _locationsBrowser = require('./locations/browser');

var _locationsBrowser2 = _interopRequireDefault(_locationsBrowser);

var _locationsMemory = require('./locations/memory');

var _locationsMemory2 = _interopRequireDefault(_locationsMemory);

var Cherrytree = (function () {
  function Cherrytree(options) {
    var _this = this;

    _classCallCheck(this, Cherrytree);

    this.options = (0, _dash.extend)({
      location: 'browser',
      interceptLinks: true,
      pushState: true,
      Promise: Promise,
      qs: _qs2['default']
    }, options);

    var _options = this.options;
    var routes = _options.routes;
    var middleware = _options.middleware;
    var log = _options.log;
    var location = _options.location;

    (0, _invariant2['default'])(typeof this.options.Promise === 'function', 'ES6 Promise implementation is required as an explicit option or a global Promise');

    this.state = {
      nextId: 1,
      lastTransition: null,
      currTransition: null,
      nextTransition: null
    };

    if (routes) {
      this.map(routes);
    }

    this.middleware = [];
    if (middleware) {
      middleware = (0, _dash.isArray)(middleware) ? middleware : [middleware];
      middleware.map(function (m) {
        return _this.use(m);
      });
    }

    this.log = (0, _logger2['default'])(log);
    this.location = this.createLocation(location);
  }

  /**
   * Add a middleware
   * @param  {Function}  middleware
   * @return {Object}    router
   * @api public
   */

  _createClass(Cherrytree, [{
    key: 'use',
    value: function use(createMiddleware) {
      var router = this;
      var middleware = createMiddleware(router);
      if (typeof middleware === 'function') {
        middleware = { next: middleware };
      }
      if (!middleware.name) {
        middleware.name = createMiddleware.name || middleware.next.name;
      }
      this.middleware.push(middleware);
      return this;
    }

    /**
     * Add the route map
     * @param  {Function} routes
     * @return {Object}   router
     * @api public
     */
  }, {
    key: 'map',
    value: function map(routes) {
      // to keep track of unique names
      var names = {};
      // to keep track of unique paths
      var paths = {};

      this.routes = (0, _dash.mapNested)(routes, 'children', function (route) {
        var name = route.name;
        (0, _invariant2['default'])(name, 'Route name is required');
        (0, _invariant2['default'])(name.indexOf('/') === -1, 'Route names can not contain /');
        (0, _invariant2['default'])(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name);

        // remember which names have already been used
        names[name] = true;

        // never mutate input data
        route = (0, _dash.clone)(route);

        // fill in optional paths
        if (typeof route.path !== 'string') route.path = route.name;

        // create a descriptor object that we will be passing to
        // transitions middleware
        route.descriptor = (0, _dash.clone)(route);
        delete route.descriptor.children;

        return route;
      });

      // create the matcher list, which is like a flattened
      // list of routes = a list of all branches of the route tree
      var matchers = this.matchers = [];
      // keep track of whether duplicate paths have been created,
      // in which case we'll warn the dev

      eachBranch({ children: this.routes }, [], function (routes) {
        // concatenate the paths of the list of routes
        var path = routes.reduce(function (memo, r) {
          // reset if there's a leading slash, otherwise concat
          // and keep resetting the trailing slash
          return (r.path[0] === '/' ? r.path : memo + '/' + r.path).replace(/\/$/, '');
        }, '');

        // ensure we have a leading slash
        if (path === '') {
          path = '/';
        }
        // register routes
        matchers.push({
          routes: routes,
          name: routes[routes.length - 1].name,
          path: path
        });

        // duplicate path detection
        var lastRoute = routes[routes.length - 1];
        (0, _invariant2['default'])(!paths[path], 'Routes "%s" and "%s" have the same path %s', paths[path], lastRoute.name, path);
        paths[path] = lastRoute.name;
      });

      function eachBranch(root, memo, fn) {
        root.children.forEach(function (route) {
          if (!abstract(route)) {
            fn(memo.concat(route));
          }
          if (route.children) {
            eachBranch(route, memo.concat(route), fn);
          }
        });
      }

      function abstract(route) {
        return route && route.abstract;
      }

      return this;
    }

    /**
     * Starts listening to the location changes.
     * @param  {Object}  location (optional)
     * @return {Promise} initial transition
     *
     * @api public
     */
  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      var location = this.location;

      // start listening to location events
      location.start();
      // setup the location onChange handler
      location.onChange(function (url) {
        return _this2.dispatch(url);
      });
      // start intercepting links
      if (this.options.interceptLinks && location.usesPushState()) {
        this.interceptLinks();
      }
      // and also kick off the initial transition
      return this.dispatch(location.url());
    }

    /**
     * Stop listening to URL changes
     * @api public
     */
  }, {
    key: 'stop',
    value: function stop() {
      var location = this.location;
      var state = this.state;

      location && location.destroy && location.destroy();
      this.disposeIntercept && this.disposeIntercept();

      if (state.currTransition) {
        state.currTransition.cancel();
        state.lastTransition = null;
        state.currTransition = null;
        state.nextTransition = null;
      }

      return this.options.Promise.resolve();
    }

    /**
     * Transition to a different route.
     * Passe in url or a route name followed by params and query
     *
     * @param  {String}  options.route    route name, url or parametrised url
     * @param  {Object}  options.params   Optional
     * @param  {Object}  options.query    Optional
     * @param  {Boolean} options.replace  Optional
     * @return {Promise}        promise that resolves upon transition completing
     *
     * @api public
     */
  }, {
    key: 'transitionTo',
    value: function transitionTo(options) {
      (0, _invariant2['default'])(options && options.route, '"route" option must be used when calling "transitionTo"');

      var url = this.href(options);
      url = this.location.removeRoot(url);

      var method = options.replace ? 'replace' : 'push';
      if (this.state.currTransition) {
        method = 'replace';
      }

      this.location[method](url, { trigger: false });
      return this.dispatch(url);
    }

    /**
     * Create an href
     *
     * @param  {String} options.route   route name, url or parametrised url
     * @param  {Object} options.params  optional
     * @param  {Object} options.query   optional
     * @return {String}        href
     *
     * @api public
     */
  }, {
    key: 'href',
    value: function href(_ref) {
      var route = _ref.route;
      var _ref$params = _ref.params;
      var params = _ref$params === undefined ? {} : _ref$params;
      var _ref$query = _ref.query;
      var query = _ref$query === undefined ? {} : _ref$query;

      var path = undefined;

      (0, _invariant2['default'])(route, '"route" option must be used when calling "href"');

      if (route.indexOf('/') > -1) {
        path = route;
      } else {
        var matcher = (0, _dash.find)(this.matchers, function (m) {
          return m.name === route;
        });
        (0, _invariant2['default'])(matcher, 'No route is named %s', route);
        path = matcher.path;
      }

      var url = _path2['default'].withQuery(this.options.qs, _path2['default'].injectParams(path, params), query);
      return this.location.format(url);
    }

    /**
     * Check if the given route/params/query combo is active
     * @param  {String} name   target route name
     * @param  {Object} params
     * @param  {Object} query
     * @return {Boolean}
     *
     * @api public
     */
  }, {
    key: 'isActive',
    value: function isActive(_ref2) {
      var route = _ref2.route;
      var _ref2$params = _ref2.params;
      var params = _ref2$params === undefined ? {} : _ref2$params;
      var _ref2$query = _ref2.query;
      var query = _ref2$query === undefined ? {} : _ref2$query;

      var lastTransition = this.state.lastTransition || {};
      var state = (0, _dash.extend)({ routes: [], params: {}, query: {} }, lastTransition.descriptor);

      var isNameActive = function isNameActive() {
        return !route || !!(0, _dash.find)(state.routes, function (r) {
          return r.name === route;
        });
      };
      var areParamsActive = function areParamsActive() {
        return Object.keys(params).every(function (key) {
          return state.params[key] === params[key];
        });
      };
      var isQueryActive = function isQueryActive() {
        return Object.keys(query).every(function (key) {
          return state.query[key] === query[key];
        });
      };

      return isNameActive() && areParamsActive() && isQueryActive();
    }

    /**
     * Match the path against the routes
     * @param  {String} path
     * @return {Object} the list of matching routes and params
     *
     * @api private
     */
  }, {
    key: 'match',
    value: function match(path) {
      path = (path || '').replace(/\/$/, '') || '/';

      var qs = this.options.qs;
      var pathWithoutQuery = _path2['default'].withoutQuery(path);
      var matcher = (0, _dash.find)(this.matchers, function (matcher) {
        return _path2['default'].extractParams(matcher.path, pathWithoutQuery);
      }) || {};
      var routes = matcher.routes || [];

      return {
        routes: routes.map(function (route) {
          return route.descriptor;
        }),
        params: matcher.path && _path2['default'].extractParams(matcher.path, pathWithoutQuery) || {},
        query: _path2['default'].extractQuery(qs, path) || {}
      };
    }

    /**
     * @api private
     */
  }, {
    key: 'dispatch',
    value: function dispatch(path) {
      var router = this;
      var match = this.match(path);
      var query = match.query;
      var pathname = _path2['default'].withoutQuery(path);

      var _state = this.state;
      var currTransition = _state.currTransition;
      var lastTransition = _state.lastTransition;

      if (lastTransition && lastTransition.descriptor.path === path) {
        return this.options.Promise.resolve();
      }

      // if we already have an active transition with all the same
      // params - return that and don't do anything else
      if (currTransition && currTransition.descriptor.pathname === pathname && (0, _dash.isEqual)(currTransition.descriptor.query, query)) {
        return currTransition.promise;
      }

      // otherwise, cancel the current transition
      // and queue up the next transition
      if (currTransition) {
        if (this.state.nextTransition) this.state.nextTransition.cancel('redirect');
        this.state.nextTransition = createTransition();
        currTransition.cancel('redirect');
        return this.state.nextTransition.promise;
      }

      this.state.currTransition = createTransition();
      this.state.currTransition.run(onTransitionDone);

      function createTransition() {
        return (0, _transition2['default'])({
          id: router.state.nextId++,
          path: path,
          match: match,
          router: router
        }, router.options.Promise);
      }

      function onTransitionDone() {
        var _router$state = router.state;
        var lastTransition = _router$state.lastTransition;
        var currTransition = _router$state.currTransition;
        var nextTransition = _router$state.nextTransition;

        if (currTransition.descriptor.state === 'cancelled' && lastTransition) {
          var previousUrl = lastTransition.descriptor.path;
          router.location.replace(previousUrl, { trigger: false });
        }
        router.state.lastTransition = currTransition;
        delete router.state.lastTransition.descriptor.prev;

        router.state.currTransition = null;
        if (nextTransition) {
          router.state.currTransition = nextTransition;
          router.state.nextTransition = null;
          nextTransition.run(onTransitionDone);
        }
      }

      return this.state.currTransition.promise;
    }

    /**
     * Create the default location.
     * This is used when no custom location is passed in options
     *
     * @return {Object} location
     *
     * @api private
     */
  }, {
    key: 'createLocation',
    value: function createLocation(location) {
      if (!(0, _dash.isString)(location)) {
        return location;
      } else if (location === 'browser') {
        return new _locationsBrowser2['default']((0, _dash.pick)(this.options, ['pushState', 'root']));
      } else if (location === 'memory') {
        return new _locationsMemory2['default']();
      } else {
        throw new Error('Location can be `browser`, `memory` or a custom implementation');
      }
    }

    /**
     * When using pushState, it's important to setup link interception
     * because all link clicks should be handled via the router instead of
     * browser reloading the page
     *
     * @api private
     */
  }, {
    key: 'interceptLinks',
    value: function interceptLinks() {
      var _this3 = this;

      var interceptLinks = this.options.interceptLinks;

      var clickHandler = typeof interceptLinks === 'function' ? interceptLinks : defaultClickHandler;
      this.disposeIntercept = (0, _links.intercept)(function (event, link) {
        return clickHandler(event, link, _this3);
      });

      function defaultClickHandler(event, link, router) {
        event.preventDefault();
        router.transitionTo({ route: router.location.removeRoot(link.getAttribute('href')) });
      }
    }
  }]);

  return Cherrytree;
})();

exports['default'] = Cherrytree;
module.exports = exports['default'];