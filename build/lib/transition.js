'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createTransition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dash = require('./dash');

var _path = require('./path');

var _path2 = _interopRequireDefault(_path);

function createTransition(options, Promise) {
  var id = options.id;
  var path = options.path;
  var match = options.match;
  var router = options.router;
  var log = router.log;
  var lastTransition = router.state.lastTransition;
  var routes = match.routes;
  var params = match.params;
  var query = match.query;

  var done = undefined;

  var deferred = (0, _dash.defer)();

  var transition = {
    descriptor: {
      id: id,
      routes: (0, _dash.clone)(routes),
      path: path,
      pathname: _path2['default'].withoutQuery(path),
      params: (0, _dash.clone)(params),
      query: (0, _dash.clone)(query),
      state: 'queued',
      prev: lastTransition && lastTransition.descriptor
    },

    // A promise to signal the completion of transition
    // this promise will resolve either when transition
    // completes with 'completed' or 'cancelled' state amd
    // in case of 'redirected' state will only complete
    // once redirect is fully resolved.
    // It will get rejected in case of transitioning completing
    // in 'failed' state.
    promise: deferred.promise,

    cancel: function cancel(reason) {
      if (transition.descriptor.state === 'queued') {
        return deferred.resolve();
      }
      if (transition.descriptor.state === 'transitioning') {
        if (reason === 'redirect') {
          return handleRedirect();
        } else {
          log('Transition #' + id, 'cancelled');
          return handleCancel();
        }
      }
    },

    redirect: function redirect(options) {
      log('Transition #' + id, 'redirecting to', options);
      router.transitionTo(options);
    },

    run: function run(doneCallback) {
      done = doneCallback;
      transition.startTime = new Date().getTime();
      transition.descriptor.state = 'transitioning';
      setTimeout(function () {
        log('---');
        log('Transition #' + id, 'to', path);
        log('Transition #' + id, 'routes', routes.map(function (r) {
          return r.name;
        }));
        log('Transition #' + id, 'params', params);
        log('Transition #' + id, 'query', query);
        runNext();
      }, 1);
    }
  };

  function afterNext(err) {
    if (err) return handleError(err);
    if (transition.descriptor.state !== 'transitioning') return;
    transition.descriptor.state = 'completed';
    setTimeout(runDone, 1);
  }

  function handleCancel() {
    if (transition.descriptor.state !== 'transitioning') return;
    transition.descriptor.state = 'cancelled';
    setTimeout(runDone, 1);
  }

  function handleRedirect() {
    if (transition.descriptor.state !== 'transitioning') return;
    transition.descriptor.state = 'redirected';
    setTimeout(runDone, 1);
  }

  function handleError(err) {
    if (transition.descriptor.state !== 'transitioning') return;
    transition.descriptor.state = 'failed';
    setTimeout(function () {
      return runError(err);
    }, 1);
  }

  function afterDone(err) {
    if (!err) transition.descriptor.state = 'completed';
    transition.duration = new Date().getTime() - transition.startTime;
    log('Transition #' + id, 'DONE -', transition.descriptor.state, '- (' + transition.duration + 'ms)');
    done(err, transition);
    if (transition.descriptor.state === 'failed') {
      deferred.reject(err);
    } else if (transition.descriptor.state === 'redirected') {
      router.state.currTransition.promise.then(deferred.resolve)['catch'](deferred.reject);
    } else {
      deferred.resolve();
    }
  }

  function runNext() {
    var middlewares = router.middleware;
    reduce(middlewares, function (context, middleware, i, list, cb) {
      if (transition.descriptor.state !== 'transitioning') return false;
      log('Transition #' + id, 'resolving middleware.next:', name(middleware, 'next'));
      transition.middlewareReached = i;
      if (!middleware.next) return cb(null, context);
      var next = cb;
      var redirect = transition.redirect;
      var cancel = transition.cancel;
      hook(middleware, 'next', next)(transition.descriptor, redirect, cancel);
    }, undefined, afterNext);
  }

  function runDone() {
    var middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse();
    reduce(middlewares, function (context, middleware, i, list, cb) {
      log('Transition #' + id, 'resolving middleware.done:', name(middleware, 'done'));
      if (!middleware.done) return cb();
      var next = cb;
      hook(middleware, 'done', next)(transition.descriptor);
    }, undefined, afterDone);
  }

  function runError(err) {
    var middlewares = router.middleware.slice(0, transition.middlewareReached + 1).reverse();
    reduce(middlewares, function (context, middleware, i, list, cb) {
      log('Transition #' + id, 'resolving middleware.error:', name(middleware, 'error'));
      if (!context) return cb(null);
      if (!middleware.error) return cb(null, context);
      var next = function next(err) {
        return cb(null, err);
      };
      hook(middleware, 'error', next)(context, transition.descriptor);
    }, err, function (internalErr, err) {
      return afterDone(internalErr || err);
    });
  }

  function reduce(list, fn, initial, cb) {
    if (list.length === 0) return cb(initial);

    callNext(initial, 0);

    function callNext(memo, i) {
      if (i === list.length) return cb(null, memo);
      var ret = fn(memo, list[i], i, list, function (err, nextMemo) {
        if (err) return cb(err);
        callNext(nextMemo, i + 1);
      });
      if (ret === false) cb(null, memo);
    }
  }

  function hook(middleware, hook, next) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      new Promise(function (resolve) {
        return resolve(middleware[hook].apply(middleware, args));
      }).then(function () {
        return next();
      })['catch'](next);
    };
  }

  function name(middleware, hook) {
    return (middleware.name || 'anonymous') + (middleware[hook] ? '' : ' (skipping)');
  }

  return transition;
}

module.exports = exports['default'];