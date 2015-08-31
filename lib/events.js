let events = createEvents()

export default events

function createEvents () {
  let exp = {}

  if (typeof window === 'undefined') {
    return exp
  }

  /**
  * DOM Event bind/unbind
  */

  let bind = window.addEventListener ? 'addEventListener' : 'attachEvent'
  let unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent'
  let prefix = bind !== 'addEventListener' ? 'on' : ''

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
    el[bind](prefix + type, fn, capture || false)
    return fn
  }

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
    el[unbind](prefix + type, fn, capture || false)
    return fn
  }

  return exp
}
