define(function (require) {

  var TestApp = require("./test_app");

  var app, router;

  describe("router.generate()", function () {

    beforeEach(function (done) {
      window.location.hash = "/";
      app = new TestApp();
      router = app.router;
      app.start().then(done, done);
    });

    afterEach(function () {
      app.destroy();
    });

    it("should generate a URL given the state name and params", function () {
      router.generate("about").should.equal("#about");
      router.generate("posts.index").should.equal("#posts");
      router.generate("posts.filter", "foo").should.equal("#posts/filter/foo");
      router.generate("posts.filter", "foo", {
        queryParams: {
          sortBy: "name"
        }
      }).should.equal("#posts/filter/foo?sortBy=name");
    });

    it.skip("should reuse existing params if only a subset of params are provided", function () {

    });

  });

});