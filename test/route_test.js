define(function (require) {

  describe("route", function () {

    // beforeEach(function (done) {
    //   window.location.hash = "/";
    //   router = new Router({
    //     location: new HistoryLocation(),
    //     BaseRoute: BaseRoute
    //   });

    //   // provide the route map
    //   router.map(function () {
    //     this.route("about");
    //     this.resource("posts", function () {
    //       this.route("popular");
    //       this.route("latest");
    //       this.route("best");
    //       this.route("show", {path: "/:postId"});
    //       this.resource("postsAdmin", function () {
    //         this.route("create", {queryParams: ["templateId"]});
    //       });
    //     });
    //     this.resource("account", {path: "/:accountId"}, function () {
    //       this.resource("settings", function () {
    //         this.route("password");
    //         this.route("photo", {queryParams: ["size"]});
    //       });
    //     });
    //   });

    //   router.addRoute("postsAdmin.create", BaseRoute.extend({
    //     update: function () {
    //       sequence.push("update " + this.name);
    //       return false;
    //     }
    //   }));

    //   router.addRoute("settings.photo", BaseRoute.extend({
    //     update: function () {
    //       sequence.push("update " + this.name);
    //       return false;
    //     }
    //   }));

    //   router.startRouting().then(done, done);
    // });

    // afterEach(function () {
    //   router.destroy();
    // });

    describe("#get", function () {
      it.skip("should retrieve models from parent route contexts");
    });

  });

});