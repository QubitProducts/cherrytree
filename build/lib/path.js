"use strict";

var _ = require("./dash");
var invariant = require("./invariant");
var merge = require("qs/lib/utils").merge;
var qs = require("qs");
var pathToRegexp = require("path-to-regexp");

var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?+*]?)/g;
var specialParamChars = /[+*?]$/g;
var queryMatcher = /\?(.+)/;

var _compiledPatterns = {};

function compilePattern(pattern) {
  if (!(pattern in _compiledPatterns)) {
    var paramNames = [];
    var re = pathToRegexp(pattern, paramNames);

    _compiledPatterns[pattern] = {
      matcher: re,
      paramNames: _.pluck(paramNames, "name")
    };
  }

  return _compiledPatterns[pattern];
}

var Path = {

  /**
   * Returns true if the given path is absolute.
   */
  isAbsolute: function isAbsolute(path) {
    return path.charAt(0) === "/";
  },

  /**
   * Joins two URL paths together.
   */
  join: function join(a, b) {
    return a.replace(/\/*$/, "/") + b;
  },

  /**
   * Returns an array of the names of all parameters in the given pattern.
   */
  extractParamNames: function extractParamNames(pattern) {
    return compilePattern(pattern).paramNames;
  },

  /**
   * Extracts the portions of the given URL path that match the given pattern
   * and returns an object of param name => value pairs. Returns null if the
   * pattern does not match the given path.
   */
  extractParams: function extractParams(pattern, path) {
    var cp = compilePattern(pattern);
    var matcher = cp.matcher;
    var paramNames = cp.paramNames;
    var match = path.match(matcher);

    if (!match) {
      return null;
    }

    var params = {};

    paramNames.forEach(function (paramName, index) {
      params[paramName] = match[index + 1];
    });

    return params;
  },

  /**
   * Returns a version of the given route path with params interpolated. Throws
   * if there is a dynamic segment of the route path for which there is no param.
   */
  injectParams: function injectParams(pattern, params) {
    params = params || {};

    return pattern.replace(paramInjectMatcher, function (match, param) {
      var paramName = param.replace(specialParamChars, "");

      // If param is optional don't check for existence
      if (param.slice(-1) === "?" || param.slice(-1) === "*") {
        if (params[paramName] == null) {
          return "";
        }
      } else {
        invariant(params[paramName] != null, "Missing '%s' parameter for path '%s'", paramName, pattern);
      }

      return params[paramName];
    });
  },

  /**
   * Returns an object that is the result of parsing any query string contained
   * in the given path, null if the path contains no query string.
   */
  extractQuery: function extractQuery(path) {
    var match = path.match(queryMatcher);
    return match && qs.parse(match[1]);
  },

  /**
   * Returns a version of the given path without the query string.
   */
  withoutQuery: function withoutQuery(path) {
    return path.replace(queryMatcher, "");
  },

  /**
   * Returns a version of the given path with the parameters in the given
   * query merged into the query string.
   */
  withQuery: function withQuery(path, query) {
    var existingQuery = Path.extractQuery(path);

    if (existingQuery) {
      query = query ? merge(existingQuery, query) : existingQuery;
    }

    var queryString = qs.stringify(query, { indices: false });

    if (queryString) {
      return Path.withoutQuery(path) + "?" + queryString;
    }

    return path;
  }

};

module.exports = Path;