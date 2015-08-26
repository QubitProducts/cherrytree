'use strict';

function reduce(list, iterator) {
  list = list || [];
  var keys = getKeys(list);
  var i = 0;
  var accumulator = list[0];

  if (arguments.length === 2) {
    i = 1;
  } else if (arguments.length === 3) {
    accumulator = arguments[2];
  }

  for (var len = keys.length; i < len; i++) {
    var key = keys[i];
    var value = list[key];
    accumulator = iterator.call(null, accumulator, value, key, list);
  }

  return accumulator;
}

function getKeys(obj) {
  var keys = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
}

function map(list, iterator) {
  return reduce(list, function (accumulator, value, i) {
    accumulator.push(iterator.call(null, value, i));
    return accumulator;
  }, []);
}

function each(list, iterator) {
  map(list, iterator);
}

function pluck(list, attr) {
  return map(list, function (item) {
    return item[attr];
  });
}

function pick(obj, attrs) {
  return reduce(attrs, function (accumulator, attr) {
    accumulator[attr] = obj[attr];
    return accumulator;
  }, {});
}

function toArray(args) {
  return Array.prototype.slice.call(args);
}

function extend(obj1, obj2) {
  return reduce(obj2 || {}, function (accumulator, value, key) {
    obj1[key] = value;
    return obj1;
  }, obj1 || {});
}

function clone(obj) {
  return isArray(obj) ? obj.slice(0) : extend({}, obj);
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function isEqual(obj1, obj2) {
  return reduce(obj1, function (accumulator, value, key) {
    return accumulator && obj2[key] === value;
  }, true) && getKeys(obj1).length === getKeys(obj2).length;
}

module.exports = {
  reduce: reduce,
  map: map,
  each: each,
  pluck: pluck,
  pick: pick,
  toArray: toArray,
  extend: extend,
  clone: clone,
  isEqual: isEqual
};