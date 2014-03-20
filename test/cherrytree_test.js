define(function (require) {

  var $ = require("jquery");
  var RSVP = require("rsvp");
  var TestApp = require("test/test_app");

  var app, router;

  describe("cherrytree router", function () {

    beforeEach(function (done) {
      window.location.hash = "/";
      app = new TestApp();
      router = app.router;
      app.start().then(done, done);
    });

    afterEach(function () {
      app.destroy();
    });

    it("should transition when location.hash is changed", function (done) {
      window.location.hash = "#about";
      router.urlChanged = function (url) {
        url.should.equal("/about");
        $(".application .outlet").html().should.equal("This is about page");
        done();
      };
    });

    describe("query params", function () {
      it("should update routes in a similar fashion to regular params", function (done) {
        router.transitionTo("about").then(function () {
          // we can also transition via URL
          return router.transitionTo("/faq?sortBy=date");
        }).then(function () {
          $(".application .outlet").html().should.equal("FAQ. Sorted By: date");
          // we can change the param now
          return router.transitionTo("faq", {queryParams: { sortBy: "user" }});
        }).then(function () {
          $(".application .outlet").html().should.equal("FAQ. Sorted By: user");
        }).then(done, done);
      });
    });

    it.skip("should log info if logging is turned on", function () {});

    it("can be used to render a webapp", function (done) {
      $(".application .outlet").html().should.equal("Welcome to this application");
      // we can transition into different parts of the app
      // using the transitionTo method
      router.transitionTo("about").then(function () {
        $(".application .outlet").html().should.equal("This is about page");
      }).then(function () {
        // we can also transition via URL
        return router.transitionTo("/faq?sortBy=date");
      }).then(function () {
        $(".application .outlet").html().should.equal("FAQ. Sorted By: date");
        // we can change the param now
        return router.transitionTo("faq", {queryParams: { sortBy: "user" }});
      }).then(function () {
        $(".application .outlet").html().should.equal("FAQ. Sorted By: user");
      }).then(function () {
        // we can also change the url directly to cause another transition to happen
        var d = RSVP.defer();
        router.urlChanged = function (url) {
          url.should.equal("/posts/filter/mine");
          d.resolve();
        };
        window.location.hash = "#posts/filter/mine";
        return d.promise;
      }).then(function () {
        $(".application .outlet").html().should.equal("My posts...");
      }).then(function () {
        // let's try a different filter
        var d = RSVP.defer();
        router.urlChanged = function (url) {
          url.should.equal("/posts/filter/foo");
          d.resolve();
        };
        window.location.hash = "#posts/filter/foo";
        return d.promise;
      }).then(function () {
        $(".application .outlet").html().should.equal("Filter not found");
      }).then(function () {
        // we can abort transitions
        router.location.getURL().should.be.equal("/posts/filter/foo");
        var transition = router.transitionTo("about");
        transition.abort();
        router.location.getURL().should.be.equal("/posts/filter/foo");
      }).then(done, done);
    });
  });

});