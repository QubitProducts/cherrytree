/**
 * A small helper for creating route maps.
 * This is useful mostly to workaround the standard linting
 * that no longer allows multiline objects.
 *
 * This helper converts this:
 * [
 *   route({ name: 'foo', path: ':foo' }, [
 *     route({ name: 'bar', path: ':bar' })
 *   ])
 * ]
 *
 * to this:
 *
 * [
 *   { name: 'foo', path: ':foo', children: [
 *     { name: 'bar', path: ':bar' }
 *   ]}
 * ]
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _dash = require('./dash');

var route = function route(options, children) {
  return (0, _dash.extend)({ children: children }, options);
};

exports['default'] = route;
module.exports = exports['default'];