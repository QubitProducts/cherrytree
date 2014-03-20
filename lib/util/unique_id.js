(function (define) { 'use strict';
  define(function () {
    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    return function(prefix) {
      var id = ++idCounter + '';
      return prefix ? prefix + id : id;
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });