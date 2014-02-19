(function (define) { 'use strict';
  define(function (require) {

    var _ = require("underscore");

    function DSL(name, router) {
      this.parent = name;
      this.router = router;
      this.matches = [];
      this.prepares = {};

      this.state = this.addRoute;
      this.states = this.addRoutes;
    }

    DSL.prototype = {
      resource: function (name, options, callback) {
        if (arguments.length === 2 && typeof options === 'function') {
          callback = options;
          options = {};
        }

        if (arguments.length === 1) {
          options = {};
        }

        if (typeof options.path !== 'string') {
          options.path = "/" + name;
        }

        // a method we'll call before entering this route
        if (options.prepare) {
          this.prepares[name] = options.prepare;
        }

        if (callback) {
          var dsl = new DSL(name, this.router);
          callback.call(dsl);
          this.push(options.path, name, dsl.generate(), options.queryParams);
          _.extend(this.prepares, dsl.prepares);
        } else {
          this.push(options.path, name, null, options.queryParams);
        }
      },

      push: function (url, name, callback, queryParams) {
        var parts = name.split('.');
        if (url === "" || url === "/" || parts[parts.length - 1] === "index") { this.explicitIndex = true; }

        this.matches.push([url, name, callback, queryParams]);
      },

      route: function (name, options) {
        // Ember.assert("You must use `this.resource` to nest", typeof options !== 'function');

        options = options || {};

        if (typeof options.path !== 'string') {
          options.path = "/" + name;
        }

        if (this.parent && this.parent !== 'application') {
          name = this.parent + "." + name;
        }

        if (options.prepare) {
          this.prepares[name] = options.prepare;
        }

        this.push(options.path, name, null, options.queryParams);
      },

      generate: function () {
        var dslMatches = this.matches;

        if (!this.explicitIndex) {
          this.route("index", { path: "/" });
        }

        return function (match) {
          for (var i = 0, l = dslMatches.length; i < l; i++) {
            var dslMatch = dslMatches[i];
            var matchObj = match(dslMatch[0]).to(dslMatch[1], dslMatch[2]);
            if (dslMatch[3]) {
              matchObj.withQueryParams.apply(matchObj, dslMatch[3]);
            }
          }
        };
      },

      addRoute: function () {
        this.router.addRoute.apply(this.router, arguments);
      },

      addRoutes: function () {
        this.router.addRoutes.apply(this.router, arguments);
      }
    };

    DSL.map = function (router, callback) {
      var dsl = new DSL(null, router);
      callback.call(dsl);
      return dsl;
    };

    return DSL;

  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });