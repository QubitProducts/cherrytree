define(function (require) {

  var Route = require("cherrytree/route");

  describe("route", function () {

    beforeEach(function () {
      this.route = new Route("foo");
    });

    describe("#getContext", function () {
      describe("when no context is set", function () {
        it("returns an empty object", function () {
          expect(this.route.getContext()).to.deep.equal({});
        });
      });
      describe("when context is set", function () {
        it("returns the context", function () {
          var context = {a: 1};
          this.route.setContext(context);
          expect(this.route.getContext()).to.equal(context);
        });
      });
    });

    describe("#setContext", function () {
      it("overwrites the previous context", function () {
        var context1 = {a: 1, b: 2};
        var context2 = {a: 3};
        this.route.setContext(context1);
        expect(this.route.getContext()).to.deep.equal({a: 1, b: 2});
        expect(this.route.getContext()).to.equal(context1);
        this.route.setContext(context2);
        expect(this.route.getContext()).to.deep.equal({a: 3});
        expect(this.route.getContext()).to.equal(context2);
      });
    });

    describe("#get", function () {
      it("returns a field from route's context if it's available there", function () {
        var context = {a: 1};
        this.route.setContext(context);
        expect(this.route.get("a")).to.be.equal(1);
      });
      it("returns undefined if the field is not found", function () {
        expect(this.route.get("a")).to.be.equal(undefined);
      });
      it("returns a field from route's parent's context if it's not available in the route", function () {
        var parent1 = new Route("parent1");
        this.route.parent = parent1;

        var parent2 = new Route("parent2");
        this.route.parent.parent = parent2;
        
        var context = {a: 1};
        parent2.setContext(context);
        
        expect(this.route.get("a")).to.be.equal(1);
      });
    });

  });

});