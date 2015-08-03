module.exports = function fakeHistory (location) {
  let history = []

  var originalPushState = window.history.pushState
  window.history.pushState = function (state, title, url) {
    history.push(url)
  }

  return {
    getURL: function getURL () {
      return history[history.length - 1]
    },

    /**
     * This method relies on deep internals of
     * how location-bar is implented, to simulate
     * what happens when the URL in the browser
     * changes. It might be better to
     * a) build functional tests that include a server with real pushState
     * b) unit test around this
     */
    setURL: function setURL (url) {
      // cherrytree + location-bar + window.location
      location.locationBar.location = {
        pathname: url,
        search: ''
      }
      // 'trigger' a popstate
      location.locationBar.checkUrl()
    },

    restore: function restore () {
      window.history.pushState = originalPushState
    }
  }
}
