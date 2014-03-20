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
  var Promise = require("rsvp").Promise;
  var Router = require("cherrytree");
  var Route = require("cherrytree/route");
  var HistoryLocation = require("cherrytree/location/history_location");

  var template = function (name) {
    return _.template("<div>" + $("script#" + name).html() + "</div>");
  };

  var BaseRoute = Route.extend({
    model: function (params) {
      this.params = params;
      var self = this;
      return new Promise(function (resolve) {
        self.timeout = setTimeout(function () {
          resolve(params);
        }, 300);
      });
    },
    abortModel: function () {
      window.clearTimeout(this.timeout);
    },
    destroy: function () {
      window.clearTimeout(this.timeout);
      if (this.$view) {
        this.$view.remove();
      }
    },
    getTemplateName: function () {
      return this.templateName || this.name.replace(/\./g, "-");
    },
    view: function () {
      return $(template(this.getTemplateName())());
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
    location: new HistoryLocation({
      pushState: false
    }),
    logging: false,
    BaseRoute: BaseRoute
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
  router.addRoute("application", BaseRoute.extend({
    // this is a cherrytree hook for "performing"
    // actions upon entering this route
    model: function () {
      return 1;
    },
    outlet: function () {
      return $(document.body);
    }
  }));

  // then we'll create an application.index route that
  // will render out the welcome page
  router.addRoute("index", BaseRoute.extend({
    templateName: "home"
  }));

  // blog show
  router.addRoute("posts.show", BaseRoute.extend({
    model: function (params) {
      if (!this.sessionStore) {
        this.sessionStore = 1;
      } else {
        this.sessionStore++;
      }
      return "Blog " + params.id;
    },
    view: function (model) {
      return $(template("posts-show")({
        title: "Blog post #" + model
      }));
    }
  }));

  // blog page
  router.addRoute("posts.filter", BaseRoute.extend({
    activate: function (params, queryParams) {
      this.queryParams = queryParams;
      this.render();
    },
    update: function (params, queryParams) {
      this.queryParams = queryParams;
      this.render();
      // don't reload the state
      return false;
    },
    render: function () {
      if (this.params.filterId === "mine") {
        this.outlet().html("My posts...");
      } else {
        this.outlet().html("Filter not found");
      }
      if (this.queryParams.sortBy) {
        this.outlet().append("<div>Sorting by:" + this.queryParams.sortBy + "</div>");
      }
    }
  }));

  // start routing
  router.startRouting();

  window.router = router;

});