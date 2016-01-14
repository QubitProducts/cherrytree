'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dash = require('../dash');

var _locationBar = require('location-bar');

var _locationBar2 = _interopRequireDefault(_locationBar);

exports['default'] = BrowserLocation;

function BrowserLocation(options) {
  this.path = options.path || '';

  this.options = (0, _dash.extend)({
    pushState: false,
    root: '/'
  }, options);

  // we're using the location-bar module for actual
  // URL management
  var self = this;
  this.locationBar = new _locationBar2['default']();
  this.locationBar.onChange(function (path) {
    self.handleURL('/' + (path || ''));
  });

  this.locationBar.start((0, _dash.extend)({}, options));
}

/**
 * Check if we're actually using pushState. For browsers
 * that don't support it this would return false since
 * it would fallback to using hashState / polling
 * @return {Bool}
 */

BrowserLocation.prototype.usesPushState = function () {
  return this.options.pushState && this.locationBar.hasPushState();
};

/**
 * Get the current URL
 */

BrowserLocation.prototype.getURL = function () {
  return this.path;
};

/**
 * Set the current URL without triggering any events
 * back to the router. Add a new entry in browser's history.
 */

BrowserLocation.prototype.setURL = function (path, options) {
  if (this.path !== path) {
    this.path = path;
    this.locationBar.update(path, (0, _dash.extend)({ trigger: true }, options));
  }
};

/**
 * Set the current URL without triggering any events
 * back to the router. Replace the latest entry in broser's history.
 */

BrowserLocation.prototype.replaceURL = function (path, options) {
  if (this.path !== path) {
    this.path = path;
    this.locationBar.update(path, (0, _dash.extend)({ trigger: true, replace: true }, options));
  }
};

/**
 * Setup a URL change handler
 * @param  {Function} callback
 */
BrowserLocation.prototype.onChange = function (callback) {
  this.changeCallback = callback;
};

/**
 * Given a path, generate a URL appending root
 * if pushState is used and # if hash state is used
 */
BrowserLocation.prototype.formatURL = function (path) {
  if (this.locationBar.hasPushState()) {
    var rootURL = this.options.root;
    if (path !== '') {
      rootURL = rootURL.replace(/\/$/, '');
      path = path.replace(/\/+$/, '');
    }
    return rootURL + path;
  } else {
    if (path[0] === '/') {
      path = path.substr(1);
    }
    return '#' + path;
  }
};

/**
 * When we use pushState with a custom root option,
 * we need to take care of removingRoot at certain points.
 * Specifically
 * - browserLocation.update() can be called with the full URL by router
 * - LocationBar expects all .update() calls to be called without root
 * - this method is public so that we could dispatch URLs without root in router
 */
BrowserLocation.prototype.removeRoot = function (url) {
  if (this.options.pushState && this.options.root && this.options.root !== '/') {
    return url.replace(this.options.root, '');
  } else {
    return url;
  }
};

/**
 * Stop listening to URL changes and link clicks
 */
BrowserLocation.prototype.destroy = function () {
  this.locationBar.stop();
};

/**
  initially, the changeCallback won't be defined yet, but that's good
  because we dont' want to kick off routing right away, the router
  does that later by manually calling this handleURL method with the
  url it reads of the location. But it's important this is called
  first by Backbone, because we wanna set a correct this.path value

  @private
 */
BrowserLocation.prototype.handleURL = function (url) {
  this.path = url;
  if (this.changeCallback) {
    this.changeCallback(url);
  }
};
module.exports = exports['default'];
