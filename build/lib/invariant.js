'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = invariant;

function invariant(condition, format, a, b, c, d, e, f) {
  if (!condition) {
    (function () {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      var error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.framesToPop = 1; // we don't care about invariant's own frame
      throw error;
    })();
  }
}

module.exports = exports['default'];