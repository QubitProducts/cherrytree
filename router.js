define(function (require) {

  var _ = require("underscore");
  var Router = require("router");
  var RouterDSL = require("./dsl");
  var getHandlerFunction = require("./get_handler_function");

  var locations = {
    "none": require("./location/none_location")
  };

  var assert = function(desc, test) {
    if (!test) throw new Error("assertion failed: " + desc);
  };

  var CherryTreeRouter = function (options) {
    this.options = _.extend({}, this.options, options);
    this.stateClasses = {};
    this.prepares = {};

    if (this.options.BaseState) {
      this.BaseState = this.options.BaseState;
    }
  };
  CherryTreeRouter.prototype = {
    options: {
      location: "none",
      logging: false
    },

    map: function (callback) {
      var router = this.router = new Router();
      if (this.options.logging) {
        router.log = function (msg) {
          console.log(msg);
        };
      }

      var dsl = RouterDSL.map(this, function () {
        this.resource("application", { path: "/" }, function () {
          callback.call(this);
        });
      });

      router.map(dsl.generate());

      this.prepares = dsl.prepares;

      // return router;
      return this;
    },

    states: function (map) {
      _.each(map, function (state, name) {
        this.state(name, state);
      }, this);
    },

    state: function (name, state) {
      this.stateClasses[name] = state;
    },

    startRouting: function () {
      var self = this;
      var router = this.router;
      var location;

      // location can be a string id of one of the predefined locations
      // or a full implementation of the location can be passed in
      if (_.isString(this.options.location)) {
        assert("Specified location type does not exist", locations[this.options.location]);
        location = locations[this.options.location];
      } else {
        location = this.options.location;
      }
      this.location = location;

      setupRouter(this, router, location);

      location.onUpdateURL(function(url) {
        self.handleURL(url);
      });

      return this.handleURL(location.getURL());
    },

    didTransition: function (infos) {
      var path = routePath(infos);
      // announce we transitioned somehow?
    },

    handleURL: function(url) {
      scheduleLoadingStateEntry(this);

      var self = this;

      return this.router.handleURL(url).then(function() {
        transitionCompleted(self);
      }, function(err) {
        // we want to complete the transition
        // * we want to notify everyone that url changed
        // * we want to exit the loading state
        transitionFailed(err, self);
        return err;
      });
    },

    /**
      Transition to another route via the `routeTo` event which
      will by default be handled by ApplicationRoute.

      @method routeTo
      @param {TransitionEvent} transitionEvent
     */
    routeTo: function(transitionEvent) {
      var handlerInfos = this.router.currentHandlerInfos;
      if (handlerInfos) {
        transitionEvent.sourceRoute = handlerInfos[handlerInfos.length - 1].handler;
      }

      this.send('routeTo', transitionEvent);
    },

    transitionTo: function() {
      var args = [].slice.call(arguments);
      return doTransition(this, 'transitionTo', args);
    },

    replaceWith: function() {
      var args = [].slice.call(arguments);
      return doTransition(this, 'replaceWith', args);
    },

    generate: function() {
      var url = this.router.generate.apply(this.router, arguments);
      return this.location.formatURL(url);
    },

    isActive: function(routeName) {
      var router = this.router;
      return router.isActive.apply(router, arguments);
    },

    send: function(name, context) {
      this.router.trigger.apply(this.router, arguments);
    },

    hasRoute: function(route) {
      return this.router.hasRoute(route);
    },

    /**
      @private

      Resets the state of the router by clearing the current route
      handlers and deactivating them.

      @method reset
     */
    reset: function() {
      this.router.reset();
    },

    _lookupActiveView: function(templateName) {
      var active = this._activeViews[templateName];
      return active && active[0];
    },

    _connectActiveView: function(templateName, view) {
      var existing = this._activeViews[templateName];

      if (existing) {
        existing[0].off('willDestroyElement', this, existing[1]);
      }

      var disconnect = function() {
        delete this._activeViews[templateName];
      };

      this._activeViews[templateName] = [view, disconnect];
      view.one('willDestroyElement', this, disconnect);
    },

    destroy: function () {
      if (this.location.destroy) {
        this.location.destroy();
      }
    }
  };

  function routePath(handlerInfos) {
    var path = [];

    for (var i=1, l=handlerInfos.length; i<l; i++) {
      var name = handlerInfos[i].name,
          nameParts = name.split(".");

      path.push(nameParts[nameParts.length - 1]);
    }

    return path.join(".");
  }

  function setupRouter(cherrytree, router, location) {
    var lastURL;

    router.getHandler = getHandlerFunction(cherrytree);

    var doUpdateURL = function() {
      location.setURL(lastURL);
    };

    router.updateURL = function(path) {
      lastURL = path;
      // Ember.run.once(doUpdateURL);
      doUpdateURL();
    };

    if (location.replaceURL) {
      var doReplaceURL = function() {
        location.replaceURL(lastURL);
      };

      router.replaceURL = function(path) {
        lastURL = path;
        // Ember.run.once(doReplaceURL);
        doReplaceURL();
      };
    }

    if (location.onChangeURL && cherrytree.urlChanged) {
      location.onChangeURL(function (url) {
        cherrytree.urlChanged(url);
      });
    }

    router.didTransition = function(infos) {
      cherrytree.didTransition(infos);
    };
  }

  function doTransition(router, method, args) {
    // Normalize blank route to root URL.
    args = [].slice.call(args);
    args[0] = args[0] || '/';

    var passedName = args[0], name;

    if (passedName.charAt(0) === '/') {
      name = passedName;
    } else {
      if (!router.router.hasRoute(passedName)) {
        name = args[0] = passedName + '.index';
      } else {
        name = passedName;
      }

      assert("The route " + passedName + " was not found", router.router.hasRoute(name));
    }

    scheduleLoadingStateEntry(router);

    var transitionPromise = router.router[method].apply(router.router, args);
    transitionPromise.then(function() {
      transitionCompleted(router);
    }, function(err) {
      // we want to complete the transition
      // * we want to notify everyone that url changed
      // * we want to exit the loading state
      transitionFailed(err, router);
      return err;
    });

    // TODO: figure out why I had to generate the URL here instead of just
    // using the transitions...
    // var url = router.generate.apply(router, args);
    // // router.handle
    // var transitionPromise = router.router.handleURL(url).then(function () {
    //   if (method === 'replaceWith') {
    //     router.router.replaceURL(url);
    //   } else {
    //     // Assume everything else is just a URL update for now.
    //     router.router.updateURL(url);
    //   }
    //   transitionCompleted(router);
    // });

    // We want to return the configurable promise object
    // so that callers of this function can use `.method()` on it,
    // which obviously doesn't exist for normal RSVP promises.
    return transitionPromise;
  }

  return CherryTreeRouter;

  function scheduleLoadingStateEntry(router) {
    if (router._loadingStateActive) { return; }
    router._shouldEnterLoadingState = true;
    // Ember.run.scheduleOnce('routerTransitions', null, enterLoadingState, router);
    _.defer(function () {
      enterLoadingState(router);
    });
  }

  function enterLoadingState(router) {
    if (router._loadingStateActive || !router._shouldEnterLoadingState) { return; }

    var loadingRoute = router.router.getHandler('loading');
    if (loadingRoute) {
      if (loadingRoute.model) { loadingRoute.model(); }
      if (loadingRoute.enter) { loadingRoute.enter(); }
      if (loadingRoute.setup) { loadingRoute.setup(); }
      router._loadingStateActive = true;
    }
  }

  function exitLoadingState(router) {
    router._shouldEnterLoadingState = false;
    if (!router._loadingStateActive) { return; }

    var loadingRoute = router.router.getHandler('loading');
    if (loadingRoute && loadingRoute.exit) { loadingRoute.exit(); }
    router._loadingStateActive = false;
  }

  function transitionCompleted(router) {
    // router.notifyPropertyChange('url');
    exitLoadingState(router);
    if (router.urlChanged) {
      router.urlChanged(router.location.getURL());
    }
  }

  function transitionFailed(err, router) {
    transitionCompleted(router);
    if (err.name !== "TransitionAborted") {
      console.error(err.stack ? err.stack : err);
    }
  }

});