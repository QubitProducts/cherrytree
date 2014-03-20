(function (define) { 'use strict';
  define(function () {
    return function extend(obj, source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
      return obj;
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });