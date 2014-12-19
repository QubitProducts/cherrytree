(function (define) { 'use strict';
  define(function (require) {

    var Promise = require("../../vendor/promise");

    return function resolveKeys(obj) {
      if (!obj) {
        return Promise.resolve();
      }

      var keys = Object.keys(obj);

      var resolvedObj = {};
      
      return Promise.all(
        keys.map(function (key) {
          return Promise.resolve(obj[key]).then(function (value) {
            resolvedObj[key] = value;
          });
        })
      ).then(function () {
        return resolvedObj;
      });
    };

  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });