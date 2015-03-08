/*eslint-disable */
(function (define) { 'use strict';
  define(function (require) {
/*eslint-enable */

    return function dsl (callback, ancestors) {
      if (!callback) {
        return []
      }

      ancestors = ancestors || []
      var matches = []

      callback.call({
        route: function route (name, options, callback) {
          var parts

          if (arguments.length === 1) {
            options = {}
          }

          if (arguments.length === 2 && typeof options === 'function') {
            callback = options
            options = {}
          }

          if (typeof options.path !== 'string') {
            parts = name.split('.')
            options.path = parts[parts.length - 1]
            if (options.path === 'index') {
              options.path = ''
            }
          }
          matches.push({
            path: options.path,
            name: name,
            routes: dsl(callback, ancestors.concat(name)),
            options: options,
            ancestors: ancestors
          })
        }
      })

      return matches
    }

  })
/*eslint-disable */
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require) })
/*eslint-enable */
