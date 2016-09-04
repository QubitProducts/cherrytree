'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _dash = require('../dash');

exports['default'] = MemoryLocation;

var MemoryLocation = (function () {
  function MemoryLocation() {
    _classCallCheck(this, MemoryLocation);

    this.path = '';
  }

  _createClass(MemoryLocation, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'url',
    value: function url() {
      return this.path;
    }
  }, {
    key: 'push',
    value: function push(path, options) {
      if (this.path !== path) {
        this.path = path;
        this.handleURL(this.url(), options);
      }
    }
  }, {
    key: 'replace',
    value: function replace(path, options) {
      if (this.path !== path) {
        this.setURL(path, options);
      }
    }
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      this.changeCallback = callback;
    }
  }, {
    key: 'handleURL',
    value: function handleURL(url, options) {
      this.path = url;
      options = (0, _dash.extend)({ trigger: true }, options);
      if (this.changeCallback && options.trigger) {
        this.changeCallback(url);
      }
    }
  }, {
    key: 'usesPushState',
    value: function usesPushState() {
      return false;
    }
  }, {
    key: 'removeRoot',
    value: function removeRoot(url) {
      return url;
    }
  }, {
    key: 'format',
    value: function format(url) {
      return url;
    }
  }]);

  return MemoryLocation;
})();

module.exports = exports['default'];