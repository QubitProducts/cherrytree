"use strict";

module.exports = function () {
  return {
    path: "",

    getURL: function getURL() {
      return this.path;
    },

    setURL: function setURL(path) {
      this.path = path;
      this.handleURL(this.getURL());
    },

    replaceURL: function replaceURL(path) {
      this.setURL(path);
    },

    onChange: function onChange(callback) {
      this.changeCallback = callback;
    },

    handleURL: function handleURL(url) {
      this.path = url;
      if (this.changeCallback) {
        this.changeCallback(url);
      }
    },

    formatURL: function formatURL(url) {
      return url;
    }
  };
};