var template = require("./templates/show.html");
var BaseHandler = require("base_handler");

module.exports = _.extend({}, BaseHandler, {
  template: template,
  willTransition: function (transition) {
    if (this.postId === "2") {
      transition.cancel();
    }
  },
  model: function (params, context) {
    if (!this.sessionStore) {
      this.sessionStore = 1;
    } else {
      this.sessionStore++;
    }
    var self = this;
    return context.then(function (context) {
      self.postId = params.id;
      return new Promise(function (resolve) {
        resolve({title: "Blog " + params.id, subtitle: context.allPostsData[0] + context.appRnd});
      });
    });
  },
  templateData: function (context) {
    return {
      title: "Blog post #" + context.title + " (" + context.subtitle + ")"
    };
  }
});