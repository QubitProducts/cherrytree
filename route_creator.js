(function (define) { 'use strict';
  define(function (require) {

    // var _ = require("underscore");
    var RSVP = require("rsvp");
    var BaseRoute = require("./route");

    function createRoute(router, name, Route) {
      return new Route({
        name: name,
        router: router
      });
    }

    return function routeCreator(router) {
      var routeClasses = router.routeClasses;
      var prepares = router.prepares;
      var preparesCalled = {};

      return {
        createRoute: function (name) {
          var Route;
          // if we don't have a prepare method for this route
          // or if it's already been called - proceed with creating
          // the route
          if (!prepares[name] || preparesCalled[name]) {
            Route = routeClasses[name] || router.BaseRoute || BaseRoute;
            return new RSVP.Promise(function (resolve) {
              return resolve(createRoute(router, name, Route));
            });
          } else {
            return new RSVP.Promise(function (resolve) {
              prepares[name](router, function () {
                // record that this prepare has been called - we only
                // do this per the lifetime of the application as it's
                // mostly intended for loading extra code
                preparesCalled[name] = true;

                // now that we gave the prepare method a chance to preload the routes
                Route = routeClasses[name] || router.BaseRoute || BaseRoute;
                return resolve(createRoute(router, name, Route));
              });
            });
          }
        }
      };
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });