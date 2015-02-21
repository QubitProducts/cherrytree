define(function (require) {

  var _ = require("lodash");
  var Promise = require("cherrytree/vendor/promise");
  var cherrytree = require("cherrytree");
  var handlers = require("./handlers");

  var router = window.router = cherrytree();

  router.map(function () {
    this.route("application", {path: "/"}, function () {
      this.route("index", {path: "/"});
      this.route("about");
      this.route("faq");
      this.route("posts", function () {
        this.route("posts.index");
        this.route("posts.popular");
        this.route("posts.filter", { path: "filter/:filterId" });
        this.route("posts.show", { path: ":id" });
      });
    });
  });
  
  // logging
  router.use(function (transition) {
    console.log("Transition to", transition.path);
    transition.then(function () {
      console.log("Transition successful.");
    }).catch(function (err) {
      if (err.type === "TransitionRedirect") {
        console.log("Redirecting");
        return;
      }
      if (err.type === "TransitionAbort") {
        console.log("Aborted");
        return;
      }
      console.log("Transition failed");
      throw err;
    });
  });
  
  // deactive up old routes
  // they also get a chance to abort the transition (TODO)
  router.use(function (transition) {
    var currentRoutes = router.state.routes || [];
    currentRoutes.forEach(function (route) {
      var handler = handlers[route.name];
      handler && handler.deactivate();
    });
  });

  // load and attach route handlers
  // this can load handlers dynamically (TODO)
  router.use(function (transition) {
    var i = 0;
    transition.nextRoutes.forEach(function (route) {
      var handler = handlers[route.name] || _.clone(handlers.base);
      handlers[route.name] = handler;
      handler.name = route.name;
      handler.router = router;
      var parentRoute = transition.nextRoutes[i - 1];
      if (parentRoute) {
        handler.parent = handlers[parentRoute.name];
      }
      route.handler = handler;
      i++;
    });
  });

  // model hook
  // with the loading hook(TODO)
  router.use(function (transition) {
    var prevContext = Promise.resolve();
    return Promise.all(transition.nextRoutes.map(function (route) {
      prevContext = Promise.resolve(route.handler.model(transition.params, prevContext, transition));
      return prevContext;
    }));
  });

  // activate hook
  // which only reactives routes starting at the match point (TODO)
  router.use(function (transition, contexts) {
    var i = 0;
    transition.nextRoutes.forEach(function (route) {
      var handler = route.handler.activate(contexts[i++]);
    });
  });

  // kick things off
  router.listen();

});