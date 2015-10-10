'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var toString = Object.prototype.toString;
var keys = Object.keys;
var assoc = function assoc(obj, attr, val) {
  obj[attr] = val;return obj;
};
var isArray = function isArray(obj) {
  return toString.call(obj) === '[object Array]';
};

var clone = function clone(obj) {
  return obj ? isArray(obj) ? obj.slice(0) : extend({}, obj) : obj;
};

exports.clone = clone;
var pick = function pick(obj, attrs) {
  return attrs.reduce(function (acc, attr) {
    return obj[attr] === undefined ? acc : assoc(acc, attr, obj[attr]);
  }, {});
};

exports.pick = pick;
var isEqual = function isEqual(obj1, obj2) {
  return keys(obj1).length === keys(obj2).length && keys(obj1).reduce(function (acc, key) {
    return acc && obj2[key] === obj1[key];
  }, true);
};

exports.isEqual = isEqual;
var extend = function extend(obj) {
  for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }

  rest.forEach(function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

exports.extend = extend;
var isString = function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
};
exports.isString = isString;