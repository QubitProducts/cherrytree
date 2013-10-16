define(function (require) {

  var extend      = require("../util/extend");
  var LocationBar = require("location-bar");

  // save the current scroll position at all times
  // for use when back/forward buttons are used
  var $ = require("jquery");
  var currentScroll;
  $(window).scroll(function () {
    currentScroll = window.scrollY;
  });

  var HistoryLocation = function (options) {
    this.options = extend({}, this.options);
    this.options = extend(this.options, options);
    this.initialize(this.options);
  };
  HistoryLocation.prototype = {
    path: "",

    options: {
      pushState: false,
      root: "/"
    },

    initialize: function (options) {
      var self = this;

      this.locationBar = new LocationBar();

      this.locationBar.onChange(function (path) {
        path = path || "";

        // experimental feature: preserving scroll upon
        // navigation
        window.scrollTo(0, currentScroll);
        setTimeout(function () {
          window.scrollTo(0, currentScroll);
        }, 0);
        setTimeout(function () {
          window.scrollTo(0, currentScroll);
        }, 1);

        // var query = path.split("?")[1];
        path = path.split("?")[0];
        self.handleURL("/" + path);

        // for now, we publish the url:params via mediator
        // we should get some better inspiration from ember-query
        // about how we could pass these in via the router into the
        // states
        // var mediator = require("leap/mediator");
        // mediator.publish("url:params", query);
      });
      this.locationBar.start(extend(options));
    },

    usesPushState: function () {
      return this.options.pushState;
    },

    getURL: function () {
      return this.path;
    },

    navigate: function (url) {
      this.locationBar.update(url, {trigger: true});
    },

    setURL: function (path) {
      if (this.path !== path) {
        this.path = path;
        this.locationBar.update(path, {trigger: false});
        if (this.changeCallback) {
          this.changeCallback(this.path);
        }
      }
    },

    replaceURL: function (path) {
      if (this.path !== path) {
        this.path = path;
        this.locationBar.update(path, {trigger: false, replace: true});
        if (this.changeCallback) {
          this.changeCallback(this.path);
        }
      }
    },

    // when the url
    onChangeURL: function (callback) {
      this.changeCallback = callback;
    },

    // callback for what to do when backbone router handlers a URL
    // change
    onUpdateURL: function (callback) {
      this.updateCallback = callback;
    },

    handleURL: function (url) {
      this.path = url;
      // initially, the updateCallback won't be defined yet, but that's good
      // because we dont' want to kick off routing right away, the router
      // does that later by manually calling this handleURL method with the
      // url it reads of the location. But it's important this is called
      // first by Backbone, because we wanna set a correct this.path value
      if (this.updateCallback) {
        this.updateCallback(url);
      }
    },

    formatURL: function (url) {
      if (this.locationBar.hasPushState()) {
        var rootURL = this.options.root;

        if (url !== "") {
          rootURL = rootURL.replace(/\/$/, '');
        }

        return rootURL + url;
      } else {
        if (url[0] === "/") {
          url = url.substr(1);
        }
        return "#" + url;
      }
    },

    destroy: function () {
      this.locationBar.stop();
    }
  };

  return HistoryLocation;
});