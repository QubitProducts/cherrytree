var $ = require("jquery");
var _ = require("lodash");
var Promise = require("when").Promise;

module.exports = {
  template: _.template("<div class='outlet'></div>"),
  model: function (params) {
    var self = this;
    return new Promise(function (resolve) {
      self.timeout = setTimeout(function () {
        resolve(params);
      }, 300);
    });
  },
  deactivate: function () {
    window.clearTimeout(this.timeout);
    if (this.$view) {
      this.$view.remove();
    }
  },
  templateData: function () {
    return {};
  },
  view: function (context) {
    var tpl = "<div>" + this.template(this.templateData(context)) + "</div>";
    var router = this.router;
    tpl = tpl.replace(/\{\{link\:(.*)\}\}/g, function (match, routeId) {
      return router.generate(routeId);
    });
    return $(tpl);
  },
  activate: function () {
    this.$view = this.view.apply(this, arguments);
    this.$outlet = this.$view.find(".outlet");
    this.outlet().html(this.$view);
  },
  outlet: function () {
    var parent = this.parent;
    while (parent) {
      if (parent.$outlet) {
        return parent.$outlet;
      } else {
        parent = parent.parent;
      }
    }
  }
};