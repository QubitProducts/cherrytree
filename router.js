(function (define) { 'use strict';
  define(function (require) {

    var _ = require("./lib/util");
    var Router = require("./vendor/router");
    var BaseRoute = require("./route");
    var RouterDSL = require("./lib/dsl");
    var handlerCreator = require("./lib/handler_creator");
    var HistoryLocation = require("./locations/history");

    var CherrytreeRoute = function () {
      this.initialize.apply(this, arguments);
    };

    _.extend(CherrytreeRoute.prototype, {

      initialize: function (options) {
        var router = this;

        // the underlying router.js ember microlib
        this.router = new Router();
        this.router.log = this.log;
        this.resolvers = {};
        this.routes = {};

        this.options = _.extend({
          location: false,
          logging: false,
          onDidTransition: null,
          onURLChanged: null,
          BaseRoute: BaseRoute,
          resolver: function (name, cb) {
            cb(router.routes[name]);
          },
          map: null
        }, options);

        if (!this.options.location) {
          this.locationOptions = _.pick(this.options, ["pushState", "root", "interceptLinks"]);
        }

        if (this.options.routes) {
          this.routes = this.options.routes;
        }

        if (this.options.resolver) {
          this.resolvers["application"] = this.options.resolver;
        }

        if (this.options.logging) {
          this.log = function () {
            console && console.log.apply(console, arguments);
          };
        }

        if (this.options.map) {
          this.map(this.options.map);
        }
      },

      map: function (callback) {
        var router = this.router;

        var dsl = RouterDSL.map(function () {
          this.resource("application", { path: "/" }, function () {
            callback.call(this);
          });
        });

        router.map(dsl.generate());
        _.extend(this.resolvers, dsl.resolvers);

        return this;
      },

      startRouting: function () {
        var self = this;
        var router = this.router;
        var location = this.location = this.options.location ||
          new HistoryLocation(this.options.locationOptions);

        setupRouter(this, router, location);

        location.onChange(function(url) {
          self.handleURL(url);
        });

        return this.handleURL(location.getURL());
      },

      transitionTo: function() {
        var args = [].slice.call(arguments);
        return doTransition(this, 'transitionTo', args);
      },

      replaceWith: function() {
        var args = [].slice.call(arguments);
        return doTransition(this, 'replaceWith', args);
      },

      generate: function() {
        var url = this.router.generate.apply(this.router, arguments);
        return this.location.formatURL(url);
      },

      isActive: function(routeName) {
        var router = this.router;
        return router.isActive.apply(router, arguments);
      },

      send: function(name, context) {
        this.router.trigger.apply(this.router, arguments);
      },

      hasRoute: function(route) {
        return this.router.hasRoute(route);
      },

      getBranchNames: function (name) {
        if (name === "application") {
          return ["application"];
        } else if (name === "loading") {
          return ["application", "loading"];
        } else {
          var names = this.router.recognizer.names[name];
          return _.pluck(names.handlers, "handler");
        }
      },

      activeRoutes: function (name) {
        var activeRoutes = _.pluck(_.pluck(this.router.currentHandlerInfos, "handler"), "route");
        if (name) {
          for (var i = 0, length = activeRoutes.length; i < length; i++) {
            if (activeRoutes[i].name === name) {
              return activeRoutes[i];
            }
          }
        } else {
          return activeRoutes;
        }
      },

      activeRouteNames: function () {
        return _.pluck(_.pluck(_.pluck(this.router.currentHandlerInfos, "handler"), "route"), "name");
      },

      destroy: function () {
        if (this.location.destroy) {
          this.location.destroy();
        }
      },

      /**
       * @private
       */
      log: function () {},

      /**
       * @private
       */
      didTransition: function (infos) {
        if (this.options.onDidTransition) {
          this.options.onDidTransition(routePath(infos));
        }
      },

      /**
       * @private
       */
      handleURL: function(url) {
        scheduleLoadingRouteEntry(this);

        var self = this;

        return this.router.handleURL(url).then(function() {
          transitionCompleted(self);
        }, function(err) {
          transitionFailed(err, self);
          return err;
        });
      },

      /**
        @private

        Resets the state of the router by clearing the current route
        handlers and deactivating them.

        @method reset
       */
      reset: function() {
        this.router.reset();
      }
    });

    return CherrytreeRoute;


    /**
     *
     */

    function assert(desc, test) {
      if (!test) throw new Error("assertion failed: " + desc);
    }

    function routePath(handlerInfos) {
      var path = [];

      for (var i=1, l=handlerInfos.length; i<l; i++) {
        var name = handlerInfos[i].name,
            nameParts = name.split(".");

        path.push(nameParts[nameParts.length - 1]);
      }

      return path.join(".");
    }

    function setupRouter(cherrytree, router, location) {
      router.getHandler = handlerCreator(cherrytree);
      router.updateURL = function(path) {
        location.setURL(path);
      };
      router.replaceURL = function(path) {
        location.replaceURL(path);
      };
      router.didTransition = function(infos) {
        cherrytree.didTransition(infos);
      };
    }

    function doTransition(router, method, args) {
      // Normalize blank route to root URL.
      args = [].slice.call(args);
      args[0] = args[0] || '/';

      var passedName = args[0], name;

      if (passedName.charAt(0) === '/') {
        name = passedName;
      } else {
        if (!router.router.hasRoute(passedName)) {
          name = args[0] = passedName + '.index';
        } else {
          name = passedName;
        }

        assert("The route " + passedName + " was not found", router.router.hasRoute(name));
      }

      scheduleLoadingRouteEntry(router);

      var transitionPromise = router.router[method].apply(router.router, args);
      transitionPromise.then(function() {
        transitionCompleted(router);
      }, function(err) {
        transitionFailed(err, router);
        return err;
      });

      // We want to return the configurable promise object
      // so that callers of this function can use `.method()` on it,
      // which obviously doesn't exist for normal RSVP promises.
      return transitionPromise;
    }

    function scheduleLoadingRouteEntry(router) {
      if (router._loadingRouteActive) { return; }
      router._shouldEnterLoadingRoute = true;
      // Ember.run.scheduleOnce('routerTransitions', null, enterLoadingRoute, router);
      setTimeout(function () {
        enterLoadingRoute(router);
      }, 1);
    }

    function enterLoadingRoute(router) {
      if (router._loadingRouteActive || !router._shouldEnterLoadingRoute) { return; }

      var loadingRoute = router.router.getHandler('loading');
      if (loadingRoute) {
        if (loadingRoute.model) { loadingRoute.model(); }
        if (loadingRoute.enter) { loadingRoute.enter(); }
        if (loadingRoute.setup) { loadingRoute.setup(); }
        router._loadingRouteActive = true;
      }
    }

    function exitLoadingRoute(router) {
      router._shouldEnterLoadingRoute = false;
      if (!router._loadingRouteActive) { return; }

      var loadingRoute = router.router.getHandler('loading');
      if (loadingRoute && loadingRoute.exit) { loadingRoute.exit(); }
      router._loadingRouteActive = false;
    }

    function transitionCompleted(router) {
      exitLoadingRoute(router);
      if (router.options.onURLChanged) {
        router.options.onURLChanged(router.location.getURL());
      }
    }

    /**
      we want to complete the transition
      we want to notify everyone that url changed TODO (?)
      we want to exit the loading route
    */
    function transitionFailed(err, router) {
      // only complete transition if it's not a redirect
      if (!router.router.activeTransition) {
        transitionCompleted(router);
      }
      // only log if it wasn't a redirect
      if (err.name !== "TransitionAborted") {
        console && console.error(err.stack ? err.stack : err);
      }
    }

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });