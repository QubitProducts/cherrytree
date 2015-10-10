'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  parse: function parse(querystring) {
    return querystring.split('&').reduce(function (acc, pair) {
      var parts = pair.split('=');
      acc[parts[0]] = decodeURIComponent(parts[1]);
      return acc;
    }, {});
  },

  stringify: function stringify(params) {
    return Object.keys(params).reduce(function (acc, key) {
      return acc + key + '=' + encodeURIComponent(params[key]);
    }, '');
  }
};
module.exports = exports['default'];