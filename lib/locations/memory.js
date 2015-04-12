module.exports = function () {
  return {
    path: '',

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

    formatURL: function (url) {
      return url
    }
  }
}
