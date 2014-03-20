(function (define) { 'use strict';
  define(function (require) {

    var extend      = require('../lib/util/extend');
    var LocationBar = require('location-bar');

    var HistoryLocation = function (options) {
      this.options = extend({}, this.options);
      this.options = extend(this.options, options);
      this.initialize(this.options);
    };
    extend(HistoryLocation.prototype, {
      path: '',

      options: {
        pushState: false,
        root: '/'
      },

      initialize: function (options) {
        var self = this;
        this.locationBar = new LocationBar();
        this.locationBar.onChange(function (path) {
          self.handleURL('/' + (path || ''));
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
      }
    });

    return HistoryLocation;
  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });