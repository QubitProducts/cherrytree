define(function (require) {

  var Router = require("cherrytree");
  var Route = require("cherrytree/route");
  var MemoryLocation = require("cherrytree/locations/memory");
  var Promise = require("cherrytree/vendor/promise");


  var delay = function (time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  };

  var router, sequence = [];

  var BaseRoute = Route.extend({
    model: function () {
      sequence.push("model " + this.name);
      return delay(10);
    },
    initialize: function () {
      sequence.push("initialize " + this.name);
    },
    activate: function () {
      sequence.push("activate " + this.name);
    },
    deactivate: function () {
      sequence.push("deactivate " + this.name);
    }
  });

  describe("route lifecycle", function () {

    beforeEach(function (done) {
      router = new Router({
        location: new MemoryLocation(),
        defaultRouteHandler: BaseRoute
      });

      // provide the route map
      router.map(function () {
        this.route("about");
        this.resource("posts", function () {
          this.route("popular");
          this.route("latest");
          this.route("best");
          this.route("show", {path: "/:postId"});
          this.resource("postsAdmin", function () {
            this.route("create", {queryParams: ["templateId"]});
          });
        });
        this.resource("account", {path: "/:accountId"}, function () {
          this.resource("settings", function () {
            this.route("password");
            this.route("photo", {queryParams: ["size"]});
            this.route("permissions", {path: "/:setId"});
          });
        });
      });

      router.handlers["postsAdmin.create"] = BaseRoute.extend({
        update: function () {
          sequence.push("update " + this.name);
        },
        queryParamsDidChange: function () {
          this.refresh();
        }
      });

      router.handlers["settings.photo"] = BaseRoute.extend({
        update: function () {
          sequence.push("update " + this.name);
        },
        queryParamsDidChange: function () {
          this.refresh();
        }
      });

      router.startRouting().then(done, done);
    });

    afterEach(function () {
      router.destroy();
    });

    it("should handle rapid retransitioning", function (done) {
      router.handlers["posts.show"] = BaseRoute.extend({
        initialize: function () {
          sequence.push("initialize " + this.name);
        },
        model: function (params) {
          sequence.push("model " + this.name + " " + params.postId);
          return delay(10).then(function () {
            return params;
          });
        },
        activate: function (context) {
          this.postId = context.postId;
          sequence.push("activate " + this.name + " " + context.postId);
        },
        deactivate: function () {
          sequence.push("deactivate " + this.name + " " + this.postId);
        }
      });
      router.transitionTo("about").then(function () {
        sequence = [];
        router.transitionTo("posts.show", 1);
        return delay(20);
      }).then(function () {
        router.transitionTo("posts.show", 2);
        return delay(5);
      }).then(function () {
        return router.transitionTo("posts.show", 3);
      }).then(function () {
        return delay(10).then(function () {
          return router.transitionTo("posts.show", 4);
        });
      }).then(function () {
        sequence.should.deep.equal([
          'initialize posts',
          'model posts',
          'initialize posts.show',
          'model posts.show 1',
          'model posts.show 2',
          'model posts.show 3',
          'deactivate about',
          'activate posts',
          'activate posts.show 3',
          'model posts.show 4',
          'deactivate posts.show 3',
          'activate posts.show 4',
        ]);
      }).then(done, done);
    });

    it("should deactivate all abandoned states when changing target route midst transition", function (done) {
      router.transitionTo("about").then(function () {
        sequence = [];
        router.transitionTo("posts.popular");
        return delay(20);
      }).then(function () {
        router.transitionTo("posts.latest");
        return delay(2);
      }).then(function () {
        return router.transitionTo("posts.best");
      }).then(function () {
        sequence.should.deep.equal([
          'initialize posts',
          'model posts',
          'initialize posts.popular',
          'model posts.popular',
          'initialize posts.latest',
          'model posts.latest',
          'initialize posts.best',
          'model posts.best',
          'deactivate about',
          'activate posts',
          'activate posts.best'
        ]);
      }).then(done, done);
    });

    describe("update hook", function () {
      it("should be able to prevent the route from exiting", function (done) {
        router.transitionTo("postsAdmin.create", {queryParams: {templateId: 1}}).then(function () {
          sequence = [];
          return router.transitionTo("postsAdmin.create", {queryParams: {templateId: 2}});
        }).then(function () {
          sequence.should.deep.equal([
            'model postsAdmin.create',
            'update postsAdmin.create'
          ]);
        }).then(done, done);
      });
    });

    describe("optional transitionTo params", function () {
      it("should be possible to list all params", function (done) {
        router.transitionTo("settings.permissions", 1, 2).then(function () {
          sequence = [];
          return router.transitionTo("settings.permissions", 1, 3);
        }).then(function () {
          sequence.should.deep.equal([
            'model settings.permissions',
            'deactivate settings.permissions',
            'activate settings.permissions'
          ]);
        }).then(done, done);
      });
      it("should be possible to skip parent route params", function (done) {
        router.transitionTo("settings.permissions", 1, 2).then(function () {
          sequence = [];
          return router.transitionTo("settings.permissions", 3);
        }).then(function () {
          sequence.should.deep.equal([
            'model settings.permissions',
            'deactivate settings.permissions',
            'activate settings.permissions'
          ]);
        }).then(done, done);
      });
    });


    describe("upstream route changing context", function () {
      it("should reactivate the child routes", function (done) {
        router.transitionTo("settings.password", 1).then(function () {
          sequence = [];
          return router.transitionTo("settings.password", 2);
        }).then(function () {
          sequence.should.deep.equal([
            'model account',
            'model settings',
            'model settings.password',
            'deactivate account',
            'activate account',
            'deactivate settings',
            'activate settings',
            'deactivate settings.password',
            'activate settings.password'
          ]);
        }).then(done, done);
      });

      it("should reactivate the child routes with update function", function (done) {
        router.transitionTo("settings.photo", 1).then(function () {
          sequence = [];
          return router.transitionTo("settings.photo", {queryParams: {size: 24}});
        }).then(function () {
          sequence.should.deep.equal([
            'model settings.photo',
            'update settings.photo'
          ]);
          sequence = [];
          return router.transitionTo("settings.photo", 2, {queryParams: {size: 24}});
        }).then(function () {
          sequence.should.deep.equal([
            'model account',
            'model settings',
            'model settings.photo',
            'deactivate account',
            'activate account',
            'deactivate settings',
            'activate settings',
            'deactivate settings.photo',
            'activate settings.photo'
          ]);
        }).then(done, done);
      });
    });

    describe("only changing params", function () {
      it("should still deactivate the previous state with the same name", function (done) {
        router.handlers["posts.show"] = BaseRoute.extend({
          initialize: function () {
            sequence.push("initialize " + this.name);
          },
          model: function (params) {
            this.postId = params.postId;
            sequence.push("model " + this.name + " " + this.postId);
            return params;
          },
          activate: function (context) {
            sequence.push("activate " + this.name + " " + context.postId);
          },
          deactivate: function () {
            sequence.push("deactivate " + this.name);
          }
        });
        router.transitionTo("about").then(function () {
          sequence = [];
          return router.transitionTo("posts.show", 1);
        }).then(function () {
          return router.transitionTo("posts.show", 2);
        }).then(function () {
          sequence.should.deep.equal([
            'initialize posts',
            'model posts',
            'initialize posts.show',
            'model posts.show 1',
            'deactivate about',
            'activate posts',
            'activate posts.show 1',
            'model posts.show 2',
            'deactivate posts.show',
            'activate posts.show 2',
          ]);
        }).then(done, done);
      });
    });

    describe("check for identical transitions", function () {
      it("should fail when params have changed", function (done) {
        var t1, t2;
        router.transitionTo("posts.show", 1).then(function () {
          t1 = router.transitionTo("posts.show", 2);
          return t1;
        }).then(function () {
          t2 = router.transitionTo("posts.show", 3);
          return t2;
        }).then(function () {
          t1.should.not.equal(t2);
        }).then(done, done);
      });
    });

  });

});