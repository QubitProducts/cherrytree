'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var events = createEvents();

exports['default'] = events;

function createEvents() {
  var exp = {};

  if (typeof window === 'undefined') {
    return exp;
  }

  /**
  * DOM Event bind/unbind
  */

  var bind = window.addEventListener ? 'addEventListener' : 'attachEvent';
  var unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
  var prefix = bind !== 'addEventListener' ? 'on' : '';

  /**
  * Bind `el` event `type` to `fn`.
  *
  * @param {Element} el
  * @param {String} type
  * @param {Function} fn
  * @param {Boolean} capture
  * @return {Function}
  * @api public
  */

  exp.bind = function (el, type, fn, capture) {
    el[bind](prefix + type, fn, capture || false);
    return fn;
  };

  /**
  * Unbind `el` event `type`'s callback `fn`.
  *
  * @param {Element} el
  * @param {String} type
  * @param {Function} fn
  * @param {Boolean} capture
  * @return {Function}
  * @api public
  */

  exp.unbind = function (el, type, fn, capture) {
    el[unbind](prefix + type, fn, capture || false);
    return fn;
  };

  return exp;
}
module.exports = exports['default'];