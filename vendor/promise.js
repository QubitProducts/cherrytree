(function (define) { 'use strict';
  define(function (require) {
    return require("when/lib/Promise");
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });