// map(function(match) {
//    match("/index").to("index").withQueryParams('sort', 'filter');
//    match("/about").to("about");
//    match("/faq").to("faq");
//    match('/nested').to('nestedParent', function (match) {
//      match('/').to('nestedChild').withQueryParams('childParam');
//    }).withQueryParams('parentParam');
//    match("/posts", function(match) {
//      match("/:id").to("showPost").withQueryParams('foo', 'bar');
//      match("/admin/:id").to("admin", function(match) {
//        match("/posts").to("adminPosts");
//        match("/posts/:post_id").to("adminPost");
//      });
//      match("/").to("postIndex", function(match) {
//        match("/all").to("showAllPosts");

//        // TODO: Support canonical: true
//        match("/").to("showAllPosts");
//        match("/popular").to("showPopularPosts");
//        match("/filter/:filter_id").to("showFilteredPosts");
//      });
//    });
//  });
define(function (require) {

  var $ = require("jquery");
  var _ = require("underscore");
  var Promise = require("cherrytree/vendor/promise");
  var Router = require("cherrytree");
  var Route = require("cherrytree/route");

  var template = function (name) {
    return _.template("<div>" + $("script#" + name).html() + "</div>");
  };

  var BaseRoute = Route.extend({
    model: function (params) {
      var self = this;
      return new Promise(function (resolve) {
        self.timeout = setTimeout(function () {
          self.setContext(params);
          resolve();
        }, 300);
      });
    },
    abortModel: function () {
      window.clearTimeout(this.timeout);
    },
    deactivate: function () {
      window.clearTimeout(this.timeout);
      if (this.$view) {
        this.$view.remove();
      }
    },
    getTemplateName: function () {
      return this.templateName || this.name.replace(/\./g, "-");
    },
    view: function () {
      var tpl = template(this.getTemplateName())();
      var router = this.router;
      tpl = tpl.replace(/\{\{link\:(.*)\}\}/g, function (match, routeId) {
        console.log("generating", routeId, router.generate(routeId));
        return router.generate(routeId);
      });
      return $(tpl);
    },
    activate: function () {
      this.$view = this.view.apply(this, arguments);
      this.$outlet = this.$view.find(".outlet");
      this.outlet().html(this.$view);
    },
    outlet: function () {
      var parent = this.parent;
      while (parent) {
        if (parent.$outlet) {
          return parent.$outlet;
        } else {
          parent = parent.parent;
        }
      }
    }
  });

  var router = new Router({
    defaultRouteHandler: BaseRoute,
    logging: false
  });

  // provide the route map
  router.map(function () {
    this.route("about");
    this.route("faq");
    this.resource("posts", function () {
      this.route("popular");
      this.route("filter", { path: "/filter/:filterId", queryParams: ["sortBy"] });
      this.route("show", { path: "/:id" });
    });
  });

  // provide the routes
  // first of all, we want an application route
  router.handlers["application"] = BaseRoute.extend({
    // this is a cherrytree hook for "performing"
    // actions upon entering this route
    model: function () {},
    outlet: function () {
      return $(document.body);
    }
  });

  // then we'll create an application.index route that
  // will render out the welcome page
  router.handlers["index"] = BaseRoute.extend({
    templateName: "home"
  });

  // blog show
  router.handlers["posts.show"] = BaseRoute.extend({
    model: function (params) {
      if (!this.sessionStore) {
        this.sessionStore = 1;
      } else {
        this.sessionStore++;
      }
      this.setContext({
        title: "Blog " + params.id
      });
    },
    view: function (context) {
      return $(template("posts-show")({
        title: "Blog post #" + context.title
      }));
    }
  });

  // blog page
  router.handlers["posts.filter"] = BaseRoute.extend({
    model: function (params) {
      this.setContext(params);
    },
    activate: function (context) {
      this.render(context);
    },
    update: function (context) {
      this.render(context);
    },
    queryParamsDidChange: function (queryParams) {
      var context = this.getContext();
      context.queryParams = queryParams;
      this.setContext(context);
      this.render(context);
    },
    render: function (context) {
      if (context.filterId === "mine") {
        this.outlet().html("My posts...");
      } else {
        this.outlet().html("Filter not found");
      }
      if (context.queryParams.sortBy) {
        this.outlet().append("<div>Sorting by:" + context.queryParams.sortBy + "</div>");
      }
    }
  });

  // start routing
  router.startRouting();

  window.router = router;

});