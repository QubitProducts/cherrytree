module.exports = function (path) {
  return {
    path: path || '',

    getURL: function () {
      return this.path
    },

    setURL: function (path) {
      this.path = path
      this.handleURL(this.getURL())
    },

    replaceURL: function (path) {
      this.setURL(path)
    },

    onChange: function (callback) {
      this.changeCallback = callback
    },

    handleURL: function (url) {
      this.path = url
      if (this.changeCallback) {
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
