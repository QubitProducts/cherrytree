define(function (require) {

  var $ = require("jquery");
  var Router = require('cherrytree/router');
  var Route = require('cherrytree/route');

  var router;

  describe.only("resolvers", function () {

    beforeEach(function (done) {
      var routes = {
        a: Route.extend({
          activate: function () {
            console.log('a');
          }
        }),
        b: Route.extend({
          activate: function () {
            console.log('b');
          }
        })
      };

      router = new Router({
        resolver: function (name) {
          console.log('RESOLVING');
          return routes[name];
        },
        map: function () {
          this.route('a');
          this.route('b');
        }
      });

      window.location.hash = "/";
      router.startRouting().then(done, done);
    });

    afterEach(function () {
      router.destroy();
    });

    it("should call resolver when transitioning to a route", function (done) {
      console.log('transitioning');
      router.transitionTo('a').then(function () {
        // router.options.resolver.should.have.been.calledWith('a');
        console.log('DONE!');
        done();
      });
    });
  });

});