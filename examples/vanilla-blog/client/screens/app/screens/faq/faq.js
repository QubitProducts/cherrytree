var template = require("./templates/faq.html");
var BaseHandler = require("base_handler");

module.exports = _.extend({}, BaseHandler, {
  template: template
});