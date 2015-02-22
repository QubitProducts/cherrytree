var _ = require("lodash");
var Promise = require("when").Promise;
var cherrytree = require("../../../");
var getHandler = require("./handler");

require("./styles/app.css");

// create the router
var router = window.router = cherrytree();

// define the route map
router.map(function () {
  this.route("application", {path: "/"}, function () {
    this.route("home", {path: "/"});
    this.route("about");
    this.route("faq");
    this.route("posts", function () {
      this.route("posts.index");
      this.route("posts.popular");
      this.route("posts.search", { path: "search/:query" });
      this.route("posts.show", { path: ":id" });
    });
  });
});

// implement a set of middleware

// simple logging
router.use(function log(transition) {
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

// load and attach route handlers
// this can load handlers dynamically (TODO)
router.use(function loadHandlers(transition) {
  var i = 0;
  transition.nextRoutes.forEach(function (route) {
    var handler = getHandler(route.name);
    handler.name = route.name;
    handler.router = router;
    var parentRoute = transition.nextRoutes[i - 1];
    if (parentRoute) {
      handler.parent = parentRoute.handler;
    }
    route.handler = handler;
    i++;
  });
});

// willTransition hook
router.use(function deactivateHook(transition) {
  var prevRoutes = transition.prevRoutes;
  prevRoutes.forEach(function (route) {
    route.handler.willTransition && route.handler.willTransition(transition);
  });
});

// deactive up old routes
// they also get a chance to abort the transition (TODO)
router.use(function deactivateHook(transition) {
  var prevRoutes = transition.prevRoutes;
  prevRoutes.forEach(function (route) {
    route.handler.deactivate();
  });
});

// model hook
// with the loading hook (TODO)
router.use(function modelHook(transition) {
  var prevContext = Promise.resolve();
  return Promise.all(transition.nextRoutes.map(function (route) {
    prevContext = Promise.resolve(route.handler.model(transition.params, prevContext, transition));
    return prevContext;
  }));
});

// activate hook
// which only reactives routes starting at the match point (TODO)
router.use(function activateHook(transition, contexts) {
  var i = 0;
  transition.nextRoutes.forEach(function (route) {
    var handler = route.handler.activate(contexts[i++]);
  });
});

// start the routing
router.listen();
