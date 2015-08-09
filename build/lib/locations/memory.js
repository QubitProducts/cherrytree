'use strict';

var _ = require('../dash');

module.exports = function (path) {
  return {
    path: path || '',

    getURL: function getURL() {
      return this.path;
    },

    setURL: function setURL(path, options) {
      if (this.path !== path) {
        this.path = path;
        this.handleURL(this.getURL(), options);
      }
    },

    replaceURL: function replaceURL(path, options) {
      if (this.path !== path) {
        this.setURL(path, options);
      }
    },

    onChange: function onChange(callback) {
      this.changeCallback = callback;
    },

    handleURL: function handleURL(url, options) {
      this.path = url;
      options = _.extend({ trigger: true }, options);
      if (this.changeCallback && options.trigger) {
        this.changeCallback(url);
      }
    },

    usesPushState: function usesPushState() {
      return false;
    },

    removeRoot: function removeRoot(url) {
      return url;
    },

    formatURL: function formatURL(url) {
      return url;
    }
  };
};