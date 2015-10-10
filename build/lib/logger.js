"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createLogger;

function createLogger(log, options) {
  options = options || {};
  // falsy means no logging
  if (!log) return function () {};
  // custom logging function
  if (log !== true) return log;
  // true means use the default logger - console
  var fn = options.error ? console.error : console.info;
  return function () {
    fn.apply(console, arguments);
  };
}

module.exports = exports["default"];