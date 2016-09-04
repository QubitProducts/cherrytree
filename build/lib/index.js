'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _route = require('./route');

var _route2 = _interopRequireDefault(_route);

var _locationsBrowser = require('./locations/browser');

var _locationsBrowser2 = _interopRequireDefault(_locationsBrowser);

var _locationsMemory = require('./locations/memory');

var _locationsMemory2 = _interopRequireDefault(_locationsMemory);

var createRouter = function createRouter(options) {
  return new _router2['default'](options);
};

// old school exports
createRouter.route = _route2['default'];
createRouter.BrowserLocation = _locationsBrowser2['default'];
createRouter.MemoryLocation = _locationsMemory2['default'];

// es2015 exports
exports['default'] = createRouter;
exports.BrowserLocation = _locationsBrowser2['default'];
exports.MemoryLocation = _locationsMemory2['default'];
exports.route = _route2['default'];