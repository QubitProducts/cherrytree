(function (define) { 'use strict';
define(function (require) {

  var _ = require('lodash');

  function DSL(ancestors) {
    this.ancestors = ancestors;
    this.matches = [];
  }

  DSL.prototype.route = function route(name, options, callback) {
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
      var routes = DSL.map(callback, this.ancestors.concat(name));
      this.push(options.path, name, options, routes);
    } else {
      this.push(options.path, name, options, null);
    }
  };

  DSL.prototype.push = function (url, name, options, routes) {
    this.matches.push({
      path: url,
      name: name,
      routes: routes,
      options: options,
      ancestors: this.ancestors
    });
  };

  DSL.prototype.generate = function () {
    return this.matches;
  };

  DSL.map = function (callback, ancestors) {
    var dsl = new DSL(ancestors || []);
    callback.call(dsl);
    return dsl.generate();
  };

  return DSL;

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });