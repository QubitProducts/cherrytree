var _ = require('../dash')

module.exports = function (path) {
  return {
    path: path || '',

    getURL: function () {
      return this.path
    },

    setURL: function (path, options) {
      if (this.path !== path) {
        this.path = path
        this.handleURL(this.getURL(), options)
      }
    },

    replaceURL: function (path, options) {
      if (this.path !== path) {
        this.setURL(path, options)
      }
    },

    onChange: function (callback) {
      this.changeCallback = callback
    },

    handleURL: function (url, options) {
      this.path = url
      options = _.extend({trigger: true}, options)
      if (this.changeCallback && options.trigger) {
        this.changeCallback(url)
      }
    },

    usesPushState: function () {
      return false
    },

    removeRoot: function (url) {
      return url
    },

    formatURL: function (url) {
      return url
    }
  }
}
