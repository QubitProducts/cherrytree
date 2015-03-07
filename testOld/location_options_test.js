define(function (require) {

  var Router = require("cherrytree");

  describe("cherrytree", function () {
    it("should pass location options to the default location", function () {
      var options = {
        pushState: false,
        root: "/customRoot",
        interceptLinks: false
      };
      var router = new Router(options);
      expect(router.locationOptions).to.deep.equal(options);

      router.handleURL = function () {}
      router.startRouting();
      expect(router.location.options).to.deep.equal(options)

      router.destroy();
    });
  });

});