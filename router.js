(function (define) { 'use strict';
define(function (require) {

  var _ = require("lodash");
  var DSL = require("./lib/dsl");
  var Path = require("./lib/path");
  var HistoryLocation = require("./locations/history");
  var when = require("when");

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam = /(\(\?)?:\w+/g;
  var splatParam = /\*\w+/g;
  var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  var CherrytreeRouter = function () {
    this.initialize.apply(this, arguments);
  };

  _.extend(CherrytreeRouter.prototype, {

    initialize: function (options) {
      this.handlers = {};
      this.dispatchHandlers = [];
      this.state = {};
      this.options = _.extend({
        location: false
      }, options);
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(pattern, path) {
      path = path.split("?")[0];
      var params = Path.extractParams(pattern, path);
      params.queryParams = {};
      return params;
      // var params = route.exec(fragment).slice(1);
      // return _.map(params, function(param, i) {
      //   // Don't decode the search params.
      //   if (i === params.length - 1) return param || null;
      //   return param ? decodeURIComponent(param) : null;
      // });
    },

    use: function (dispatchHandler) {
      this.dispatchHandlers.push(dispatchHandler);
    },

    map: function (routes) {
      var self = this;

      this.routes = DSL.map(routes);

      this.matchers = [];

      eachBranch(this.routes, function (routes) {
        var path = _.map(routes, function (r) {
          return r.path;
        }).join("/");
        path = path.replace("//", "");
        if (path === "/") {
          path = "";
        }
        // register routes
        var routeRegExp = new RegExp(self._routeToRegExp(path));
        self.matchers.push({
          regExp: routeRegExp,
          routes: routes,
          name: routes[routes.length - 1].name,
          path: path
        });
      }, this);

      function eachBranch(node, memo, fn, context) {
        if (!context) {
          fn = memo;
          context = fn;
          memo = [];
          node = {routes: node};
        }
        _.each(node.routes, function (route) {
          if (!route.routes || route.routes.length === 0) {
            fn.call(context, memo.concat(route));
          } else {
            eachBranch(route, memo.concat(route), fn, context);
          }
        });
      }

      return this;
    },

    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    computeRoutes: function (path) {
      var found = false;
      var routes = [];
      _.each(this.matchers, function (matcher) {
        if (!found && matcher.regExp.test(path)) {
          found = true;
          routes = matcher.routes;
        }
      });
      return routes;
    },

    extractParams: function (path) {
      var found = false;
      var params;
      _.each(this.matchers, function (matcher) {
        if (!found && matcher.regExp.test(path)) {
          found = true;
          params = this._extractParameters(matcher.path, path);
        }
      }, this);
      return params;
    },

    dispatch: function (path) {
      var routes, params;

      path = path.substr(1);

      routes = this.computeRoutes(path);
      params = this.extractParams(path);

      var resolve, reject;
      var promise = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
      });

      var transition = this.activeTransition = {
        nextRoutes: routes,
        params: params,
        path: path,
        promise: promise,
        then: promise.then.bind(promise),
        catch: promise.catch.bind(promise)
      };

      var router = this;
      return when.reduce(this.dispatchHandlers, function(arg, task) {
        return task(transition, arg);
      }, null).then(function () {
        router.activeTransition = null;
        router.state = {
          routes: transition.nextRoutes,
          params: params,
          path: path
        };
        resolve();
      }).catch(reject);
    },

    listen: function (location) {
      var self = this;
      var location = this.location = location || this.defaultLocation();
      location.onChange(function(url) {
        self.dispatch(url);
      });
      return this.dispatch(location.getURL());
    },

    defaultLocation: function () {
      var locationOptions = _.pick(this.options, ["pushState", "root", "interceptLinks"]);
      return new HistoryLocation(locationOptions);
    },

    transitionTo: function(url) {
      if (url[0] !== "/") {
        url = "/" + this.generate.apply(this, arguments);
      }
      this.location.setURL(url);
    },

    replaceWith: function(url) {
      if (url[0] !== "/") {
        url = "/" + this.generate.apply(this, arguments);
      }
      this.location.replaceURL(url);
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
        delete currentParams.queryParams;
        pattern = matcher.path;
        paramNames = Path.extractParamNames(pattern);
        if (_.isObject(params)) {
          currentParams = _.extend(currentParams, params);
        } else {
          args = _.rest(arguments, 1);
          _.each(args, function (val, i) {
            var paramName = paramNames[paramNames.length - 1 - i];
            currentParams[paramName] = val;
          });
        }

        return this.location.formatURL(Path.injectParams(matcher.path, currentParams));
      } else {
        throw new Error('No route is named ' + name);
      }
    },

    destroy: function () {
      if (this.location.destroy) {
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
    return new CherrytreeRouter(options);
  };

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });