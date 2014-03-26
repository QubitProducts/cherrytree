(function (define) { 'use strict';
  define(function (require) {

    var _ = require('../lib/util');
    var links = require('../lib/link_delegate');
    var LocationBar = require('location-bar');

    var HistoryLocation = function (options) {
      this.options = _.extend({}, this.options);
      this.options = _.extend(this.options, options);
      this.initialize(this.options);
    };
    _.extend(HistoryLocation.prototype, {
      path: '',

      options: {
        pushState: false,
        interceptLinks: true,
        root: '/'
      },

      initialize: function (options) {
        var self = this;
        this.locationBar = new LocationBar();
        this.locationBar.onChange(function (path) {
          self.handleURL('/' + (path || ''));
        });

        this.locationBar.start(_.extend(options));

        // we want to intercept all link clicks in case we're using push state,
        // because all link clicks should be handled via the router instead of
        // browser reloading the page
        if (this.usesPushState() && this.options.interceptLinks) {
          this.interceptLinks();
        }
      },

      interceptLinks: function () {
        var self = this;
        this.linkHandler = function (e, link) {
          e.preventDefault();
          // TODO use router.transitionTo instead, because
          // that way we're handling errors and what not? and don't
          // update url on failed requests or smth?
          self.navigate(link.getAttribute('href'));
        };
        links.delegate(this.linkHandler);
      },

      usesPushState: function () {
        return this.options.pushState && this.locationBar.hasPushState();
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
        }
      },

      replaceURL: function (path) {
        if (this.path !== path) {
          this.path = path;
          this.locationBar.update(path, {trigger: false, replace: true});
        }
      },

      // callback for what to do when backbone router handlers a URL
      // change
      onChange: function (callback) {
        this.changeCallback = callback;
      },

      /**
        initially, the changeCallback won't be defined yet, but that's good 
        because we dont' want to kick off routing right away, the router
        does that later by manually calling this handleURL method with the
        url it reads of the location. But it's important this is called
        first by Backbone, because we wanna set a correct this.path value
       */
      handleURL: function (url) {
        this.path = url;
        if (this.changeCallback) {
          this.changeCallback(url);
        }
      },

      formatURL: function (url) {
        if (this.locationBar.hasPushState()) {
          var rootURL = this.options.root;

          if (url !== '') {
            rootURL = rootURL.replace(/\/$/, '');
          }

          return rootURL + url;
        } else {
          if (url[0] === '/') {
            url = url.substr(1);
          }
          return '#' + url;
        }
      },

      destroy: function () {
        this.locationBar.stop();
        if (this.linkHandler) {
          links.undelegate(this.linkHandler);
        }
      }
    });

    return HistoryLocation;
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });