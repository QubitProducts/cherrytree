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
	exports['default'] = cherrytree;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _dash = __webpack_require__(2);

	var _dsl = __webpack_require__(3);

	var _dsl2 = _interopRequireDefault(_dsl);

	var _path = __webpack_require__(5);

	var _path2 = _interopRequireDefault(_path);

	var _invariant = __webpack_require__(4);

	var _invariant2 = _interopRequireDefault(_invariant);

	var _locationsBrowser = __webpack_require__(8);

	var _locationsBrowser2 = _interopRequireDefault(_locationsBrowser);

	var _locationsMemory = __webpack_require__(11);

	var _locationsMemory2 = _interopRequireDefault(_locationsMemory);

	var _transition = __webpack_require__(12);

	var _transition2 = _interopRequireDefault(_transition);

	var _links = __webpack_require__(13);

	var _logger = __webpack_require__(15);

	var _logger2 = _interopRequireDefault(_logger);

	var _qs = __webpack_require__(16);

	var _qs2 = _interopRequireDefault(_qs);

	function Cherrytree() {
	  this.initialize.apply(this, arguments);
	}

	/**
	 * The actual constructor
	 * @param {Object} options
	 */
	Cherrytree.prototype.initialize = function (options) {
	  this.nextId = 1;
	  this.state = {};
	  this.middleware = [];
	  this.options = (0, _dash.extend)({
	    location: 'browser',
	    interceptLinks: true,
	    logError: true,
	    Promise: Promise,
	    qs: _qs2['default']
	  }, options);
	  this.log = (0, _logger2['default'])(this.options.log);
	  this.logError = (0, _logger2['default'])(this.options.logError, { error: true });

	  (0, _invariant2['default'])(typeof this.options.Promise === 'function', 'Cherrytree requires an ES6 Promise implementation, ' + 'either as an explicit option or a global Promise');
	};

	/**
	 * Add a middleware
	 * @param  {Function} middleware
	 * @return {Object}   router
	 * @api public
	 */
	Cherrytree.prototype.use = function (middleware) {
	  this.middleware.push(middleware);
	  return this;
	};

	/**
	 * Add the route map
	 * @param  {Function} routes
	 * @return {Object}   router
	 * @api public
	 */
	Cherrytree.prototype.map = function (routes) {
	  // create the route tree
	  this.routes = (0, _dsl2['default'])(routes);

	  // create the matcher list, which is like a flattened
	  // list of routes = a list of all branches of the route tree
	  var matchers = this.matchers = [];
	  // keep track of whether duplicate paths have been created,
	  // in which case we'll warn the dev
	  var dupes = {};

	  eachBranch({ routes: this.routes }, [], function (routes) {
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

	    // dupe detection
	    var lastRoute = routes[routes.length - 1];
	    if (dupes[path]) {
	      throw new Error('Routes ' + dupes[path] + ' and ' + lastRoute.name + ' have the same url path \'' + path + '\'');
	    }
	    dupes[path] = lastRoute.name;
	  });

	  function eachBranch(node, memo, fn) {
	    node.routes.forEach(function (route) {
	      if (!abstract(route)) {
	        fn(memo.concat(route));
	      }
	      if (route.routes && route.routes.length > 0) {
	        eachBranch(route, memo.concat(route), fn);
	      }
	    });
	  }

	  function abstract(route) {
	    return route.options && route.options.abstract;
	  }

	  return this;
	};

	/**
	 * Starts listening to the location changes.
	 * @param  {Object}  location (optional)
	 * @return {Promise} initial transition
	 *
	 * @api public
	 */
	Cherrytree.prototype.listen = function (path) {
	  var _this = this;

	  var location = this.location = this.createLocation(path || '');
	  // setup the location onChange handler
	  location.onChange(function (url) {
	    return _this.dispatch(url);
	  });
	  // start intercepting links
	  if (this.options.interceptLinks && location.usesPushState()) {
	    this.interceptLinks();
	  }
	  // and also kick off the initial transition
	  return this.dispatch(location.getURL());
	};

	/**
	 * Transition to a different route. Passe in url or a route name followed by params and query
	 * @param  {String} url     url or route name
	 * @param  {Object} params  Optional
	 * @param  {Object} query   Optional
	 * @return {Object}         transition
	 *
	 * @api public
	 */
	Cherrytree.prototype.transitionTo = function () {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  if (this.state.activeTransition) {
	    return this.replaceWith.apply(this, args);
	  }
	  return this.doTransition('setURL', args);
	};

	/**
	 * Like transitionTo, but doesn't leave an entry in the browser's history,
	 * so clicking back will skip this route
	 * @param  {String} url     url or route name followed by params and query
	 * @param  {Object} params  Optional
	 * @param  {Object} query   Optional
	 * @return {Object}         transition
	 *
	 * @api public
	 */
	Cherrytree.prototype.replaceWith = function () {
	  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	    args[_key2] = arguments[_key2];
	  }

	  return this.doTransition('replaceURL', args);
	};

	/**
	 * Create an href
	 * @param  {String} name   target route name
	 * @param  {Object} params
	 * @param  {Object} query
	 * @return {String}        href
	 *
	 * @api public
	 */
	Cherrytree.prototype.generate = function (name, params, query) {
	  (0, _invariant2['default'])(this.location, 'call .listen() before using .generate()');
	  var matcher = undefined;

	  params = params || {};
	  query = query || {};

	  this.matchers.forEach(function (m) {
	    if (m.name === name) {
	      matcher = m;
	    }
	  });

	  if (!matcher) {
	    throw new Error('No route is named ' + name);
	  }

	  // this might be a dangerous feature, although it's useful in practise
	  // if some params are not passed into the generate call, they're populated
	  // based on the current state or on the currently active transition.
	  // Consider removing this.. since the users can opt into this behaviour, by
	  // reaching out to the router.state if that's what they want.
	  var currentParams = (0, _dash.clone)(this.state.params || {});
	  if (this.state.activeTransition) {
	    currentParams = (0, _dash.clone)(this.state.activeTransition.params || {});
	  }
	  params = (0, _dash.extend)(currentParams, params);

	  var url = _path2['default'].withQuery(this.options.qs, _path2['default'].injectParams(matcher.path, params), query);
	  return this.location.formatURL(url);
	};

	/**
	 * Stop listening to URL changes
	 * @api public
	 */
	Cherrytree.prototype.destroy = function () {
	  if (this.location && this.location.destroy && this.location.destroy) {
	    this.location.destroy();
	  }
	  if (this.disposeIntercept) {
	    this.disposeIntercept();
	  }
	  if (this.state.activeTransition) {
	    this.state.activeTransition.cancel();
	  }
	  this.state = {};
	};

	/**
	 * Check if the given route/params/query combo is active
	 * @param  {String} name   target route name
	 * @param  {Object} params
	 * @param  {Object} query
	 * @return {Boolean}
	 *
	 * @api public
	 */
	Cherrytree.prototype.isActive = function (name, params, query) {
	  params = params || {};
	  query = query || {};

	  var activeRoutes = this.state.routes || [];
	  var activeParams = this.state.params || {};
	  var activeQuery = this.state.query || [];

	  var isNameActive = !!(0, _dash.find)(activeRoutes, function (route) {
	    return route.name === name;
	  });
	  var areParamsActive = !!Object.keys(params).every(function (key) {
	    return activeParams[key] === params[key];
	  });
	  var isQueryActive = !!Object.keys(query).every(function (key) {
	    return activeQuery[key] === query[key];
	  });

	  return isNameActive && areParamsActive && isQueryActive;
	};

	/**
	 * @api private
	 */
	Cherrytree.prototype.doTransition = function (method, params) {
	  var _this2 = this;

	  var previousUrl = this.location.getURL();

	  var url = params[0];
	  if (url[0] !== '/') {
	    url = this.generate.apply(this, params);
	    url = url.replace(/^#/, '/');
	  }

	  if (this.options.pushState) {
	    url = this.location.removeRoot(url);
	  }

	  var transition = this.dispatch(url);

	  transition['catch'](function (err) {
	    if (err && err.type === 'TransitionCancelled') {
	      // reset the URL in case the transition has been cancelled
	      _this2.location.replaceURL(previousUrl, { trigger: false });
	    }
	    return err;
	  });

	  this.location[method](url, { trigger: false });

	  return transition;
	};

	/**
	 * Match the path against the routes
	 * @param  {String} path
	 * @return {Object} the list of matching routes and params
	 *
	 * @api private
	 */
	Cherrytree.prototype.match = function (path) {
	  path = (path || '').replace(/\/$/, '') || '/';
	  var found = false;
	  var params = undefined;
	  var routes = [];
	  var pathWithoutQuery = _path2['default'].withoutQuery(path);
	  var qs = this.options.qs;
	  this.matchers.forEach(function (matcher) {
	    if (!found) {
	      params = _path2['default'].extractParams(matcher.path, pathWithoutQuery);
	      if (params) {
	        found = true;
	        routes = matcher.routes;
	      }
	    }
	  });
	  return {
	    routes: routes.map(descriptor),
	    params: params || {},
	    query: _path2['default'].extractQuery(qs, path) || {}
	  };

	  // clone the data (only a shallow clone of options)
	  // to make sure the internal route store is not mutated
	  // by the middleware. The middleware can mutate data
	  // before it gets passed into the next middleware, but
	  // only within the same transition. New transitions
	  // will get to use pristine data.
	  function descriptor(route) {
	    return {
	      name: route.name,
	      path: route.path,
	      params: (0, _dash.pick)(params, _path2['default'].extractParamNames(route.path)),
	      options: (0, _dash.clone)(route.options)
	    };
	  }
	};

	Cherrytree.prototype.dispatch = function (path) {
	  var match = this.match(path);
	  var query = match.query;
	  var pathname = _path2['default'].withoutQuery(path);

	  var activeTransition = this.state.activeTransition;

	  // if we already have an active transition with all the same
	  // params - return that and don't do anything else
	  if (activeTransition && activeTransition.pathname === pathname && (0, _dash.isEqual)(activeTransition.query, query)) {
	    return activeTransition;
	  }

	  // otherwise, cancel the active transition since we're
	  // redirecting (or initiating a brand new transition)
	  if (activeTransition) {
	    var err = new Error('TransitionRedirected');
	    err.type = 'TransitionRedirected';
	    err.nextPath = path;
	    activeTransition.cancel(err);
	  }

	  // if there is no active transition, check if
	  // this is a noop transition, in which case, return
	  // a transition to respect the function signature,
	  // but don't actually run any of the middleware
	  if (!activeTransition) {
	    if (this.state.pathname === pathname && (0, _dash.isEqual)(this.state.query, query)) {
	      return (0, _transition2['default'])({
	        id: this.nextId++,
	        path: path,
	        match: match,
	        noop: true,
	        router: this
	      }, this.options.Promise);
	    }
	  }

	  var t = (0, _transition2['default'])({
	    id: this.nextId++,
	    path: path,
	    match: match,
	    router: this
	  }, this.options.Promise);

	  this.state.activeTransition = t;

	  return t;
	};

	/**
	 * Create the default location.
	 * This is used when no custom location is passed to
	 * the listen call.
	 * @return {Object} location
	 *
	 * @api private
	 */
	Cherrytree.prototype.createLocation = function (path) {
	  var location = this.options.location;
	  if (!(0, _dash.isString)(location)) {
	    return location;
	  }
	  if (location === 'browser') {
	    return new _locationsBrowser2['default']((0, _dash.pick)(this.options, ['pushState', 'root']));
	  } else if (location === 'memory') {
	    return new _locationsMemory2['default']({ path: path });
	  } else {
	    throw new Error('Location can be `browser`, `memory` or a custom implementation');
	  }
	};

	/**
	 * When using pushState, it's important to setup link interception
	 * because all link clicks should be handled via the router instead of
	 * browser reloading the page
	 */
	Cherrytree.prototype.interceptLinks = function () {
	  var _this3 = this;

	  var clickHandler = typeof this.options.interceptLinks === 'function' ? this.options.interceptLinks : defaultClickHandler;
	  this.disposeIntercept = (0, _links.intercept)(function (event, link) {
	    return clickHandler(event, link, _this3);
	  });

	  function defaultClickHandler(event, link, router) {
	    event.preventDefault();
	    router.transitionTo(router.location.removeRoot(link.getAttribute('href')));
	  }
	};

	function cherrytree(options) {
	  return new Cherrytree(options);
	}

	cherrytree.BrowserLocation = _locationsBrowser2['default'];
	cherrytree.MemoryLocation = _locationsMemory2['default'];
	module.exports = exports['default'];

/***/ },
/* 2 */
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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = dsl;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _dash = __webpack_require__(2);

	var _invariant = __webpack_require__(4);

	var _invariant2 = _interopRequireDefault(_invariant);

	function dsl(callback) {
	  var ancestors = [];
	  var matches = {};
	  var names = {};

	  callback(function route(name, options, callback) {
	    var routes = undefined;

	    (0, _invariant2['default'])(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name);

	    names[name] = true;

	    if (arguments.length === 1) {
	      options = {};
	    }

	    if (arguments.length === 2 && typeof options === 'function') {
	      callback = options;
	      options = {};
	    }

	    if (typeof options.path !== 'string') {
	      var parts = name.split('.');
	      options.path = parts[parts.length - 1];
	    }

	    // go to the next level
	    if (callback) {
	      ancestors = ancestors.concat(name);
	      callback();
	      routes = pop();
	      ancestors.splice(-1);
	    }

	    // add the node to the tree
	    push({
	      name: name,
	      path: options.path,
	      routes: routes || [],
	      options: options,
	      ancestors: (0, _dash.clone)(ancestors)
	    });
	  });

	  function pop() {
	    return matches[currentLevel()] || [];
	  }

	  function push(route) {
	    matches[currentLevel()] = matches[currentLevel()] || [];
	    matches[currentLevel()].push(route);
	  }

	  function currentLevel() {
	    return ancestors.join('.');
	  }

	  return pop();
	}

	module.exports = exports['default'];

