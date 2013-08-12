define(function (require) {

  var _ = require("underscore");
  var extend = require("./extend");

  // TODO options should be a generic hash of options,
  // it should contain params, which are the params extracted from the URL

  var State = function (name, params) {
    this.name = name;
    this.options = _.clone(params);
    this.router = params.router;
    this.id = _.uniqueId();
    this.initialize();
  };
  State.prototype = {
    initialize: function () {},
    model: function () {},
    // best hook for doing redirects
    afterModel: function () {},
    activate: function () {},
    destroy: function () {},
    setParent: function (parent) {
      this.parent = parent;
    },
    transitionTo: function() {
      var router = this.router;
      return router.transitionTo.apply(router, arguments);
    },
    replaceWith: function () {
      var router = this.router;
      return router.replaceWith.apply(router, arguments);
    }
  };

  State.extend = extend;

  return State;

});