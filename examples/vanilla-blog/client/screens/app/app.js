var $ = require('jquery')
var _ = require('lodash')
var template = require('./templates/app.html')
var BaseHandler = require('base_handler')

module.exports = _.extend({}, BaseHandler, {
  template: template,
  model: function () {
    var context = {
      appRnd: Math.random()
    }
    // activate eagerly - we want to render this route
    // right while the other routes might be loading
    this.activate(context)
    return context
  },
  templateData: function (context) {
    return {
      rnd: context.appRnd
    }
  },
  outlet: function () {
    return $(document.body)
  }
})