/***/ },
/* 4 */
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
	      var error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.framesToPop = 1; // we don't care about invariant's own frame
	      throw error;
	    })();
	  }
	}

	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _invariant = __webpack_require__(4);

	var _invariant2 = _interopRequireDefault(_invariant);

	var _pathToRegexp = __webpack_require__(6);

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
/***/ function(module, exports, __webpack_require__) {

	var isarray = __webpack_require__(7)

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
/* 7 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _dash = __webpack_require__(2);

	var _locationBar = __webpack_require__(9);

	var _locationBar2 = _interopRequireDefault(_locationBar);

	exports['default'] = BrowserLocation;

	function BrowserLocation(options) {
	  this.path = options.path || '';

	  this.options = (0, _dash.extend)({
	    pushState: false,
	    root: '/'
	  }, options);

	  // we're using the location-bar module for actual
	  // URL management
	  var self = this;
	  this.locationBar = new _locationBar2['default']();
	  this.locationBar.onChange(function (path) {
	    self.handleURL('/' + (path || ''));
	  });

	  this.locationBar.start((0, _dash.extend)({}, options));
	}

	/**
	 * Check if we're actually using pushState. For browsers
	 * that don't support it this would return false since
	 * it would fallback to using hashState / polling
	 * @return {Bool}
	 */

	BrowserLocation.prototype.usesPushState = function () {
	  return this.options.pushState && this.locationBar.hasPushState();
	};

	/**
	 * Get the current URL
	 */

	BrowserLocation.prototype.getURL = function () {
	  return this.path;
	};

	/**
	 * Set the current URL without triggering any events
	 * back to the router. Add a new entry in browser's history.
	 */

	BrowserLocation.prototype.setURL = function (path, options) {
	  if (this.path !== path) {
	    this.path = path;
	    this.locationBar.update(path, (0, _dash.extend)({ trigger: true }, options));
	  }
	};

	/**
	 * Set the current URL without triggering any events
	 * back to the router. Replace the latest entry in broser's history.
	 */

	BrowserLocation.prototype.replaceURL = function (path, options) {
	  if (this.path !== path) {
	    this.path = path;
	    this.locationBar.update(path, (0, _dash.extend)({ trigger: true, replace: true }, options));
	  }
	};

	/**
	 * Setup a URL change handler
	 * @param  {Function} callback
	 */
	BrowserLocation.prototype.onChange = function (callback) {
	  this.changeCallback = callback;
	};

	/**
	 * Given a path, generate a URL appending root
	 * if pushState is used and # if hash state is used
	 */
	BrowserLocation.prototype.formatURL = function (path) {
	  if (this.locationBar.hasPushState()) {
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
	};

	/**
	 * When we use pushState with a custom root option,
	 * we need to take care of removingRoot at certain points.
	 * Specifically
	 * - browserLocation.update() can be called with the full URL by router
	 * - LocationBar expects all .update() calls to be called without root
	 * - this method is public so that we could dispatch URLs without root in router
	 */
	BrowserLocation.prototype.removeRoot = function (url) {
	  if (this.options.pushState && this.options.root && this.options.root !== '/') {
	    return url.replace(this.options.root, '');
	  } else {
	    return url;
	  }
	};

	/**
	 * Stop listening to URL changes and link clicks
	 */
	BrowserLocation.prototype.destroy = function () {
	  this.locationBar.stop();
	};

	/**
	  initially, the changeCallback won't be defined yet, but that's good
	  because we dont' want to kick off routing right away, the router
	  does that later by manually calling this handleURL method with the
	  url it reads of the location. But it's important this is called
	  first by Backbone, because we wanna set a correct this.path value

	  @private
	 */
	BrowserLocation.prototype.handleURL = function (url) {
	  this.path = url;
	  if (this.changeCallback) {
	    this.changeCallback(url);
	  }
	};
	module.exports = exports['default'];

/***/ },
/* 9 */
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
	})(__webpack_require__(10));

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _dash = __webpack_require__(2);

	exports['default'] = MemoryLocation;

	function MemoryLocation(options) {
	  this.path = options.path || '';
	}

	MemoryLocation.prototype.getURL = function () {
	  return this.path;
	};

	MemoryLocation.prototype.setURL = function (path, options) {
	  if (this.path !== path) {
	    this.path = path;
	    this.handleURL(this.getURL(), options);
	  }
	};

	MemoryLocation.prototype.replaceURL = function (path, options) {
	  if (this.path !== path) {
	    this.setURL(path, options);
	  }
	};

	MemoryLocation.prototype.onChange = function (callback) {
	  this.changeCallback = callback;
	};

	MemoryLocation.prototype.handleURL = function (url, options) {
	  this.path = url;
	  options = (0, _dash.extend)({ trigger: true }, options);
	  if (this.changeCallback && options.trigger) {
	    this.changeCallback(url);
	  }
	};

	MemoryLocation.prototype.usesPushState = function () {
	  return false;
	};

	MemoryLocation.prototype.removeRoot = function (url) {
	  return url;
	};

	MemoryLocation.prototype.formatURL = function (url) {
	  return url;
	};
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = transition;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _dash = __webpack_require__(2);

	var _invariant = __webpack_require__(4);

	var _invariant2 = _interopRequireDefault(_invariant);

	var _path = __webpack_require__(5);

	var _path2 = _interopRequireDefault(_path);

	function transition(options, Promise) {
	  options = options || {};

	  var router = options.router;
	  var log = router.log;
	  var logError = router.logError;

	  var path = options.path;
	  var match = options.match;
	  var routes = match.routes;
	  var params = match.params;
	  var query = match.query;

	  var id = options.id;
	  var startTime = Date.now();
	  log('---');
	  log('Transition #' + id, 'to', path);
	  log('Transition #' + id, 'routes:', routes.map(function (r) {
	    return r.name;
	  }));
	  log('Transition #' + id, 'params:', params);
	  log('Transition #' + id, 'query:', query);

	  // create the transition promise
	  var resolve = undefined,
	      reject = undefined;
	  var promise = new Promise(function (res, rej) {
	    resolve = res;
	    reject = rej;
	  });

	  // 1. make transition errors loud
	  // 2. by adding this handler we make sure
	  //    we don't trigger the default 'Potentially
	  //    unhandled rejection' for cancellations
	  promise.then(function () {
	    log('Transition #' + id, 'completed in', Date.now() - startTime + 'ms');
	  })['catch'](function (err) {
	    if (err.type !== 'TransitionRedirected' && err.type !== 'TransitionCancelled') {
	      log('Transition #' + id, 'FAILED');
	      logError(err.stack);
	    }
	  });

	  var cancelled = false;

	  var transition = {
	    id: id,
	    prev: {
	      routes: (0, _dash.clone)(router.state.routes) || [],
	      path: router.state.path || '',
	      pathname: router.state.pathname || '',
	      params: (0, _dash.clone)(router.state.params) || {},
	      query: (0, _dash.clone)(router.state.query) || {}
	    },
	    routes: (0, _dash.clone)(routes),
	    path: path,
	    pathname: _path2['default'].withoutQuery(path),
	    params: (0, _dash.clone)(params),
	    query: (0, _dash.clone)(query),
	    redirectTo: function redirectTo() {
	      return router.transitionTo.apply(router, arguments);
	    },
	    retry: function retry() {
	      return router.transitionTo(path);
	    },
	    cancel: function cancel(err) {
	      if (router.state.activeTransition !== transition) {
	        return;
	      }

	      if (transition.isCancelled) {
	        return;
	      }

	      router.state.activeTransition = null;
	      transition.isCancelled = true;
	      cancelled = true;

	      if (!err) {
	        err = new Error('TransitionCancelled');
	        err.type = 'TransitionCancelled';
	      }
	      if (err.type === 'TransitionCancelled') {
	        log('Transition #' + id, 'cancelled');
	      }
	      if (err.type === 'TransitionRedirected') {
	        log('Transition #' + id, 'redirected');
	      }

	      reject(err);
	    },
	    followRedirects: function followRedirects() {
	      return promise['catch'](function (reason) {
	        if (router.state.activeTransition) {
	          return router.state.activeTransition.followRedirects();
	        }
	        return Promise.reject(reason);
	      });
	    },

	    then: promise.then.bind(promise),
	    'catch': promise['catch'].bind(promise)
	  };

	  // here we handle calls to all of the middlewares
	  function callNext(i, prevResult) {
	    var middlewareName = undefined;
	    // if transition has been cancelled - nothing left to do
	    if (cancelled) {
	      return;
	    }
	    // done
	    if (i < router.middleware.length) {
	      middlewareName = router.middleware[i].name || 'anonymous';
	      log('Transition #' + id, 'resolving middleware:', middlewareName);
	      var middlewarePromise = undefined;
	      try {
	        middlewarePromise = router.middleware[i](transition, prevResult);
	        (0, _invariant2['default'])(transition !== middlewarePromise, 'Middleware %s returned a transition which resulted in a deadlock', middlewareName);
	      } catch (err) {
	        router.state.activeTransition = null;
	        return reject(err);
	      }
	      Promise.resolve(middlewarePromise).then(function (result) {
	        callNext(i + 1, result);
	      })['catch'](function (err) {
	        log('Transition #' + id, 'resolving middleware:', middlewareName, 'FAILED');
	        router.state.activeTransition = null;
	        reject(err);
	      });
	    } else {
	      router.state = {
	        activeTransition: null,
	        routes: routes,
	        path: path,
	        pathname: _path2['default'].withoutQuery(path),
	        params: params,
	        query: query
	      };
	      resolve();
	    }
	  }

	  if (!options.noop) {
	    Promise.resolve().then(function () {
	      return callNext(0);
	    });
	  } else {
	    resolve();
	  }

	  if (options.noop) {
	    transition.noop = true;
	  }

	  return transition;
	}

	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.intercept = intercept;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _events = __webpack_require__(14);

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
	  if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) return;
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
/* 14 */
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
/* 15 */
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
/* 16 */
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

/***/ }
/******/ ])
});
;