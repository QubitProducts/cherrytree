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
  var Router = require("cherrytree");
  var State = require("cherrytree/route");

  function TestApp() {
    // create the router
    var router = this.router = new Router();

    // provide the route map
    router.map(function () {
      this.route("about");
      this.route("faq", { queryParams: ["sortBy"]});
      this.resource("posts", function () {
        this.route("popular");
        this.route("filter", { path: "/filter/:filterId", queryParams: ["sortBy"] });
        this.route("show", { path: "/:id" });
      });
    });

    // provide the states
    // first of all, we want an application state
    router.handlers["application"] = State.extend({
      // this is a cherrytree hook for "performing"
      // actions upon entering this state
      activate: function () {
        this.$view = $("<div>", {
          'class': 'application',
          css: {
            margin: "100px",
            textAlign: "center",
            border: "10px solid #333"
          }
        });
        this.$view.html("<h1>Cherrytree Application</h1><div class='outlet'></div>");

        this.$outlet = this.$view.find(".outlet");

        $(document.body).append(this.$view);
      }
    });
    // then we'll create an application.index state that
    // will render out the welcome page
    router.handlers["index"] = State.extend({
      activate: function () {
        this.parent.$outlet.html("Welcome to this application");
      }
    });
    // about page
    router.handlers["about"] = State.extend({
      activate: function () {
        this.parent.$outlet.html("This is about page");
      }
    });
    // faq page
    router.handlers["faq"] = State.extend({
      model: function (params) {
        this.params = params;
      },
      activate: function () {
        this.render();
      },
      render: function () {
        this.parent.$outlet.html("FAQ.");
        this.parent.$outlet.append(" Sorted By: " + this.params.queryParams.sortBy);
      },
      update: function () {
        this.render();
        return false;
      },
      queryParamsDidChange: function () {
        this.refresh();
      }
    });
    // posts page
    router.handlers["posts.filter"] = State.extend({
      model: function (params) {
        return params;
      },
      activate: function (context) {
        if (context.filterId === "mine") {
          this.parent.parent.$outlet.html("My posts...");
        } else {
          this.parent.parent.$outlet.html("Filter not found");
        }
      }
    });
  }

  TestApp.prototype.start = function () {
    return this.router.startRouting();
  };

  TestApp.prototype.destroy = function () {
    $(document.body).empty();
    return this.router.destroy();
  };

  return TestApp;
});