(function (define) { 'use strict';
  define(function (require) {

    /**
     * getHandler function, given a route name returns a handler object
     * this handler object takes care of instantiating the corresponding
     * route and mediating between router and the route, i.e. all calls
     * from router into the handler are proxied to the route
     */

    var _ = require("./util");
    var Promise = require("../vendor/promise");
    var makeRouteCreator = require("./route_creator");

    // TODO expose this debugging as a flag at the top level router options
    // TODO consider using AOP for debugging statements
    var debug = false;
    var log = function () {
      if (debug) {
        console.log.apply(console, arguments);
      }
    };

    /**
     * a helper for wrapping handler methods
     * to proxy to the route
     */
    function proxy(method) {
      return function () {
        log("cherrytree:", this.route.name + "#" + method);
        return this.route[method].apply(this.route, arguments);
      };
    }

    /**
     * a helper for wrapping handler events
     * to proxy to the route methods.
     * This is slightly different from the method proxying
     * in that the event handlers are optional, and if they're not
     * available on the route, we won't call them and instead
     * return true to propagate the event further up the handler chain.
     * Notice that at the moment, the handler events are
     * declared in the handler.events hash (e.g. handler.events.error),
     * but the route is expected to have them on the route itself,
     * e.g. (route.error).
     */
    function proxyEvent(event) {
      return function () {
        if (this.route && this.route[event]) {
          log("cherrytree:", this.route.name + "#" + event);
          return this.route[event].apply(this.route, arguments);
        } else {
          return true;
        }
      };
    }

    function createHandler(router, createRoute, name) {
      return {
        /**
         * We don't serialize route's context the way router.js
         * expects us to - we simply keep track of what params
         * have been used when entering this route and use those
         * every time router.js asks us to serialize this route.
         * @return {[type]} [description]
         */
        serialize: function () {
          return this.params;
        },

        /**
         * beforeModel is used for the very initial instantiation
         * of the route for this handler. That might involve
         * loading some extra code in (which happens in the createRoute).
         * After the route is loaded and instantiated, we call beforeModel
         * on the route to make it seem transparent. If this is not the first
         * time we call beforeModel on this route, we'll use the existing
         * route and just call beforeModel on that.
         */
        beforeModel: function (transition) {
          var handler = this;
          return Promise.resolve(handler.route || createRoute(name)).then(function (route) {
            // store the route instance on the handler, for the rest of
            // the lifetime of the application
            handler.route = route;

            // mark this route as not needing a reactivation
            route.needsReactivation = false;

            route.refresh = function () {
              router.router.refresh(handler);
            };
            
            // inspect the transition to find the parent route
            // and connect it to this route. Do this on each transition.
            if (name !== "application" && name !== "loading") {
              var parentHandler = transition.state.handlerInfos[0];
              for (var i = 1, len = transition.state.handlerInfos.length; i < len; i++) {
                if (transition.state.handlerInfos[i].name === name) {
                  break;
                }
                parentHandler = transition.state.handlerInfos[i];
              }
              handler.route.setParent(parentHandler.handler.route);
            }

            log("cherrytree:", handler.route.name + "#" + "beforeModel");
            return handler.route.beforeModel.apply(handler.route, arguments);
          });
        },

        /**
         * Here we do some bookkeeping of the params and queryParams,
         * proxy to route.model and make the return value of the model
         * accessible via route.getContext()
         */
        model: function (params) {
          params = params || {};

          // store these here for the handler.serialize
          this.params = JSON.parse(JSON.stringify(params || {}));

          // the fact that we're calling model on this route means
          // we'll need to reactive it. This is flagged here
          // so that we know later if we need to call update hook
          // on the route or skip it. If the parent state didn't need
          // reactivation - we can call update, but if the parent
          // reactivated we skip the update call.
          // TODO clarify this or find a better solution
          this.route.needsReactivation = true;

          log("cherrytree:", this.route.name + "#" + "model");
          var c = this.route.model.apply(this.route, arguments);

          var route = this.route;
          return Promise.resolve(c).then(function (context) {
            // ensure context is not a falsy value here, otherwise
            // router.js which thinks this handler doesn't have context,
            // and behaves differently compared to when it has one (TODO clarify)
            // But cherrytree allows not returning any context.
            context = context || {};
            
            // enable access to route's context from within the route
            // this is then used by routes to traverse their parent
            // contexts to get parent's data, etc.
            route.getContext = function () {
              return context;
            };
            
            return context;
          });
        },

        /**
         * proxy several other methods transparently, we don't
         * need to adapt/change the behaviour of these.
         */
        afterModel: proxy("afterModel"),
        enter: proxy("enter"),
        setup: proxy("setup"),
        exit: proxy("exit"),
        
        /**
         * proxy the 2 default events as well
         * TODO 2014-03-20: figure out how to proxy all events generically
         */
        events: {
          willTransition: proxyEvent("willTransition"),
          error: proxyEvent("error"),
          queryParamsDidChange: proxyEvent("queryParamsDidChange"),
          finalizeQueryParamChange: function (params, finalParams, transition) {
            _.each(params, function (val, key) {
              finalParams.push({
                value: val,
                visible: !!val,
                key: key
              });
            });
            return true;
          }
        },

        refresh: function () {
          router.router.refresh(this);
        }
      };
    }

    /**
     * The exported function.
     * 
     * This creates a handler factory function.
     * 
     * @param  {Object} router
     * @return {Fn}     a function that given a route name gives the handler instance
     */
    return function getHandler(router) {
      var seen = {};
      var createRoute = makeRouteCreator(router);

      // special case "loading" route
      if (!router.routes["loading"]) {
        seen.loading = {};
      } else {
        seen.loading = createHandler(router, createRoute, "loading");
        // TODO - why do we need to call beforeModel here?
        seen.loading.beforeModel();
      }

      return function (name) {
        if (!seen[name]) {
          seen[name] = createHandler(router, createRoute, name);
        }
        return seen[name];
      };
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });