define(function (require) {

  var RSVP = require("rsvp");
  var Promise = RSVP.Promise;
  var Router = require("cherrytree");
  var Route = require("cherrytree/route");
  var HistoryLocation = require("cherrytree/location/history_location");

  var delay = function (time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  };

  var router, sequence = [];

  var BaseRoute = Route.extend({
    model: function () {
      sequence.push("model " + this.name);
      return delay(30);
    },
    initialize: function () {
      sequence.push("initialize " + this.name);
    },
    activate: function () {
      sequence.push("activate " + this.name);
    },
    destroy: function () {
      sequence.push("destroy " + this.name);
    }
  });

  describe("abandoned states", function () {

    beforeEach(function (done) {
      window.location.hash = "/";
      router = new Router({
        location: new HistoryLocation(),
        BaseRoute: BaseRoute
      });

      // provide the route map
      router.map(function () {
        this.route("about");
        this.resource("posts", function () {
          this.route("popular");
          this.route("latest");
          this.route("best");
          this.route("show", {path: "/:postId"});
        });
      });

      router.startRouting().then(done, done);
    });

    afterEach(function () {
      router.destroy();
    });

    it("should destroy abandoned states when param is changing", function (done) {
      router.addRoute("posts.show", BaseRoute.extend({
        initialize: function () {
          sequence.push("initialize " + this.name);
        },
        model: function (params) {
          sequence.push("model " + this.name + " " + params.postId);
          return delay(30).then(function () {
            return params;
          });
        },
        activate: function (context) {
          this.postId = context.postId;
          sequence.push("activate " + this.name + " " + context.postId);
        },
        destroy: function () {
          sequence.push("destroy " + this.name + " " + this.postId);
        }
      }));
      router.transitionTo("about").then(function () {
        sequence = [];
        router.transitionTo("posts.show", 1);
        return delay(40);
      }).then(function () {
        router.transitionTo("posts.show", 2);
        return delay(10);
      }).then(function () {
        return router.transitionTo("posts.show", 3);
      }).then(function () {
        return router.transitionTo("posts.show", 4);
      }).then(function () {
        sequence.should.deep.equal([
          'initialize posts',
          'model posts',
          'initialize posts.show',
          'model posts.show 1',
          'model posts.show 2',
          'model posts.show 3',
          'destroy about',
          'activate posts',
          'activate posts.show 3',
          'model posts.show 4',
          'destroy posts.show 3',
          'activate posts.show 4',
        ]);
      }).then(done, done);
    });

    it("should destroy all abandoned states", function (done) {
      router.transitionTo("about").then(function () {
        sequence = [];
        router.transitionTo("posts.popular");
        return delay(50);
      }).then(function () {
        router.transitionTo("posts.latest");
        return delay(20);
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
          'destroy about',
          'activate posts',
          'activate posts.best'
        ]);
      }).then(done, done);
    });

    describe("only changing params", function () {
      it("should still destroy the previous state with the same name", function (done) {
        router.addRoute("posts.show", BaseRoute.extend({
          initialize: function () {
            sequence.push("initialize " + this.name);
          },
          model: function (params) {
            this.postId = params.postId;
            sequence.push("model " + this.name + " " + this.postId);
            return delay(30).then(function () {
              return params;
            });
          },
          activate: function (context) {
            sequence.push("activate " + this.name + " " + context.postId);
          },
          destroy: function () {
            sequence.push("destroy " + this.name);
          }
        }));
        router.transitionTo("about").then(function () {
          sequence = [];
          return router.transitionTo("posts.show", 1);
        }).then(function () {
          return router.transitionTo("posts.show", 2);
        }).then(function () {
          console.log(JSON.stringify(sequence, null, 2));
          sequence.should.deep.equal([
            'initialize posts',
            'model posts',
            'initialize posts.show',
            'model posts.show 1',
            'destroy about',
            'activate posts',
            'activate posts.show 1',
            'model posts.show 2',
            'destroy posts.show',
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
          return delay(10);
        }).then(function () {
          // we can also transition via URL
          t2 = router.transitionTo("posts.show", 3);
          return t2;
        }).then(function () {
          t1.should.not.equal(t2);
        }).then(done, done);
      });
    });

  });

});