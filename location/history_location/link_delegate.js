(function (define) { 'use strict';
  define(function (require) {

    var events = require('./events');

    var exports = {};

    var link = function (element) {
      element = {parentNode: element};

      var root = document;

      // Make sure `element !== document` and `element != null`
      // otherwise we get an illegal invocation
      while ((element = element.parentNode) && element !== document) {
        if (element.tagName.toLowerCase() === 'a') {
          return element;
        }
        // After `matches` on the edge case that
        // the selector matches the root
        // (when the root is not the document)
        if (element === root) {
          return;
        }
      }
    };

    /**
     * Delegate event `type` to links
     * and invoke `fn(e)`. A callback function
     * is returned which may be passed to `.unbind()`.
     *
     * @param {Element} el
     * @param {String} selector
     * @param {String} type
     * @param {Function} fn
     * @param {Boolean} capture
     * @return {Function}
     * @api public
     */

    var delegate = function(el, type, fn){
      return events.bind(el, type, function(e) {
        var target = e.target || e.srcElement;
        var el = link(target);
        if (el) {
          fn(e, el);
        }
      });
    };

    /**
     * Unbind event `type`'s callback `fn`.
     *
     * @param {Element} el
     * @param {String} type
     * @param {Function} fn
     * @param {Boolean} capture
     * @api public
     */

    var undelegate = function(el, type, fn) {
      // TODO 2014-03-25 fix unbinding - this fn we're trying
      // to ubind has never been bound, we bound an anonymous function
      events.unbind(el, type, fn);
    };

    /**
     * Handle link delegation on `el` or the document,
     * and invoke `fn(e)` when clickable.
     *
     * @param {Element|Function} el or fn
     * @param {Function} [fn]
     * @api public
     */

    exports.delegate = function(el, fn) {
      // default to document
      if ('function' === typeof el) {
        fn = el;
        el = document;
      }

      delegate(el, 'click', function(e, el) {
        if (clickable(e, el)) fn(e, el);
      });
    };

    exports.undelegate = function (el, fn) {
      // default to document
      if ('function' === typeof el) {
        fn = el;
        el = document;
      }

      // TODO 2014-03-25 fix undelegation here too
      undelegate(el, 'click', fn);
    };

    /**
     * Check if `e` is clickable.
     */

    function clickable(e, el) {
      if (1 !== which(e)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (e.defaultPrevented) return;

      // check target
      if (el.target) return;

      // check for data-bypass attribute
      if (el.getAttribute('data-bypass') !== null) return;
      
      // inspect the href
      var href = el.getAttribute('href');
      if (!href || href.length === 0) return;
      // don't handle hash links
      if (href[0] === '#') return;
      // external/absolute links
      if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) return;
      // don't intercept javascript links
      if (href.indexOf("javascript:") === 0) return;

      return true;
    }

    /**
     * Event button.
     */

    function which(e) {
      e = e || window.event;
      return null === e.which ? e.button : e.which;
    }

    return exports;
});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });