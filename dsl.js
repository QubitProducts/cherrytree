define(function (require) {

  var _ = require("underscore");

  function DSL(name, router) {
    this.parent = name;
    this.router = router;
    this.matches = [];
    this.prepares = {};
  }

  DSL.prototype = {
    resource: function(name, options, callback) {
      if (arguments.length === 2 && typeof options === 'function') {
        callback = options;
        options = {};
      }

      if (arguments.length === 1) {
        options = {};
      }

      if (typeof options.path !== 'string') {
        options.path = "/" + name;
      }

      // a method we'll call before entering this state
      if (options.prepare) {
        this.prepares[name] = options.prepare;
      }

      if (callback) {
        var dsl = new DSL(name, this.router);
        callback.call(dsl);
        this.push(options.path, name, dsl.generate());
        _.extend(this.prepares, dsl.prepares);
      } else {
        this.push(options.path, name);
      }
    },

    push: function(url, name, callback) {
      var parts = name.split('.');
      if (url === "" || url === "/" || parts[parts.length-1] === "index") { this.explicitIndex = true; }

      this.matches.push([url, name, callback]);
    },

    route: function(name, options) {
      // Ember.assert("You must use `this.resource` to nest", typeof options !== 'function');

      options = options || {};

      if (typeof options.path !== 'string') {
        options.path = "/" + name;
      }

      if (this.parent && this.parent !== 'application') {
        name = this.parent + "." + name;
      }

      if (options.prepare) {
        this.prepares[name] = options.prepare;
      }

      this.push(options.path, name);
    },

    generate: function() {
      var dslMatches = this.matches;

      if (!this.explicitIndex) {
        this.route("index", { path: "/" });
      }

      return function(match) {
        for (var i=0, l=dslMatches.length; i<l; i++) {
          var dslMatch = dslMatches[i];
          match(dslMatch[0]).to(dslMatch[1], dslMatch[2]);
        }
      };
    },

    state: function () {
      this.router.state.apply(this.router, arguments);
    },

    states: function () {
      this.router.states.apply(this.router, arguments);
    }
  };

  DSL.map = function(router, callback) {
    var dsl = new DSL(null, router);
    callback.call(dsl);
    return dsl;
  };

  return DSL;

});