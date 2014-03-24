(function (define) { 'use strict';
  define(function () {
    return function () {
      return {
        path: '',

        getURL: function() {
          return this.path;
        },

        setURL: function(path) {
          this.path = path;
        },

        onUpdateURL: function(callback) {
          this.updateCallback = callback;
        },

        handleURL: function(url) {
          this.path = url;
          this.updateCallback(url);
        },

        formatURL: function(url) {
          // The return value is not overly meaningful, but we do not want to throw
          // errors when test code renders templates containing {{action href=true}}
          // helpers.
          return url;
        }
      };
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });