(function (define) { 'use strict';
  define(function (require) {

    // getHandler function, given a route name returns a handler object
    // this handler object takes care of instantiating the corresponding
    // route and mediating between router and the route, i.e. all calls
    // from router onto the handler are passed on to the route

    var _ = require("underscore");
    var RSVP = require("rsvp");
    var makeRouteCreator = require("./route_creator");

    var debug = false;

    function proxy(method) {
      return function () {
        if (debug) {
          console.log("cherrytree:", this.route.name + "#" + method);
        }
        return this.route[method].apply(this.route, arguments);
      };
    }

    function makeHandler(router, routeCreator, name) {
      return {
        serialize: function () {
          return this.params;
        },
        beforeModel: function (queryParams, transition) {
          if (!transition) {
            transition = queryParams;
            queryParams = undefined;
          }

          var self = this;
          var handler = this;
          return RSVP.resolve(self.route || routeCreator.createRoute(name)).then(function (route) {
            self.route = route;

            // enable access to route's context from within the route
            if (!route.getContext) {
              route.getContext = function () {
                return handler.context;
              };
            }
            
            if (name !== "application" && name !== "loading") {
              var parentHandler = transition.handlerInfos[0];
              for (var i = 1, len = transition.handlerInfos.length; i < len; i++) {
                if (transition.handlerInfos[i].name === name) {
                  break;
                }
                parentHandler = transition.handlerInfos[i];
              }
              self.route.setParent(parentHandler.handler.route);
            }
            if (debug) {
              console.log("cherrytree:", self.route.name + "#" + "beforeModel");
            }
            return self.route.beforeModel.apply(self.route, arguments);
          });
        },
        model: function (params, queryParams, transition) {
          if (transition === undefined) {
            transition = queryParams;
            queryParams = false;
          }
          // normalize params
          if (_.isEmpty(params)) {
            params = false;
          }
          if (_.isEmpty(queryParams)) {
            queryParams = false;
          }

          this.params = _.clone(params);

          this.route.options = this.route.options || {};
          _.extend(this.route.options, params);
          this.route.options.queryParams = queryParams || {};

          // // if params didn't change - we keep this state
          // console.log("PARAMS ARE", name, params);
          // if (_.isEqual(this.lastParams, params) && _.isEqual(this.lastQueryParams, queryParams)) {
          //   console.log("REUSING CONTEXT", this.route.name, this.prevContext);
          //   return this.prevContext;
          // }

          // // keep a record of the new params
          // this.lastParams = _.clone(params);
          // this.lastQueryParams = _.clone(queryParams);

          // // if the params changed - call an optional update
          // // method on the state - return value false,
          // // prevents the desctruction of the state and proceeds
          // // with the transition. Otherwise we will destroy this
          // // state and recreate it
          // if ((params || queryParams) && this.route.update) {
          //   this.route._lastUpdateHandled = this.route.update(params, queryParams) === false;
          //   if (this.route._lastUpdateHandled) {
          //     console.log("REUSING CONTEXT AFTER #UPDATE", this.route.name, this.prevContext);
          //     return this.prevContext;
          //   }
          // }
          



          var method = "model";
          if (debug) {
            console.log("cherrytree:", this.route.name + "#" + method);
          }
          var c = this.route[method].apply(this.route, arguments);

          return RSVP.resolve(c).then(function (context) {
            // ensure we don't return a falsy value here, since that will
            // change the behaviour of the router.js that will think
            // this handler doesn't have context, but maybe we just
            // didn't want to return anything in the model function
            return context || {};
          });
        },
        afterModel: proxy("afterModel"),
        enter: proxy("enter"),
        setup: proxy("setup"),
        exit: proxy("exit"),
        events: {
          willTransition: function (transition) {
            if (this.route.willTransition) {
              return this.route.willTransition(transition);
            } else {
              return true;
            }
          },
          error: function (err, transition) {
            if (this.route.error) {
              return this.route.error(err, transition);
            } else {
              return true;
            }
          }
        }
      };
    }

    return function getHandler(router) {
      var seen = {};
      var routeClasses = router.routeClasses;
      var routeCreator = makeRouteCreator(router);

      if (!routeClasses["loading"]) {
        seen.loading = {};
      } else {
        seen.loading = makeHandler(router, routeCreator, "loading");
        seen.loading.beforeModel();
      }

      return function (name) {
        if (!seen[name]) {
          seen[name] = makeHandler(router, routeCreator, name);
        }
        return seen[name];
      };
    };
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });