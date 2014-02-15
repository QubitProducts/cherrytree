define(function (require) {

  // getHandler function, given a route name returns a handler object
  // this handler object takes care of instantiating the corresponding
  // route and mediating between router and the route, i.e. all calls
  // from router onto the handler are passed on to the route

  var makeRouteCreator = require("./route_creator");
  var RSVP = require("rsvp");

  function proxy(method) {
    return function () {
      console.log("proxying", this.route.name + "#" + method);
      return this.route[method].apply(this.route, arguments);
    };
  }

  function makeHandler(router, routeCreator, name) {
    return {
      beforeModel: function (queryParams, transition) {
        if (!transition) {
          transition = queryParams;
          queryParams = undefined;
        }

        var self = this;
        return RSVP.resolve(self.route || routeCreator.createRoute(name)).then(function (route) {
          self.route = route;
          
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
          // } else if (transition.data.parent) {
          // }
          // transition.data.parent = self.route;
          console.log("proxying", self.route.name + "#" + "beforeModel");
          return self.route.beforeModel.apply(self.route, arguments);
        });
      },
      model: proxy("model"),
      afterModel: proxy("afterModel"),
      enter: proxy("enter"),
      setup: proxy("setup"),
      exit: proxy("exit")
    };
  }

  return function getHandler(router) {
    var seen = {};
    var routeClasses = router.routeClasses;
    var routeCreator = makeRouteCreator(router);

    if (!routeClasses["loading"]) {
      seen.loading = {};
    }

    return function (name) {
      if (!seen[name]) {
        seen[name] = makeHandler(router, routeCreator, name);
      }
      return seen[name];
    };
  };
});