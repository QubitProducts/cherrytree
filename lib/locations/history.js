import { extend } from '../dash'
import LocationBar from 'location-bar'

export default HistoryLocation

function HistoryLocation (options) {
  this.path = options.path || ''

  this.options = extend({
    pushState: false,
    root: '/'
  }, options)

  // we're using the location-bar module for actual
  // URL management
  let self = this
  this.locationBar = new LocationBar()
  this.locationBar.onChange(function (path) {
    self.handleURL('/' + (path || ''))
  })

  this.locationBar.start(extend({}, options))
}

/**
 * Check if we're actually using pushState. For browsers
 * that don't support it this would return false since
 * it would fallback to using hashState / polling
 * @return {Bool}
 */

HistoryLocation.prototype.usesPushState = function () {
  return this.options.pushState && this.locationBar.hasPushState()
}

/**
 * Get the current URL
 */

HistoryLocation.prototype.getURL = function () {
  return this.path
}

/**
 * Set the current URL without triggering any events
 * back to the router. Add a new entry in browser's history.
 */

HistoryLocation.prototype.setURL = function (path, options) {
  if (this.path !== path) {
    this.path = path
    this.locationBar.update(path, extend({trigger: true}, options))
  }
}

/**
 * Set the current URL without triggering any events
 * back to the router. Replace the latest entry in broser's history.
 */

HistoryLocation.prototype.replaceURL = function (path, options) {
  if (this.path !== path) {
    this.path = path
    this.locationBar.update(path, extend({trigger: true, replace: true}, options))
  }
}

/**
 * Setup a URL change handler
 * @param  {Function} callback
 */
HistoryLocation.prototype.onChange = function (callback) {
  this.changeCallback = callback
}

/**
 * Given a path, generate a URL appending root
 * if pushState is used and # if hash state is used
 */
HistoryLocation.prototype.formatURL = function (path) {
  if (this.locationBar.hasPushState()) {
    let rootURL = this.options.root
    if (path !== '') {
      rootURL = rootURL.replace(/\/$/, '')
    }
    return rootURL + path
  } else {
    if (path[0] === '/') {
      path = path.substr(1)
    }
    return '#' + path
  }
}

/**
 * When we use pushState with a custom root option,
 * we need to take care of removingRoot at certain points.
 * Specifically
 * - history.update() can be called with the full URL by router
 * - LocationBar expects all .update() calls to be called without root
 * - this method is public so that we could dispatch URLs without root in router
 */
HistoryLocation.prototype.removeRoot = function (url) {
  if (this.options.pushState && this.options.root && this.options.root !== '/') {
    return url.replace(this.options.root, '')
  } else {
    return url
  }
}

/**
 * Stop listening to URL changes and link clicks
 */
HistoryLocation.prototype.destroy = function () {
  this.locationBar.stop()
}

/**
  initially, the changeCallback won't be defined yet, but that's good
  because we dont' want to kick off routing right away, the router
  does that later by manually calling this handleURL method with the
  url it reads of the location. But it's important this is called
  first by Backbone, because we wanna set a correct this.path value

  @private
 */
HistoryLocation.prototype.handleURL = function (url) {
  this.path = url
  if (this.changeCallback) {
    this.changeCallback(url)
  }
}
