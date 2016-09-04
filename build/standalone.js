(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cherrytree"] = factory();
	else
		root["cherrytree"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _router = __webpack_require__(2);

	var _router2 = _interopRequireDefault(_router);

	var _route = __webpack_require__(17);

	var _route2 = _interopRequireDefault(_route);

	var _locationsBrowser = __webpack_require__(13);

	var _locationsBrowser2 = _interopRequireDefault(_locationsBrowser);

	var _locationsMemory = __webpack_require__(16);

	var _locationsMemory2 = _interopRequireDefault(_locationsMemory);

	var createRouter = function createRouter(options) {
	  return new _router2['default'](options);
	};

	// old school exports
	createRouter.route = _route2['default'];
	createRouter.BrowserLocation = _locationsBrowser2['default'];
	createRouter.MemoryLocation = _locationsMemory2['default'];

	// es2015 exports
	exports['default'] = createRouter;
	exports.BrowserLocation = _locationsBrowser2['default'];
	exports.MemoryLocation = _locationsMemory2['default'];
	exports.route = _route2['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _dash = __webpack_require__(3);

	var _qs = __webpack_require__(4);

	var _qs2 = _interopRequireDefault(_qs);

	var _path = __webpack_require__(5);

	var _path2 = _interopRequireDefault(_path);

	var _invariant = __webpack_require__(6);

	var _invariant2 = _interopRequireDefault(_invariant);

	var _transition = __webpack_require__(9);

	var _transition2 = _interopRequireDefault(_transition);

	var _links = __webpack_require__(10);

	var _logger = __webpack_require__(12);

	var _logger2 = _interopRequireDefault(_logger);

	var _locationsBrowser = __webpack_require__(13);

	var _locationsBrowser2 = _interopRequireDefault(_locationsBrowser);

	var _locationsMemory = __webpack_require__(16);

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

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var toString = Object.prototype.toString;
	var keys = Object.keys;
	var assoc = function assoc(obj, attr, val) {
	  obj[attr] = val;return obj;
	};

	var isArray = function isArray(obj) {
	  return toString.call(obj) === '[object Array]';
	};

	exports.isArray = isArray;
	var clone = function clone(obj) {
	  return obj ? isArray(obj) ? obj.slice(0) : extend({}, obj) : obj;
	};

	exports.clone = clone;
	var pick = function pick(obj, attrs) {
	  return attrs.reduce(function (acc, attr) {
	    return obj[attr] === undefined ? acc : assoc(acc, attr, obj[attr]);
	  }, {});
	};

	exports.pick = pick;
	var isEqual = function isEqual(obj1, obj2) {
	  return keys(obj1).length === keys(obj2).length && keys(obj1).reduce(function (acc, key) {
	    return acc && obj2[key] === obj1[key];
	  }, true);
	};

	exports.isEqual = isEqual;
	var extend = function extend(obj) {
	  for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    rest[_key - 1] = arguments[_key];
	  }

	  rest.forEach(function (source) {
	    if (source) {
	      for (var prop in source) {
	        obj[prop] = source[prop];
	      }
	    }
	  });
	  return obj;
	};

	exports.extend = extend;
	var find = function find(list, pred) {
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var x = _step.value;
	      if (pred(x)) return x;
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator['return']) {
	        _iterator['return']();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	};

	exports.find = find;
	var isString = function isString(obj) {
	  return Object.prototype.toString.call(obj) === '[object String]';
	};

	exports.isString = isString;
	var isObject = function isObject(obj) {
	  return typeof obj === 'object';
	};

	exports.isObject = isObject;
	var mapNested = function mapNested(root, childrenKey, fn) {
	  return root.map(map);

	  function map(node) {
	    node = clone(fn(node));
	    if (node[childrenKey]) {
	      node[childrenKey] = node[childrenKey].map(map);
	    }
	    return node;
	  }
	};

	exports.mapNested = mapNested;
	var defer = function defer() {
	  var deferred = {};
	  deferred.promise = new Promise(function (resolve, reject) {
	    deferred.resolve = resolve;
	    deferred.reject = reject;
	  });
	  return deferred;
	};
	exports.defer = defer;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = {
	  parse: function parse(querystring) {
	    return querystring.split('&').reduce(function (acc, pair) {
	      var parts = pair.split('=');
	      acc[parts[0]] = decodeURIComponent(parts[1]);
	      return acc;
	    }, {});
	  },

	  stringify: function stringify(params) {
	    return Object.keys(params).reduce(function (acc, key) {
	      if (params[key] !== undefined) {
	        acc.push(key + '=' + encodeURIComponent(params[key]));
	      }
	      return acc;
	    }, []).join('&');
	  }
	};
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _invariant = __webpack_require__(6);

	var _invariant2 = _interopRequireDefault(_invariant);

	var _pathToRegexp = __webpack_require__(7);

	var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

	var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?+*]?)/g;
	var specialParamChars = /[+*?]$/g;
	var queryMatcher = /\?(.+)/;

	var _compiledPatterns = {};

	function compilePattern(pattern) {
	  if (!(pattern in _compiledPatterns)) {
	    var paramNames = [];
	    var re = (0, _pathToRegexp2['default'])(pattern, paramNames);

	    _compiledPatterns[pattern] = {
	      matcher: re,
	      paramNames: paramNames.map(function (p) {
	        return p.name;
	      })
	    };
	  }

	  return _compiledPatterns[pattern];
	}

	var Path = {
	  /**
	   * Returns true if the given path is absolute.
	   */
	  isAbsolute: function isAbsolute(path) {
	    return path.charAt(0) === '/';
	  },

	  /**
	   * Joins two URL paths together.
	   */
	  join: function join(a, b) {
	    return a.replace(/\/*$/, '/') + b;
	  },

	  /**
	   * Returns an array of the names of all parameters in the given pattern.
	   */
	  extractParamNames: function extractParamNames(pattern) {
	    return compilePattern(pattern).paramNames;
	  },

	  /**
	   * Extracts the portions of the given URL path that match the given pattern
	   * and returns an object of param name => value pairs. Returns null if the
	   * pattern does not match the given path.
	   */
	  extractParams: function extractParams(pattern, path) {
	    var cp = compilePattern(pattern);
	    var matcher = cp.matcher;
	    var paramNames = cp.paramNames;
	    var match = path.match(matcher);

	    if (!match) {
	      return null;
	    }

	    var params = {};

	    paramNames.forEach(function (paramName, index) {
	      params[paramName] = match[index + 1] && decodeURIComponent(match[index + 1]);
	    });

	    return params;
	  },

	  /**
	   * Returns a version of the given route path with params interpolated. Throws
	   * if there is a dynamic segment of the route path for which there is no param.
	   */
	  injectParams: function injectParams(pattern, params) {
	    params = params || {};

	    return pattern.replace(paramInjectMatcher, function (match, param) {
	      var paramName = param.replace(specialParamChars, '');
	      var lastChar = param.slice(-1);

	      // If param is optional don't check for existence
	      if (lastChar === '?' || lastChar === '*') {
	        if (params[paramName] == null) {
	          return '';
	        }
	      } else {
	        (0, _invariant2['default'])(params[paramName] != null, "Missing '%s' parameter for path '%s'", paramName, pattern);
	      }

	      var paramValue = encodeURIComponent(params[paramName]);
	      if (lastChar === '*' || lastChar === '+') {
	        // restore / for splats
	        paramValue = paramValue.replace('%2F', '/');
	      }
	      return paramValue;
	    });
	  },

	  /**
	   * Returns an object that is the result of parsing any query string contained
	   * in the given path, null if the path contains no query string.
	   */
	  extractQuery: function extractQuery(qs, path) {
	    var match = path.match(queryMatcher);
	    return match && qs.parse(match[1]);
	  },

	  /**
	   * Returns a version of the given path with the parameters in the given
	   * query merged into the query string.
	   */
	  withQuery: function withQuery(qs, path, query) {
	    var queryString = qs.stringify(query, { indices: false });

	    if (queryString) {
	      return Path.withoutQuery(path) + '?' + queryString;
	    }

	    return path;
	  },

	  /**
	   * Returns a version of the given path without the query string.
	   */
	  withoutQuery: function withoutQuery(path) {
	    return path.replace(queryMatcher, '');
	  }
	};

	exports['default'] = Path;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = invariant;

	function invariant(condition, format, a, b, c, d, e, f) {
	  if (!condition) {
	    (function () {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      var error = new Error('Cherrytree: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.framesToPop = 1; // we don't care about invariant's own frame
	      throw error;
	    })();
	  }
	}

	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var isarray = __webpack_require__(8)

	/**
	 * Expose `pathToRegexp`.
	 */
	module.exports = pathToRegexp
	module.exports.parse = parse
	module.exports.compile = compile
	module.exports.tokensToFunction = tokensToFunction
	module.exports.tokensToRegExp = tokensToRegExp

	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g')

	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {string} str
	 * @return {!Array}
	 */
	function parse (str) {
	  var tokens = []
	  var key = 0
	  var index = 0
	  var path = ''
	  var res

	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0]
	    var escaped = res[1]
	    var offset = res.index
	    path += str.slice(index, offset)
	    index = offset + m.length

	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1]
	      continue
	    }

	    var next = str[index]
	    var prefix = res[2]
	    var name = res[3]
	    var capture = res[4]
	    var group = res[5]
	    var modifier = res[6]
	    var asterisk = res[7]

	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path)
	      path = ''
	    }

	    var partial = prefix != null && next != null && next !== prefix
	    var repeat = modifier === '+' || modifier === '*'
	    var optional = modifier === '?' || modifier === '*'
	    var delimiter = res[2] || '/'
	    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      partial: partial,
	      asterisk: !!asterisk,
	      pattern: escapeGroup(pattern)
	    })
	  }

	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index)
	  }

	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path)
	  }

	  return tokens
	}

	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {string}             str
	 * @return {!function(Object=, Object=)}
	 */
	function compile (str) {
	  return tokensToFunction(parse(str))
	}

	/**
	 * Prettier encoding of URI path segments.
	 *
	 * @param  {string}
	 * @return {string}
	 */
	function encodeURIComponentPretty (str) {
	  return encodeURI(str).replace(/[\/?#]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
	  })
	}

	/**
	 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
	 *
	 * @param  {string}
	 * @return {string}
	 */
	function encodeAsterisk (str) {
	  return encodeURI(str).replace(/[?#]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
	  })
	}

	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length)

	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
	    }
	  }

	  return function (obj, opts) {
	    var path = ''
	    var data = obj || {}
	    var options = opts || {}
	    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

	    for (var i = 0; i < tokens.length; i++) {
	      var token = tokens[i]

	      if (typeof token === 'string') {
	        path += token

	        continue
	      }

	      var value = data[token.name]
	      var segment

	      if (value == null) {
	        if (token.optional) {
	          // Prepend partial segment prefixes.
	          if (token.partial) {
	            path += token.prefix
	          }

	          continue
	        } else {
	          throw new TypeError('Expected "' + token.name + '" to be defined')
	        }
	      }

	      if (isarray(value)) {
	        if (!token.repeat) {
	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
	        }

	        if (value.length === 0) {
	          if (token.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + token.name + '" to not be empty')
	          }
	        }

	        for (var j = 0; j < value.length; j++) {
	          segment = encode(value[j])

	          if (!matches[i].test(segment)) {
	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
	          }

	          path += (j === 0 ? token.prefix : token.delimiter) + segment
	        }

	        continue
	      }

	      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

	      if (!matches[i].test(segment)) {
	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	      }

	      path += token.prefix + segment
	    }

	    return path
	  }
	}

	/**
	 * Escape a regular expression string.
	 *
	 * @param  {string} str
	 * @return {string}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
	}

	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {string} group
	 * @return {string}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}

	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {!RegExp} re
	 * @param  {Array}   keys
	 * @return {!RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys
	  return re
	}

	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {string}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}

	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {!RegExp} path
	 * @param  {!Array}  keys
	 * @return {!RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g)

	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        partial: false,
	        asterisk: false,
	        pattern: null
	      })
	    }
	  }

	  return attachKeys(path, keys)
	}

	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {!Array}  path
	 * @param  {Array}   keys
	 * @param  {!Object} options
	 * @return {!RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = []

	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source)
	  }

	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

	  return attachKeys(regexp, keys)
	}

	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {string}  path
	 * @param  {!Array}  keys
	 * @param  {!Object} options
	 * @return {!RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  var tokens = parse(path)
	  var re = tokensToRegExp(tokens, options)

	  // Attach keys back to the regexp.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] !== 'string') {
	      keys.push(tokens[i])
	    }
	  }

	  return attachKeys(re, keys)
	}

	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {!Array}  tokens
	 * @param  {Object=} options
	 * @return {!RegExp}
	 */
	function tokensToRegExp (tokens, options) {
	  options = options || {}

	  var strict = options.strict
	  var end = options.end !== false
	  var route = ''
	  var lastToken = tokens[tokens.length - 1]
	  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i]

	    if (typeof token === 'string') {
	      route += escapeString(token)
	    } else {
	      var prefix = escapeString(token.prefix)
	      var capture = '(?:' + token.pattern + ')'

	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*'
	      }

	      if (token.optional) {
	        if (!token.partial) {
	          capture = '(?:' + prefix + '(' + capture + '))?'
	        } else {
	          capture = prefix + '(' + capture + ')?'
	        }
	      } else {
	        capture = prefix + '(' + capture + ')'
	      }

	      route += capture
	    }
	  }

	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
	  }

	  if (end) {
	    route += '$'
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
	  }

	  return new RegExp('^' + route, flags(options))
	}

	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(string|RegExp|Array)} path
	 * @param  {(Array|Object)=}       keys
	 * @param  {Object=}               options
	 * @return {!RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  keys = keys || []

	  if (!isarray(keys)) {
	    options = /** @type {!Object} */ (keys)
	    keys = []
	  } else if (!options) {
	    options = {}
	  }

	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, /** @type {!Array} */ (keys))
	  }

	  if (isarray(path)) {
	    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
	  }

	  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = createTransition;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _dash = __webpack_require__(3);

	var _path = __webpack_require__(5);

	var _path2 = _interopRequireDefault(_path);

	function createTransition(options, Promise) {
	  var id = options.id;
	  var path = options.path;
	  var match = options.match;
	  var router = options.router;
	  var log = router.log;
	  var lastTransition = router.state.lastTransition;
	  var routes = match.routes;
	  var params = match.params;
	  var query = match.query;

	  var done = undefined;

	  var deferred = (0, _dash.defer)();

	  var transition = {
	    descriptor: {
	      id: id,
	      routes: (0, _dash.clone)(routes),
	      path: path,
	      pathname: _path2['default'].withoutQuery(path),
	      params: (0, _dash.clone)(params),
	      query: (0, _dash.clone)(query),
	      state: 'queued',
	      prev: lastTransition && lastTransition.descriptor
	    },

	    // A promise to signal the completion of transition
	    // this promise will resolve either when transition
	    // completes with 'completed' or 'cancelled' state amd
	    // in case of 'redirected' state will only complete
	    // once redirect is fully resolved.
	    // It will get rejected in case of transitioning completing
	    // in 'failed' state.
	    promise: deferred.promise,

	    cancel: function cancel(reason) {
	      if (transition.descriptor.state === 'queued') {
	        return deferred.resolve();
	      }
	      if (transition.descriptor.state === 'transitioning') {
	        if (reason === 'redirect') {
	          return handleRedirect();
	        } else {
	          log('Transition #' + id, 'cancelled');
	          return handleCancel();
	        }
	      }
	    },

	    redirect: function redirect(options) {
	      log('Transition #' + id, 'redirecting to', options);
	      router.transitionTo(options);
	    },

	    run: function run(doneCallback) {
	      done = doneCallback;
	      transition.startTime = new Date().getTime();
	      transition.descriptor.state = 'transitioning';
	      setTimeout(function () {
	        log('---');
	        log('Transition #' + id, 'to', path);
	        log('Transition #' + id, 'routes', routes.map(function (r) {
	          return r.name;
	        }));
	        log('Transition #' + id, 'params', params);
	        log('Transition #' + id, 'query', query);
	        runNext();
	      }, 1);
	    }
	  };

	  function afterNext(err) {
	    if (err) return handleError(err);
	    if (transition.descriptor.state !== 'transitioning') return;
	    transition.descriptor.state = 'completed';
	    setTimeout(runDone, 1);
	  }

	  function handleCancel() {
	    if (transition.descriptor.state !== 'transitioning') return;
	    transition.descriptor.state = 'cancelled';
	    setTimeout(runDone, 1);
	  }

	  function handleRedirect() {
	    if (transition.descriptor.state !== 'transitioning') return;
	    transition.descriptor.state = 'redirected';
	    setTimeout(runDone, 1);
	  }

	  function handleError(err) {
	    if (transition.descriptor.state !== 'transitioning') return;
	    transition.descriptor.state = 'failed';
	    setTimeout(function () {
	      return runError(err);
	    }, 1);
	  }

	  function afterDone(err) {
	    if (!err) transition.descriptor.state = 'completed';
	    transition.duration = new Date().getTime() - transition.startTime;
	    log('Transition #' + id, 'DONE -', transition.descriptor.state, '- (' + transition.duration + 'ms)');
	    done(err, transition);
	    if (transition.descriptor.state === 'failed') {
	      deferred.reject(err);
	    } else if (transition.descriptor.state === 'redirected') {
	      router.state.currTransition.promise.then(deferred.resolve)['catch'](deferred.reject);
	    } else {
	      deferred.resolve();
	    }
	  }

	  function runNext() {
	    var middlewares = router.middleware;
	    reduce(middlewares, function (context, middleware, i, list, cb) {
	      if (transition.descriptor.state !== 'transitioning') return false;
	      log('Transition #' + id, 'resolving middleware.next:', name(middleware, 'next'));
	      transition.middlewareReached = i;
	      if (!middleware.next) return cb(null, context);
	      var next = cb;
	      var redirect = transition.redirect;
	      var cancel = transition.cancel;
	      hook(middleware, 'next', next)(transition.descriptor, redirect, cancel);
	    }, undefined, afterNext);
	  }

	  function runDone() {
	    var middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse();
	    reduce(middlewares, function (context, middleware, i, list, cb) {
	      log('Transition #' + id, 'resolving middleware.done:', name(middleware, 'done'));
	      if (!middleware.done) return cb();
	      var next = cb;
	      hook(middleware, 'done', next)(transition.descriptor);
	    }, undefined, afterDone);
	  }

	  function runError(err) {
	    var middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse();
	    reduce(middlewares, function (context, middleware, i, list, cb) {
	      log('Transition #' + id, 'resolving middleware.error:', name(middleware, 'error'));
	      if (!context) return cb(null);
	      if (!middleware.error) return cb(null, context);
	      var next = function next(err) {
	        return cb(null, err);
	      };
	      hook(middleware, 'error', next)(context, transition.descriptor);
	    }, err, function (internalErr, err) {
	      return afterDone(internalErr || err);
	    });
	  }

	  function reduce(list, fn, initial, cb) {
	    if (list.length === 0) return cb(initial);

	    callNext(initial, 0);

	    function callNext(memo, i) {
	      if (i === list.length) return cb(null, memo);
	      var ret = fn(memo, list[i], i, list, function (err, nextMemo) {
	        if (err) return cb(err);
	        callNext(nextMemo, i + 1);
	      });
	      if (ret === false) cb(null, memo);
	    }
	  }

	  function hook(middleware, hook, next) {
	    return function () {
	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      new Promise(function (resolve) {
	        return resolve(middleware[hook].apply(middleware, args));
	      }).then(function () {
	        return next();
	      })['catch'](next);
	    };
	  }

	  function name(middleware, hook) {
	    return (middleware.name || 'anonymous') + (middleware[hook] ? '' : ' (skipping)');
	  }

	  return transition;
	}

	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.intercept = intercept;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _events = __webpack_require__(11);

	var _events2 = _interopRequireDefault(_events);

	/**
	 * Handle link delegation on `el` or the document,
	 * and invoke `fn(e)` when clickable.
	 *
	 * @param {Element|Function} el or fn
	 * @param {Function} [fn]
	 * @api public
	 */

	function intercept(el, fn) {
	  // default to document
	  if (typeof el === 'function') {
	    fn = el;
	    el = document;
	  }

	  var cb = delegate(el, 'click', function (e, el) {
	    if (clickable(e, el)) fn(e, el);
	  });

	  return function dispose() {
	    undelegate(el, 'click', cb);
	  };
	}

	function link(element) {
	  element = { parentNode: element };

	  var root = document;

	  // Make sure `element !== document` and `element != null`
	  // otherwise we get an illegal invocation
	  while ((element = element.parentNode) && element !== document) {
	    if (element.tagName.toLowerCase() === 'a') {
	      return element;
	    }
	    // After `matches` on the edge case that
	    // the selector matches the root
	    // (when the root is not the document)
	    if (element === root) {
	      return;
	    }
	  }
	}

	/**
	 * Delegate event `type` to links
	 * and invoke `fn(e)`. A callback function
	 * is returned which may be passed to `.unbind()`.
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */

	function delegate(el, type, fn) {
	  return _events2['default'].bind(el, type, function (e) {
	    var target = e.target || e.srcElement;
	    var el = link(target);
	    if (el) {
	      fn(e, el);
	    }
	  });
	}

	/**
	 * Unbind event `type`'s callback `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @api public
	 */

	function undelegate(el, type, fn) {
	  _events2['default'].unbind(el, type, fn);
	}

	/**
	 * Check if `e` is clickable.
	 */

	function clickable(e, el) {
	  if (which(e) !== 1) return;
	  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
	  if (e.defaultPrevented) return;

	  // check target
	  if (el.target) return;

	  // check for data-bypass attribute
	  if (el.getAttribute('data-bypass') !== null) return;

	  // inspect the href
	  var href = el.getAttribute('href');
	  if (!href || href.length === 0) return;
	  // don't handle hash links
	  if (href[0] === '#') return;
	  // external/absolute links
	  if (/^[A-Za-z]+:\/\//.test(href)) return;
	  // email links
	  if (href.indexOf('mailto:') === 0) return;
	  // don't intercept javascript links
	  /* eslint-disable no-script-url */
	  if (href.indexOf('javascript:') === 0) return;
	  /* eslint-enable no-script-url */

	  return true;
	}

	/**
	 * Event button.
	 */

	function which(e) {
	  e = e || window.event;
	  return e.which === null ? e.button : e.which;
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var events = createEvents();

	exports['default'] = events;

	function createEvents() {
	  var exp = {};

	  if (typeof window === 'undefined') {
	    return exp;
	  }

	  /**
	  * DOM Event bind/unbind
	  */

	  var bind = window.addEventListener ? 'addEventListener' : 'attachEvent';
	  var unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
	  var prefix = bind !== 'addEventListener' ? 'on' : '';

	  /**
	  * Bind `el` event `type` to `fn`.
	  *
	  * @param {Element} el
	  * @param {String} type
	  * @param {Function} fn
	  * @param {Boolean} capture
	  * @return {Function}
	  * @api public
	  */

	  exp.bind = function (el, type, fn, capture) {
	    el[bind](prefix + type, fn, capture || false);
	    return fn;
	  };

	  /**
	  * Unbind `el` event `type`'s callback `fn`.
	  *
	  * @param {Element} el
	  * @param {String} type
	  * @param {Function} fn
	  * @param {Boolean} capture
	  * @return {Function}
	  * @api public
	  */

	  exp.unbind = function (el, type, fn, capture) {
	    el[unbind](prefix + type, fn, capture || false);
	    return fn;
	  };

	  return exp;
	}
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = createLogger;

	function createLogger(log, options) {
	  options = options || {};
	  // falsy means no logging
	  if (!log) return function () {};
	  // custom logging function
	  if (log !== true) return log;
	  // true means use the default logger - console
	  var fn = options.error ? console.error : console.info;
	  return function () {
	    fn.apply(console, arguments);
	  };
	}

	module.exports = exports["default"];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _dash = __webpack_require__(3);

	var _locationBar = __webpack_require__(14);

	var _locationBar2 = _interopRequireDefault(_locationBar);

	var BrowserLocation = (function () {
	  function BrowserLocation(options) {
	    _classCallCheck(this, BrowserLocation);

	    this.options = (0, _dash.extend)({
	      pushState: false,
	      root: '/'
	    }, options);

	    this.path = '';

	    // we're using the location-bar module for actual
	    // URL management
	    var self = this;
	    this.locationBar = new _locationBar2['default']();
	    this.locationBar.onChange(function (path) {
	      self.handleURL('/' + (path || ''));
	    });
	  }

	  _createClass(BrowserLocation, [{
	    key: 'start',
	    value: function start() {
	      this.locationBar.start((0, _dash.extend)({}, this.options));
	    }

	    /**
	     * Stop listening to URL changes and link clicks
	     */
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this.locationBar.stop();
	    }

	    /**
	     * Check if we're actually using pushState. For browsers
	     * that don't support it this would return false since
	     * it would fallback to using hashState / polling
	     * @return {Bool}
	     */

	  }, {
	    key: 'usesPushState',
	    value: function usesPushState() {
	      return this.options.pushState && window.history && window.history.pushState;
	    }

	    /**
	     * Get the current URL
	     */

	  }, {
	    key: 'url',
	    value: function url() {
	      return this.path;
	    }

	    /**
	     * Set the current URL without triggering any events
	     * back to the router. Add a new entry in browser's history.
	     */

	  }, {
	    key: 'push',
	    value: function push(path, options) {
	      if (this.path !== path) {
	        this.path = path;
	        this.locationBar.update(path, (0, _dash.extend)({ trigger: true }, options));
	      }
	    }

	    /**
	     * Set the current URL without triggering any events
	     * back to the router. Replace the latest entry in broser's history.
	     */

	  }, {
	    key: 'replace',
	    value: function replace(path, options) {
	      if (this.path !== path) {
	        this.path = path;
	        this.locationBar.update(path, (0, _dash.extend)({ trigger: true, replace: true }, options));
	      }
	    }

	    /**
	     * Setup a URL change handler
	     * @param  {Function} callback
	     */
	  }, {
	    key: 'onChange',
	    value: function onChange(callback) {
	      this.changeCallback = callback;
	    }

	    /**
	     * Given a path, generate a URL appending root
	     * if pushState is used and # if hash state is used
	     */
	  }, {
	    key: 'format',
	    value: function format(path) {
	      if (/^[A-Za-z]+:\/\//.test(path)) return path;
	      if (this.usesPushState()) {
	        var rootURL = this.options.root;
	        if (path !== '') {
	          rootURL = rootURL.replace(/\/$/, '');
	        }
	        return rootURL + path;
	      } else {
	        if (path[0] === '/') {
	          path = path.substr(1);
	        }
	        return '#' + path;
	      }
	    }

	    /**
	     * When we use pushState with a custom root option,
	     * we need to take care of removingRoot at certain points.
	     * Specifically
	     * - browserLocation.update() can be called with the full URL by router
	     * - LocationBar expects all .update() calls to be called without root
	     * - this method is public so that we could dispatch URLs without root in router
	     */
	  }, {
	    key: 'removeRoot',
	    value: function removeRoot(url) {
	      if (this.options.pushState && this.options.root && this.options.root !== '/') {
	        return url.replace(this.options.root, '');
	      } else {
	        return url.replace(/^#/, '/');
	      }
	    }

	    /**
	      initially, the changeCallback won't be defined yet, but that's good
	      because we dont' want to kick off routing right away, the router
	      does that later by manually calling this handleURL method with the
	      url it reads of the location. But it's important this is called
	      first by Backbone, because we wanna set a correct this.path value
	       @private
	     */
	  }, {
	    key: 'handleURL',
	    value: function handleURL(url) {
	      this.path = url;
	      if (this.changeCallback) {
	        this.changeCallback(url);
	      }
	    }
	  }]);

	  return BrowserLocation;
	})();

	exports['default'] = BrowserLocation;
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;// LocationBar module extracted from Backbone.js 1.1.0
	//
	// the dependency on backbone, underscore and jquery have been removed to turn
	// this into a small standalone library for handling browser's history API
	// cross browser and with a fallback to hashchange events or polling.

	(function(define) {
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

	  // 3 helper functions we use to avoid pulling in entire _ and $
	  var _ = {};
	  _.extend = function extend(obj, source) {
	    for (var prop in source) {
	      obj[prop] = source[prop];
	    }
	    return obj;
	  }
	  _.any = function any(arr, fn) {
	    for (var i = 0, l = arr.length; i < l; i++) {
	      if (fn(arr[i])) {
	        return true;
	      }
	    }
	    return false;
	  }
	  
	  function on(obj, type, fn) {
	    if (obj.attachEvent) {
	      obj['e'+type+fn] = fn;
	      obj[type+fn] = function(){ obj['e'+type+fn]( window.event ); };
	      obj.attachEvent( 'on'+type, obj[type+fn] );
	    } else {
	      obj.addEventListener( type, fn, false );
	    }
	  }
	  function off(obj, type, fn) {
	    if (obj.detachEvent) {
	      obj.detachEvent('on'+type, obj[type+fn]);
	      obj[type+fn] = null;
	    } else {
	      obj.removeEventListener(type, fn, false);
	    }
	  }





	  // this is mostly original code with minor modifications
	  // to avoid dependency on 3rd party libraries
	  //
	  // Backbone.History
	  // ----------------

	  // Handles cross-browser history management, based on either
	  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
	  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
	  // and URL fragments. If the browser supports neither (old IE, natch),
	  // falls back to polling.
	  var History = function() {
	    this.handlers = [];

	    // MODIFICATION OF ORIGINAL BACKBONE.HISTORY
	    //
	    // _.bindAll(this, 'checkUrl');
	    //
	    var self = this;
	    var checkUrl = this.checkUrl;
	    this.checkUrl = function () {
	      checkUrl.apply(self, arguments);
	    };

	    // Ensure that `History` can be used outside of the browser.
	    if (typeof window !== 'undefined') {
	      this.location = window.location;
	      this.history = window.history;
	    }
	  };

	  // Cached regex for stripping a leading hash/slash and trailing space.
	  var routeStripper = /^[#\/]|\s+$/g;

	  // Cached regex for stripping leading and trailing slashes.
	  var rootStripper = /^\/+|\/+$/g;

	  // Cached regex for detecting MSIE.
	  var isExplorer = /msie [\w.]+/;

	  // Cached regex for removing a trailing slash.
	  var trailingSlash = /\/$/;

	  // Cached regex for stripping urls of hash.
	  var pathStripper = /#.*$/;

	  // Has the history handling already been started?
	  History.started = false;

	  // Set up all inheritable **Backbone.History** properties and methods.
	  _.extend(History.prototype, {

	    // The default interval to poll for hash changes, if necessary, is
	    // twenty times a second.
	    interval: 50,

	    // Are we at the app root?
	    atRoot: function() {
	      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
	    },

	    // Gets the true hash value. Cannot use location.hash directly due to bug
	    // in Firefox where location.hash will always be decoded.
	    getHash: function(window) {
	      var match = (window || this).location.href.match(/#(.*)$/);
	      return match ? match[1] : '';
	    },

	    // Get the cross-browser normalized URL fragment, either from the URL,
	    // the hash, or the override.
	    getFragment: function(fragment, forcePushState) {
	      if (fragment == null) {
	        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
	          fragment = decodeURI(this.location.pathname + this.location.search);
	          var root = this.root.replace(trailingSlash, '');
	          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
	        } else {
	          fragment = this.getHash();
	        }
	      }
	      return fragment.replace(routeStripper, '');
	    },

	    // Start the hash change handling, returning `true` if the current URL matches
	    // an existing route, and `false` otherwise.
	    start: function(options) {
	      if (History.started) throw new Error("LocationBar has already been started");
	      History.started = true;

	      // Figure out the initial configuration. Do we need an iframe?
	      // Is pushState desired ... is it available?
	      this.options          = _.extend({root: '/'}, options);
	      this.location         = this.options.location || this.location;
	      this.history          = this.options.history || this.history;
	      this.root             = this.options.root;
	      this._wantsHashChange = this.options.hashChange !== false;
	      this._wantsPushState  = !!this.options.pushState;
	      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
	      var fragment          = this.getFragment();
	      var docMode           = document.documentMode;
	      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

	      // Normalize root to always include a leading and trailing slash.
	      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

	      if (oldIE && this._wantsHashChange) {
	        // MODIFICATION OF ORIGINAL BACKBONE.HISTORY
	        //
	        // var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
	        // this.iframe = frame.hide().appendTo('body')[0].contentWindow;
	        //
	        this.iframe = document.createElement("iframe");
	        this.iframe.setAttribute("src", "javascript:0");
	        this.iframe.setAttribute("tabindex", -1);
	        this.iframe.style.display = "none";
	        document.body.appendChild(this.iframe);
	        this.iframe = this.iframe.contentWindow;
	        this.navigate(fragment);
	      }

	      // Depending on whether we're using pushState or hashes, and whether
	      // 'onhashchange' is supported, determine how we check the URL state.
	      if (this._hasPushState) {
	        on(window, 'popstate', this.checkUrl);
	      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
	        on(window, 'hashchange', this.checkUrl);
	      } else if (this._wantsHashChange) {
	        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
	      }

	      // Determine if we need to change the base url, for a pushState link
	      // opened by a non-pushState browser.
	      this.fragment = fragment;
	      var loc = this.location;

	      // Transition from hashChange to pushState or vice versa if both are
	      // requested.
	      if (this._wantsHashChange && this._wantsPushState) {

	        // If we've started off with a route from a `pushState`-enabled
	        // browser, but we're currently in a browser that doesn't support it...
	        if (!this._hasPushState && !this.atRoot()) {
	          this.fragment = this.getFragment(null, true);
	          this.location.replace(this.root + '#' + this.fragment);
	          // Return immediately as browser will do redirect to new url
	          return true;

	        // Or if we've started out with a hash-based route, but we're currently
	        // in a browser where it could be `pushState`-based instead...
	        } else if (this._hasPushState && this.atRoot() && loc.hash) {
	          this.fragment = this.getHash().replace(routeStripper, '');
	          this.history.replaceState({}, document.title, this.root + this.fragment);
	        }

	      }

	      if (!this.options.silent) return this.loadUrl();
	    },

	    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
	    // but possibly useful for unit testing Routers.
	    stop: function() {
	      off(window, 'popstate', this.checkUrl);
	      off(window, 'hashchange', this.checkUrl);
	      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
	      History.started = false;
	    },

	    // Add a route to be tested when the fragment changes. Routes added later
	    // may override previous routes.
	    route: function(route, callback) {
	      this.handlers.unshift({route: route, callback: callback});
	    },

	    // Checks the current URL to see if it has changed, and if it has,
	    // calls `loadUrl`, normalizing across the hidden iframe.
	    checkUrl: function() {
	      var current = this.getFragment();
	      if (current === this.fragment && this.iframe) {
	        current = this.getFragment(this.getHash(this.iframe));
	      }
	      if (current === this.fragment) return false;
	      if (this.iframe) this.navigate(current);
	      this.loadUrl();
	    },

	    // Attempt to load the current URL fragment. If a route succeeds with a
	    // match, returns `true`. If no defined routes matches the fragment,
	    // returns `false`.
	    loadUrl: function(fragment) {
	      fragment = this.fragment = this.getFragment(fragment);
	      return _.any(this.handlers, function(handler) {
	        if (handler.route.test(fragment)) {
	          handler.callback(fragment);
	          return true;
	        }
	      });
	    },

	    // Save a fragment into the hash history, or replace the URL state if the
	    // 'replace' option is passed. You are responsible for properly URL-encoding
	    // the fragment in advance.
	    //
	    // The options object can contain `trigger: true` if you wish to have the
	    // route callback be fired (not usually desirable), or `replace: true`, if
	    // you wish to modify the current URL without adding an entry to the history.
	    navigate: function(fragment, options) {
	      if (!History.started) return false;
	      if (!options || options === true) options = {trigger: !!options};

	      var url = this.root + (fragment = this.getFragment(fragment || ''));

	      // Strip the hash for matching.
	      fragment = fragment.replace(pathStripper, '');

	      if (this.fragment === fragment) return;
	      this.fragment = fragment;

	      // Don't include a trailing slash on the root.
	      if (fragment === '' && url !== '/') url = url.slice(0, -1);

	      // If pushState is available, we use it to set the fragment as a real URL.
	      if (this._hasPushState) {
	        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

	      // If hash changes haven't been explicitly disabled, update the hash
	      // fragment to store history.
	      } else if (this._wantsHashChange) {
	        this._updateHash(this.location, fragment, options.replace);
	        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
	          // Opening and closing the iframe tricks IE7 and earlier to push a
	          // history entry on hash-tag change.  When replace is true, we don't
	          // want this.
	          if(!options.replace) this.iframe.document.open().close();
	          this._updateHash(this.iframe.location, fragment, options.replace);
	        }

	      // If you've told us that you explicitly don't want fallback hashchange-
	      // based history, then `navigate` becomes a page refresh.
	      } else {
	        return this.location.assign(url);
	      }
	      if (options.trigger) return this.loadUrl(fragment);
	    },

	    // Update the hash location, either replacing the current entry, or adding
	    // a new one to the browser history.
	    _updateHash: function(location, fragment, replace) {
	      if (replace) {
	        var href = location.href.replace(/(javascript:|#).*$/, '');
	        location.replace(href + '#' + fragment);
	      } else {
	        // Some browsers require that `hash` contains a leading #.
	        location.hash = '#' + fragment;
	      }
	    }

	  });



	  // add some features to History

	  // a more intuitive alias for navigate
	  History.prototype.update = function () {
	    this.navigate.apply(this, arguments);
	  };

	  // a generic callback for any changes
	  History.prototype.onChange = function (callback) {
	    this.route(/^(.*?)$/, callback);
	  };

	  // checks if the browser has pushstate support
	  History.prototype.hasPushState = function () {
	    if (!History.started) {
	      throw new Error("only available after LocationBar.start()");
	    }
	    return this._hasPushState;
	  };






	  // export
	  return History;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	})(__webpack_require__(15));

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _dash = __webpack_require__(3);

	exports['default'] = MemoryLocation;

	var MemoryLocation = (function () {
	  function MemoryLocation() {
	    _classCallCheck(this, MemoryLocation);

	    this.path = '';
	  }

	  _createClass(MemoryLocation, [{
	    key: 'start',
	    value: function start() {}
	  }, {
	    key: 'url',
	    value: function url() {
	      return this.path;
	    }
	  }, {
	    key: 'push',
	    value: function push(path, options) {
	      if (this.path !== path) {
	        this.path = path;
	        this.handleURL(this.url(), options);
	      }
	    }
	  }, {
	    key: 'replace',
	    value: function replace(path, options) {
	      if (this.path !== path) {
	        this.setURL(path, options);
	      }
	    }
	  }, {
	    key: 'onChange',
	    value: function onChange(callback) {
	      this.changeCallback = callback;
	    }
	  }, {
	    key: 'handleURL',
	    value: function handleURL(url, options) {
	      this.path = url;
	      options = (0, _dash.extend)({ trigger: true }, options);
	      if (this.changeCallback && options.trigger) {
	        this.changeCallback(url);
	      }
	    }
	  }, {
	    key: 'usesPushState',
	    value: function usesPushState() {
	      return false;
	    }
	  }, {
	    key: 'removeRoot',
	    value: function removeRoot(url) {
	      return url;
	    }
	  }, {
	    key: 'format',
	    value: function format(url) {
	      return url;
	    }
	  }]);

	  return MemoryLocation;
	})();

	module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A small helper for creating route maps.
	 * This is useful mostly to workaround the standard linting
	 * that no longer allows multiline objects.
	 *
	 * This helper converts this:
	 * [
	 *   route({ name: 'foo', path: ':foo' }, [
	 *     route({ name: 'bar', path: ':bar' })
	 *   ])
	 * ]
	 *
	 * to this:
	 *
	 * [
	 *   { name: 'foo', path: ':foo', children: [
	 *     { name: 'bar', path: ':bar' }
	 *   ]}
	 * ]
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _dash = __webpack_require__(3);

	var route = function route(options, children) {
	  return (0, _dash.extend)({ children: children }, options);
	};

	exports['default'] = route;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;