'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = transition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dash = require('./dash');

var _invariant = require('./invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _path = require('./path');

var _path2 = _interopRequireDefault(_path);

function transition(options, Promise) {
  options = options || {};

  var router = options.router;
  var log = router.log;
  var logError = router.logError;

  var path = options.path;
  var match = options.match;
  var routes = match.routes;
  var params = match.params;
  var query = match.query;

  var id = options.id;
  var startTime = Date.now();
  log('---');
  log('Transition #' + id, 'to', path);
  log('Transition #' + id, 'routes:', routes.map(function (r) {
    return r.name;
  }));
  log('Transition #' + id, 'params:', params);
  log('Transition #' + id, 'query:', query);

  // create the transition promise
  var resolve = undefined,
      reject = undefined;
  var promise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });

  // 1. make transition errors loud
  // 2. by adding this handler we make sure
  //    we don't trigger the default 'Potentially
  //    unhandled rejection' for cancellations
  promise.then(function () {
    log('Transition #' + id, 'completed in', Date.now() - startTime + 'ms');
  })['catch'](function (err) {
    if (err.type !== 'TransitionRedirected' && err.type !== 'TransitionCancelled') {
      log('Transition #' + id, 'FAILED');
      logError(err.stack);
    }
  });

  var cancelled = false;

  var transition = {
    id: id,
    prev: {
      routes: (0, _dash.clone)(router.state.routes) || [],
      path: router.state.path || '',
      pathname: router.state.pathname || '',
      params: (0, _dash.clone)(router.state.params) || {},
      query: (0, _dash.clone)(router.state.query) || {}
    },
    routes: (0, _dash.clone)(routes),
    path: path,
    pathname: _path2['default'].withoutQuery(path),
    params: (0, _dash.clone)(params),
    query: (0, _dash.clone)(query),
    redirectTo: function redirectTo() {
      return router.transitionTo.apply(router, arguments);
    },
    retry: function retry() {
      return router.transitionTo(path);
    },
    cancel: function cancel(err) {
      if (router.state.activeTransition !== transition) {
        return;
      }

      if (transition.isCancelled) {
        return;
      }

      router.state.activeTransition = null;
      transition.isCancelled = true;
      cancelled = true;

      if (!err) {
        err = new Error('TransitionCancelled');
        err.type = 'TransitionCancelled';
      }
      if (err.type === 'TransitionCancelled') {
        log('Transition #' + id, 'cancelled');
      }
      if (err.type === 'TransitionRedirected') {
        log('Transition #' + id, 'redirected');
      }

      reject(err);
    },
    followRedirects: function followRedirects() {
      return promise['catch'](function (reason) {
        if (router.state.activeTransition) {
          return router.state.activeTransition.followRedirects();
        }
        return Promise.reject(reason);
      });
    },

    then: promise.then.bind(promise),
    'catch': promise['catch'].bind(promise)
  };

  // here we handle calls to all of the middlewares
  function callNext(i, prevResult) {
    var middlewareName = undefined;
    // if transition has been cancelled - nothing left to do
    if (cancelled) {
      return;
    }
    // done
    if (i < router.middleware.length) {
      middlewareName = router.middleware[i].name || 'anonymous';
      log('Transition #' + id, 'resolving middleware:', middlewareName);
      var middlewarePromise = undefined;
      try {
        middlewarePromise = router.middleware[i](transition, prevResult);
        (0, _invariant2['default'])(transition !== middlewarePromise, 'Middleware %s returned a transition which resulted in a deadlock', middlewareName);
      } catch (err) {
        router.state.activeTransition = null;
        return reject(err);
      }
      Promise.resolve(middlewarePromise).then(function (result) {
        callNext(i + 1, result);
      })['catch'](function (err) {
        log('Transition #' + id, 'resolving middleware:', middlewareName, 'FAILED');
        router.state.activeTransition = null;
        reject(err);
      });
    } else {
      router.state = {
        activeTransition: null,
        routes: routes,
        path: path,
        pathname: _path2['default'].withoutQuery(path),
        params: params,
        query: query
      };
      resolve();
    }
  }

  if (!options.noop) {
    Promise.resolve().then(function () {
      return callNext(0);
    });
  } else {
    resolve();
  }

  if (options.noop) {
    transition.noop = true;
  }

  return transition;
}

module.exports = exports['default'];