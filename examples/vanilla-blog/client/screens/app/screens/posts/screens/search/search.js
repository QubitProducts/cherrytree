var _ = require('lodash')
var BaseHandler = require('base_handler')

module.exports = _.extend({}, BaseHandler, {
  model: function (params) {
    return params
  },
  activate: function (context) {
    this.render(context)
  },
  update: function (context) {
    this.render(context)
  },
  // queryParamsDidChange: function (queryParams) {
  //   var context = this.getContext()
  //   context.queryParams = queryParams
  //   this.setContext(context)
  //   this.render(context)
  // },
  render: function (context) {
    if (context.query === 'mine') {
      this.outlet().html('My posts...')
    } else {
      this.outlet().html('No matching blog posts were found')
    }
    if (context.queryParams.sortBy) {
      this.outlet().append('<div>Sorting by:' + context.queryParams.sortBy + '</div>')
    }
  }
})
