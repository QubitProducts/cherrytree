(function (define) { 'use strict';
  define(function (require) {

    var _ = require('./utils/smalldash');

    function DSL(parent) {
      this.parent = parent;
      this.matches = [];
      this.resolvers = {};
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

        if (options.resolver) {
          this.addResolver(name, options.resolver);
        }

        if (callback) {
          var dsl = new DSL(name);
          callback.call(dsl);
          this.push(options.path, name, dsl.generate(), options.queryParams);
          _.extend(this.resolvers, dsl.resolvers);
        } else {
          this.push(options.path, name, null, options.queryParams);
        }
      },

      route: function (name, options) {
        options = options || {};

        if (typeof options.path !== 'string') {
          options.path = "/" + name;
        }

        if (this.parent && this.parent !== 'application') {
          name = this.parent + "." + name;
        }

        if (options.resolver) {
          this.addResolver(name, options.resolver);
        }

        this.push(options.path, name, null, options.queryParams);
      },

      push: function (url, name, callback, queryParams) {
        var parts = name.split('.');
        if (url === "" || url === "/" || parts[parts.length - 1] === "index") { this.explicitIndex = true; }

        this.matches.push([url, name, callback, queryParams]);
      },

      addResolver: function (name, fn) {
        this.resolvers[name] = fn;
      },

      generate: function () {
        var dslMatches = this.matches;

        if (!this.explicitIndex) {
          this.route("index", { path: "/" });
        }

        return function (match) {
          for (var i = 0, l = dslMatches.length; i < l; i++) {
            var dslMatch = dslMatches[i];
            match(dslMatch[0]).to(dslMatch[1], dslMatch[2]);
          }
        };
      }
    };

    DSL.map = function (callback) {
      var dsl = new DSL();
      callback.call(dsl);
      return dsl;
    };

    return DSL;

  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });