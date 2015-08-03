'use strict';

var _ = require('./dash');
var invariant = require('./invariant');

module.exports = function dsl(callback) {
  var ancestors = [];
  var matches = {};
  var names = {};

  callback(function route(name, options, callback) {
    var routes = undefined;

    invariant(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name);

    names[name] = true;

    if (arguments.length === 1) {
      options = {};
    }

    if (arguments.length === 2 && typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (typeof options.path !== 'string') {
      var parts = name.split('.');
      options.path = parts[parts.length - 1];
      if (options.path === 'index') {
        options.path = '';
      }
    }

    // go to the next level
    if (callback) {
      ancestors = ancestors.concat(name);
      callback();
      routes = pop();
      ancestors.splice(-1);
    }

    // add the node to the tree
    push({
      name: name,
      path: options.path,
      routes: routes || [],
      options: options,
      ancestors: _.clone(ancestors)
    });
  });

  function pop() {
    return matches[currentLevel()] || [];
  }

  function push(route) {
    matches[currentLevel()] = matches[currentLevel()] || [];
    matches[currentLevel()].push(route);
  }

  function currentLevel() {
    return ancestors.join('.');
  }

  return pop();
};