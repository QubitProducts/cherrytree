(function (define) { 'use strict';
define(function (require) {

  var _ = require('lodash');

  function DSL() {
    this.matches = [];
  }

  _.extend(DSL.prototype, {
    route: function (name, options, callback) {
      if (arguments.length === 2 && typeof options === 'function') {
        callback = options;
        options = {};
      }

      if (arguments.length === 1) {
        options = {};
      }

      if (typeof options.path !== 'string') {
        var parts = name.split(".");
        options.path = parts[parts.length - 1];
      }

      if (callback) {
        var routes = DSL.map(callback);
        this.push(options.path, name, routes);
      } else {
        this.push(options.path, name, null);
      }
    },

    push: function (url, name, routes) {
      this.matches.push({
        path: url,
        name: name,
        routes: routes
      });
    },

    generate: function () {
      return this.matches;
    }
  });

  DSL.map = function (callback) {
    var dsl = new DSL();
    callback.call(dsl);
    return dsl.generate();
  };

  return DSL;

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });