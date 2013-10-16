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
  var Router = require("cherrytree");
  var State = require("cherrytree/state");
  var HistoryLocation = require("cherrytree/location/history_location");

  var template = function (name) {
    return _.template("<div>" + $("script#" + name).html() + "</div>");
  };

  var BaseState = State.extend({
    getTemplateName: function () {
      return this.templateName || this.name.replace(/\./g, "-");
    },
    view: function () {
      return $(template(this.getTemplateName())());
    },
    activate: function () {
      this.$view = this.view();
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
    logging: true,
    BaseState: BaseState
  });

  // provide the route map
  router.map(function () {
    this.route("about");
    this.route("faq");
    this.resource("posts", function () {
      this.route("popular");
      this.route("filter", { path: "/filter/:filterId" });
      this.route("show", { path: "/:id" });
    });
  });

  // provide the states
  // first of all, we want an application state
  router.state("application", BaseState.extend({
    // this is a cherrytree hook for "performing"
    // actions upon entering this state
    outlet: function () {
      return $(document.body);
    }
  }));

  // then we'll create an application.index state that
  // will render out the welcome page
  router.state("index", BaseState.extend({
    templateName: "home"
  }));

  // blog show
  router.state("posts.show", BaseState.extend({
    view: function () {
      return $(template("posts-show")({
        title: "Blog post #" + this.options.id
      }));
    }
  }));

  // blog page
  router.state("posts.filter", BaseState.extend({
    activate: function () {
      if (this.options.filterId === "mine") {
        this.parent.parent.$outlet.html("My posts...");
      } else {
        this.parent.parent.$outlet.html("Filter not found");
      }
    }
  }));

  // start routing
  router.startRouting();

});