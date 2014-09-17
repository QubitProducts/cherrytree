(function (define) { 'use strict';
  define(function (require) {

    var Promise = require("../vendor/promise");

    return function routeCreator(router) {
      var cache = {};

      function createRoute(name) {
        var Route = cache[name] || router.options.defaultRouteHandler;
        return new Route({
          name: name,
          router: router
        });
      }

      function resolveRoute(name, cb) {
        return getRouteResolver(name)(name, cb);
      }

      function getRouteResolver(name) {
        var routeName, i, l;
        var branches = router.getBranchNames(name);
        for (i = branches.length - 1, l = 0; i >= l; i--) {
          routeName = branches[i];
          if (router.resolvers[routeName]) {
            return router.resolvers[routeName];
          }
        }
      }

      function promise(value) {
        return new Promise(function (resolve) {
          resolve(value);
        });
      }

      return function getRoute(name) {
        // if we have resolved this previously, or are in the
        // process of resolving - wait on the promise and
        // then create the route
        if (cache[name] && cache[name].then) {
          return cache[name].then(function (name) {
            return createRoute(name);
          });
        }

        // if we have resolved previously
        // but it's not a promise, return the promise
        // for the route
        if (cache[name]) {
          return promise(createRoute(name));
        }

        // use the route resolver to get the Route
        cache[name] = new Promise(function (resolve, reject) {
          resolveRoute(name, function (route) {
            cache[name] = route;
            resolve(createRoute(name));
          }, reject);
        });

        return cache[name];
      };
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });