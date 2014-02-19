(function (define) { 'use strict';
  define(function (require) {

    var _ = require("underscore");
    var extend = require("./extend");

    // TODO options should be a generic hash of options,
    // it should contain params, which are the params extracted from the URL

    var Route = function (options) {
      this.name = options.name;
      this.router = options.router;
      this.id = _.uniqueId();
      this.initialize();
    };
    Route.prototype = {
      serialize: function () {
        return this.params;
      },
      initialize: function () {},
      beforeModel: function () {},
      model: function () {},
      // best hook for doing redirects
      afterModel: function () {},
      activate: function () {},
      destroy: function () {},
      enter: function () {
        this._setup = 0;
      },
      exit: function () {
        // console.log("EXIT", this.name);
        this.destroy.apply(this, arguments);
      },
      setup: function () {
        this._setup += 1;
        var route = this;
        var args = arguments;

        function activate() {
          // console.log("ACTIVATING", route.name);
          route.activate.apply(route, args);
        }

        function reactivate() {
          // console.log("REACTIVATING", route.name);
          route.exit();
          // route.enter.apply(route, args);
          route.activate.apply(route, args);
        }

        // if it's the first time setup is called after
        // the route has been entered - activate
        if (this._setup === 1) {
          return activate();
        }

        // give route.update a chance to deal with the change in context / params
        if (this.update && this.update.apply(this, args) === false) {
          return;
        }
        
        // reactivate
        reactivate();
      },
      setParent: function (parent) {
        this.parent = parent;
      },
      transitionTo: function () {
        var router = this.router;
        return router.transitionTo.apply(router, arguments);
      },
      replaceWith: function () {
        var router = this.router;
        return router.replaceWith.apply(router, arguments);
      },
      get: function (modelName) {
        var context;
        var route = this;
        while (route) {
          context = route.getContext();
          if (context && context[modelName]) {
            return context[modelName];
          } else if (route[modelName]) {
            // TODO: consider removing this, it should either be
            // context or any attribute of the route. Context is a lot
            // more explicit so probably a better choice.
            return route[modelName];
          } else {
            route = route.parent;
          }
        }
      }
    };

    Route.extend = extend;

    return Route;

  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });