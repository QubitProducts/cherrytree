define(function (require) {

  // var sinon = require("sinon");
  var sinon = window.sinon;
  var Router = require('cherrytree');
  var Route = require('cherrytree/route');
  var NoneLocation = require('cherrytree/locations/none');

  var router, cResolver, dResolver;

  describe("resolvers", function () {

    beforeEach(function () {
      var routes = {
        a: Route.extend({}),
        b: Route.extend({})
      };

      cResolver = sinon.spy(function (name, cb) { cb(); });
      dResolver = sinon.spy(function (name, cb) { cb(); });

      router = new Router({
        location: new NoneLocation(),
        resolver: function (name, cb) {
          cb(routes[name]);
        },
        map: function () {
          this.route('a');
          this.route('b');
          this.route('c', {resolver: cResolver});
          this.resource('d', {resolver: dResolver}, function () {
            this.route('dd');
          });
        }
      });

      return router.startRouting();
    });

    afterEach(function () {
      router.destroy();
    });

    it("calls resolver when transitioning to a route", function () {
      sinon.spy(router.resolvers, "application");
      return router.transitionTo('a').then(function () {
        router.resolvers.application.should.have.been.calledWith('a');
      });
    });

    it("caches the resolver value after the first call", function () {
      sinon.spy(router.resolvers, "application");
      return router.transitionTo('a').then(function () {
        router.resolvers.application.should.have.been.calledWith('a');
      }).then(function () {
        return router.transitionTo('b');
      }).then(function () {
        router.resolvers.application.should.have.been.calledWith('b');
      }).then(function () {
        return router.transitionTo('a');
      }).then(function () {
        router.resolvers.application.should.have.been.called;
      });
    });

    it("allows specifying a custom resolver per route", function () {
      return router.transitionTo('c').then(function () {
        cResolver.should.have.been.calledWith('c');
      });
    });

    it("allows specifying a custom resolver per resource", function () {
      return router.transitionTo('d.dd').then(function () {
        dResolver.should.have.been.calledWith('d');
        dResolver.should.have.been.calledWith('d.dd');
      });
    });    
  });

});