(function (define) { 'use strict';
define(function (require) {

  var _ = require("lodash");
  var when = require("when");
  var sequence = require("when/sequence");
  var dsl = require("./lib/dsl");
  var Path = require("./lib/path");
  var HistoryLocation = require("./locations/history");

  /**
   * Constructor
   */
  var Cherrytree = function () {
    this.initialize.apply(this, arguments);
  };

  /**
   * The actual constructor
   * @param {Object} options
   */
  Cherrytree.prototype.initialize = function (options) {
    this.nextId = 1;
    this.state = {};
    this.middleware = [];
    this.options = _.extend({}, options);
    this.log = this.options.log || function () {};
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
    var self = this;

    // create the route tree
    this.routes = dsl(routes);

    // create the matcher list, which is like a flattened
    // list of routes = a list of all branches of the route tree
    var matchers = this.matchers = [];

    eachBranch({routes: this.routes}, [], function (routes) {
      // concatenate the paths of the list of routes
      var path = _.reduce(routes, function (memo, r) {
        // reset if there's a leading slash, otherwise concat
        // and keep resetting the trailing slash
        return (r.path[0] === "/" ? r.path : memo + "/" + r.path).replace(/\/$/, "");
      }, "");
      // ensure we have a leading slash
      if (path === "") {
        path = "/";
      }
      // register routes
      matchers.push({
        routes: routes,
        name: routes[routes.length - 1].name,
        path: path
      });
    });

    function eachBranch(node, memo, fn) {
      _.each(node.routes, function (route) {
        if (!route.routes || route.routes.length === 0) {
          fn.call(null, memo.concat(route));
        } else {
          eachBranch(route, memo.concat(route), fn);
        }
      });
    }

    return this;
  };

  /**
   * Starts listening to the location changes.
   * @param  {Object}  location (optional)
   * @return {Promise} initial transition
   */
  Cherrytree.prototype.listen = function (location) {
    var router = this;
    location = this.location = location || this.createDefaultLocation();
    
    // setup the location onChange handler
    this.previousUrl = location.getURL();
    location.onChange(dispatch);
    // and also kick off the initial transition
    return dispatch(location.getURL());

    function dispatch(url) {
      var transition = router.dispatch(url)

      transition.then(function () {
        router.previousUrl = url;
      }).catch(function (err) {
        if (err && err.type === 'TransitionCancelled') {
          // reset the URL in case the transition has been cancelled
          location.replaceURL(router.previousUrl, {trigger: false});
        }
        return err;
      });

      return transition;
    }
  };
  
  /**
   * Match the path against the routes
   * @param  {String} path
   * @return {Object} the list of matching routes and params
   * @api private
   */
  Cherrytree.prototype.match = function (path) {
    path = path || "/";
    var found = false;
    var params = {};
    var routes = [];
    var pathWithoutQuery = path.split("?")[0];
    _.each(this.matchers, function (matcher) {
      if (!found) {
        params = Path.extractParams(matcher.path, pathWithoutQuery)
        if (params) {
          found = true;
          routes = matcher.routes;
          // TODO: extract the query params
          params.queryParams = {};
        }
      }
    });
    return {
      routes: routes,
      params: params
    };
  },
  
  Cherrytree.prototype.dispatch = function (path) {
    if (this.state.activeTransition) {
      var err = new Error('TransitionRedirected');
      err.type = 'TransitionRedirected';
      this.state.activeTransition.cancel(err);
    }

    var id = this.nextId++;
    this.log("Transition #" + id, "started");

    var router = this;
    var match = this.match(path);
    var routes = match.routes;
    var params = match.params;

    this.log("Transition #" + id, "routes", _.pluck(routes, "name"));
    this.log("Transition #" + id, "params", params);

    // create the transition promise
    var resolve, reject;
    var promise = new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    });

    // 1. make transition errors loud
    // 2. by adding this handler we make sure
    //    we don't trigger the default "Potentially
    //    unhandled rejection" for cancellations
    promise.then(function () {
      router.log("Transition #" + id, "completed");
    }).catch(function (err) {
      if (err.type !== 'TransitionRedirected' && err.type !== 'TransitionCancelled') {
        router.log("Transition #" + id, "FAILED");
        console.error(err.stack);
      }
    });

    var cancelled = false;

    var transition = this.state.activeTransition = {
      id: id,
      prevRoutes: router.state.routes || [],
      nextRoutes: routes,
      params: params,
      path: path,
      cancel: function (err) {
        router.state.activeTransition = null;
        if (!err) {
          err = new Error('TransitionCancelled');
          err.type = 'TransitionCancelled';
        }
        cancelled = err;

        if (err.type === 'TransitionCancelled') {
          router.log("Transition #" + id, "cancelled");
        }
        if (err.type === 'TransitionRedirected') {
          router.log("Transition #" + id, "redirected");
        }

        reject(err);
        transition.isCancelled = true;
      },
      redirectTo: function () {
        return router.transitionTo.apply(router, arguments);
      },
      promise: promise,
      then: promise.then.bind(promise),
      catch: promise.catch.bind(promise)
    };
    
    // here we handle calls to all of the middlewares
    function callNext(i, prevResult) {
      var middlewareName;
      // if transition has been cancelled - nothing left to do
      if (cancelled) {
        return;
      }
      // done
      if (i < router.middleware.length) {
        middlewareName = router.middleware[i].name || "anonymous";
        router.log("Transition #" + id, "resolving middleware:", middlewareName);
        Promise.resolve(router.middleware[i](transition, prevResult))
          .then(function (result) {
            callNext(i + 1, result)
          })
          .catch(function (err) {
            router.log("Transition #" + id, "resolving middleware:", middlewareName, "FAILED");
            reject(err);
          });
      } else {
        router.state = {
          activeTransition: null,
          routes: transition.nextRoutes,
          params: params,
          path: path
        };
        resolve();
      }
    }
    callNext(0);
    
    return transition;
  };


  /**
   * Create the default location.
   * This is used when no custom location is passed to
   * the listen call.
   * @return {Object} location
   * @api private
   */
  Cherrytree.prototype.createDefaultLocation = function () {
    var locationOptions = _.pick(this.options, ["pushState", "root", "interceptLinks"]);
    return new HistoryLocation(locationOptions);
  };
  
  _.extend(Cherrytree.prototype, {

    transitionTo: function(url) {
      if (this.state.activeTransition) {
        return this.replaceWith.apply(this, arguments);
      }

      var location = this.location;
      if (url[0] !== "/") {
        url = this.generate.apply(this, arguments);
      }
      this.previousUrl = location.getURL();
      location.setURL(url);
      return this.state.activeTransition;
    },

    replaceWith: function(url) {
      var location = this.location;
      if (url[0] !== "/") {
        url = this.generate.apply(this, arguments);
      }
      this.previousUrl = location.getURL();
      location.replaceURL(url);
      return this.state.activeTransition;
    },

    generate: function(name, params) {
      var matcher, currentParams, pattern, paramNames, args;
      _.each(this.matchers, function (m) {
        if (m.name === name) {
          matcher = m;
        }
      });
      if (matcher) {
        currentParams = _.clone(this.state.params || {});
        if (this.state.activeTransition) {
          currentParams = _.clone(this.state.activeTransition.params || {});
        }

        delete currentParams.queryParams;
        pattern = matcher.path;
        paramNames = Path.extractParamNames(pattern);
        if (_.isObject(params)) {
          currentParams = _.extend(currentParams, params);
        } else {
          args = _.rest(arguments, 1);
          var diff = paramNames.length - args.length;
          paramNames = diff ? _.rest(paramNames, diff) : paramNames;
          _.each(args, function (val, i) {
            var paramName = paramNames[i];
            currentParams[paramName] = val;
          });
        }

        currentParams.splat = currentParams.splat || '';
        return this.location.formatURL(Path.injectParams(matcher.path, currentParams));
      } else {
        throw new Error('No route is named ' + name);
      }
    },

    destroy: function () {
      if (this.location.destroy && this.location.destroy) {
        this.location.destroy();
      }
    },

    /**
      Resets the state of the router by clearing the current route
      handlers and deactivating them.

      @method reset
     */
    reset: function() {
      
    }
  });

  return function cherrytree(options) {
    return new Cherrytree(options);
  };

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });