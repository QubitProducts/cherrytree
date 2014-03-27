(function (define) { 'use strict';
  define(function (require) {

    var Promise = require("../vendor/promise");

    return function routeCreator(router) {
      var routeClasses = router.routeClasses;
      var prepares = router.prepares;
      var preparesCalled = {};

      function createRoute(name) {
        var Route = routeClasses[name] || router.options.BaseRoute;
        return new Route({
          name: name,
          router: router
        });
      }

      // TODO 2014-03-24 this async prepare loading might get
      // messed up if we call createRoute multiple times, because
      // we'll call prepares[routeName] multiple times and that
      // might break - we should guarantee to only call that once
      // and wait in case it's called multiple times.
      return function getRoute(name) {
        // if we don't have a prepare method for this route
        // or if it's already been called - proceed with creating
        // the route
        if (!prepares[name] || preparesCalled[name]) {
          return new Promise(function (resolve) {
            return resolve(createRoute(name));
          });
        } else {
          return new Promise(function (resolve) {
            prepares[name](router, function () {
              // record that this prepare has been called - we only
              // do this once per lifetime of application as it's
              // mostly intended for loading extra code
              preparesCalled[name] = true;
              return resolve(createRoute(name));
            });
          });
        }
      }; // wow.. what's happening here
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });