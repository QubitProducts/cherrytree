'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _dash = require('../dash');

var _locationBar = require('location-bar');

var _locationBar2 = _interopRequireDefault(_locationBar);

var BrowserLocation = (function () {
  function BrowserLocation(options) {
    _classCallCheck(this, BrowserLocation);

    this.options = (0, _dash.extend)({
      pushState: false,
      root: '/'
    }, options);

    this.path = '';

    // we're using the location-bar module for actual
    // URL management
    var self = this;
    this.locationBar = new _locationBar2['default']();
    this.locationBar.onChange(function (path) {
      self.handleURL('/' + (path || ''));
    });
  }

  _createClass(BrowserLocation, [{
    key: 'start',
    value: function start() {
      this.locationBar.start((0, _dash.extend)({}, this.options));
    }

    /**
     * Stop listening to URL changes and link clicks
     */
  }, {
    key: 'stop',
    value: function stop() {
      this.locationBar.stop();
    }

    /**
     * Check if we're actually using pushState. For browsers
     * that don't support it this would return false since
     * it would fallback to using hashState / polling
     * @return {Bool}
     */

  }, {
    key: 'usesPushState',
    value: function usesPushState() {
      return this.options.pushState && window.history && window.history.pushState;
    }

    /**
     * Get the current URL
     */

  }, {
    key: 'url',
    value: function url() {
      return this.path;
    }

    /**
     * Set the current URL without triggering any events
     * back to the router. Add a new entry in browser's history.
     */

  }, {
    key: 'push',
    value: function push(path, options) {
      if (this.path !== path) {
        this.path = path;
        this.locationBar.update(path, (0, _dash.extend)({ trigger: true }, options));
      }
    }

    /**
     * Set the current URL without triggering any events
     * back to the router. Replace the latest entry in broser's history.
     */

  }, {
    key: 'replace',
    value: function replace(path, options) {
      if (this.path !== path) {
        this.path = path;
        this.locationBar.update(path, (0, _dash.extend)({ trigger: true, replace: true }, options));
      }
    }

    /**
     * Setup a URL change handler
     * @param  {Function} callback
     */
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      this.changeCallback = callback;
    }

    /**
     * Given a path, generate a URL appending root
     * if pushState is used and # if hash state is used
     */
  }, {
    key: 'format',
    value: function format(path) {
      if (/^[A-Za-z]+:\/\//.test(path)) return path;
      if (this.usesPushState()) {
        var rootURL = this.options.root;
        if (path !== '') {
          rootURL = rootURL.replace(/\/$/, '');
        }
        return rootURL + path;
      } else {
        if (path[0] === '/') {
          path = path.substr(1);
        }
        return '#' + path;
      }
    }

    /**
     * When we use pushState with a custom root option,
     * we need to take care of removingRoot at certain points.
     * Specifically
     * - browserLocation.update() can be called with the full URL by router
     * - LocationBar expects all .update() calls to be called without root
     * - this method is public so that we could dispatch URLs without root in router
     */
  }, {
    key: 'removeRoot',
    value: function removeRoot(url) {
      if (this.options.pushState && this.options.root && this.options.root !== '/') {
        return url.replace(this.options.root, '');
      } else {
        return url.replace(/^#/, '/');
      }
    }

    /**
      initially, the changeCallback won't be defined yet, but that's good
      because we dont' want to kick off routing right away, the router
      does that later by manually calling this handleURL method with the
      url it reads of the location. But it's important this is called
      first by Backbone, because we wanna set a correct this.path value
       @private
     */
  }, {
    key: 'handleURL',
    value: function handleURL(url) {
      this.path = url;
      if (this.changeCallback) {
        this.changeCallback(url);
      }
    }
  }]);

  return BrowserLocation;
})();

exports['default'] = BrowserLocation;
module.exports = exports['default'];