var _ = require('lodash')
var BaseHandler = require('base_handler')
var template = require('./templates/posts.html')

module.exports = _.extend({}, BaseHandler, {
  template: template,
  model: function (params, context) {
    return context.then(function (context) {
      return new Promise(function (resolve) {
        resolve(_.extend(context, {
          allPostsData: ['foo', 'bar']
        }))
      })
    })
  }
})
