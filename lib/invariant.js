(function (define) { 'use strict';
define(function (require) {

  var __DEV__ = true;
  var invariant = function(condition, format, a, b, c, d, e, f) {
    if (__DEV__) {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument');
      }
    }

    if (!condition) {
      var error;
      if (format === undefined) {
        error = new Error(
          'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
        );
      } else {
        var args = [a, b, c, d, e, f];
        var argIndex = 0;
        error = new Error(
          'Invariant Violation: ' +
          format.replace(/%s/g, function() { return args[argIndex++]; })
        );
      }

      error.framesToPop = 1; // we don't care about invariant's own frame
      throw error;
    }
  };

  return invariant;

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });