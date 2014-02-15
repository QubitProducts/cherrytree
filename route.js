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
      this.destroy.apply(this, arguments);
    },
    setup: function () {
      this._setup++;
      var route = this;
      var args = arguments;

      function activate() {
        console.log("activating", route.name);
        route.activate.apply(route, args);
      }

      function reactivate() {
        console.log("reaactivating", route.name);
        route.exit();
        route.enter.apply(route, args);
        route.activate.apply(route, args);
      }

      if (this._setup > 1) {
        if (this.update) {
          if (this.update.apply(this, arguments) === false) {
            activate();
          } else {
            reactivate();
          }
        } else {
          reactivate();
        }
      } else {
        activate();
      }
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
      var route = this;
      while (route) {
        if (route[modelName]) {
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