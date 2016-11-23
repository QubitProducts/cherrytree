import { extend } from '../dash'

export default class MemoryLocation {
  constructor () {
    this.path = ''
  }

  start () {}

  url () {
    return this.path
  }

  push (path, options) {
    if (this.path !== path) {
      this.path = path
      this.handleURL(this.url(), options)
    }
  }

  replace (path, options) {
    if (this.path !== path) {
      this.setURL(path, options)
    }
  }

  onChange (callback) {
    this.changeCallback = callback
  }

  handleURL (url, options) {
    this.path = url
    options = extend({trigger: true}, options)
    if (this.changeCallback && options.trigger) {
      this.changeCallback(url)
    }
  }

  usesPushState () {
    return false
  }

  removeRoot (url) {
    return url
  }

  format (url) {
    return url
  }
}
