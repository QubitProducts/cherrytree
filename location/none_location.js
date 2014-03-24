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

        replaceURL: function (path) {
          this.setURL(path);
        },

        onChange: function(callback) {
          this.changeCallback = callback;
        },

        handleURL: function(url) {
          this.path = url;
          if (this.changeCallback) {
            this.changeCallback(url);
          }
        },

        formatURL: function(url) {
          return url;
        }
      };
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });