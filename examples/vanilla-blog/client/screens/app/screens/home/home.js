var _ = require('lodash')
var template = require('./templates/home.html')
var BaseHandler = require('base_handler')

module.exports = _.extend({}, BaseHandler, {
  template: template
})
