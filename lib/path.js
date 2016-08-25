import invariant from './invariant'
import pathToRegexp from 'path-to-regexp'

let paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?+*]?)/g
let specialParamChars = /[+*?]$/g
let queryMatcher = /\?(.+)/

let _compiledPatterns = {}

function compilePattern (pattern) {
  if (!(pattern in _compiledPatterns)) {
    let paramNames = []
    let re = pathToRegexp(pattern, paramNames)

    _compiledPatterns[pattern] = {
      matcher: re,
      paramNames: paramNames.map(p => p.name)
    }
  }

  return _compiledPatterns[pattern]
}

let Path = {
  /**
   * Returns true if the given path is absolute.
   */
  isAbsolute: function (path) {
    return path.charAt(0) === '/'
  },

  /**
   * Joins two URL paths together.
   */
  join: function (a, b) {
    return a.replace(/\/*$/, '/') + b
  },

  /**
   * Returns an array of the names of all parameters in the given pattern.
   */
  extractParamNames: function (pattern) {
    return compilePattern(pattern).paramNames
  },

  /**
   * Extracts the portions of the given URL path that match the given pattern
   * and returns an object of param name => value pairs. Returns null if the
   * pattern does not match the given path.
   */
  extractParams: function (pattern, path) {
    let cp = compilePattern(pattern)
    let matcher = cp.matcher
    let paramNames = cp.paramNames
    let match = path.match(matcher)

    if (!match) {
      return null
    }

    let params = {}

    paramNames.forEach(function (paramName, index) {
      params[paramName] = match[index + 1] && decodeURIComponent(match[index + 1])
    })

    return params
  },

  /**
   * Returns a version of the given route path with params interpolated. Throws
   * if there is a dynamic segment of the route path for which there is no param.
   */
  injectParams: function (pattern, params) {
    params = params || {}

    return pattern.replace(paramInjectMatcher, function (match, param) {
      let paramName = param.replace(specialParamChars, '')
      let lastChar = param.slice(-1)

      // If param is optional don't check for existence
      if (lastChar === '?' || lastChar === '*') {
        if (params[paramName] == null) {
          return ''
        }
      } else {
        invariant(
          params[paramName] != null,
          "Missing '%s' parameter for path '%s'",
          paramName, pattern
        )
      }

      let paramValue = encodeURIComponent(params[paramName])
      if (lastChar === '*' || lastChar === '+') {
        // restore / for splats
        paramValue = paramValue.replace('%2F', '/')
      }
      return paramValue
    })
  },

  /**
   * Returns an object that is the result of parsing any query string contained
   * in the given path, null if the path contains no query string.
   */
  extractQuery: function (qs, path) {
    let match = path.match(queryMatcher)
    return match && qs.parse(match[1])
  },

  /**
   * Returns a version of the given path with the parameters in the given
   * query merged into the query string.
   */
  withQuery: function (qs, path, query) {
    let queryString = qs.stringify(query, { indices: false })

    if (queryString) {
      return Path.withoutQuery(path) + '?' + queryString
    }

    return path
  },

  /**
   * Returns a version of the given path without the query string.
   */
  withoutQuery: function (path) {
    return path.replace(queryMatcher, '')
  }
}

export default Path
