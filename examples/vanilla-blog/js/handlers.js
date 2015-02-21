var $ = require("jquery");
var _ = require("lodash");
var Promise = require("../../../vendor/promise");

var template = function (name) {
  return _.template("<div>" + $("script#" + name).html() + "</div>");
};

var handlers = {};

var BaseRoute = {
  model: function (params) {
    var self = this;
    return new Promise(function (resolve) {
      self.timeout = setTimeout(function () {
        resolve(params);
      }, 300);
    });
  },
  abortModel: function () {
    window.clearTimeout(this.timeout);
  },
  deactivate: function () {
    window.clearTimeout(this.timeout);
    if (this.$view) {
      this.$view.remove();
    }
  },
  getTemplateName: function () {
    return this.templateName || this.name.replace(/\./g, "-");
  },
  templateData: function () {
    return {};
  },
  view: function (context) {
    var tpl = template(this.getTemplateName())(this.templateData(context));
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

handlers.base = BaseRoute;

// provide the routes
// first of all, we want an application route
handlers["application"] = _.extend({}, BaseRoute, {
  // this is a cherrytree hook for "performing"
  // actions upon entering this route
  model: function () {
    var context = {
      appRnd: Math.random()
    };
    this.activate(context);
    return context;
  },
  templateData: function (context) {
    return {
      rnd: context.appRnd
    }
  },
  outlet: function () {
    return $(document.body);
  }
});

// then we'll create an application.index route that
// will render out the welcome page
handlers["posts"] = _.extend({}, BaseRoute, {
  templateName: "posts",
  model: function (params, context) {
    return context.then(function (context) {
      return new Promise(function (resolve) {
        resolve(_.extend(context, {
          allPostsData: ["foo", "bar"]
        }));
      });
    });
  }
});

// then we'll create an application.index route that
// will render out the welcome page
handlers["index"] = _.extend({}, BaseRoute, {
  templateName: "home"
});

// blog show
handlers["posts.show"] = _.extend({}, BaseRoute, {
  model: function (params, context) {
    if (!this.sessionStore) {
      this.sessionStore = 1;
    } else {
      this.sessionStore++;
    }
    return context.then(function (context) {
      return new Promise(function (resolve) {
        resolve({title: "Blog " + params.id, subtitle: context.allPostsData[0] + context.appRnd});
      });
    });
  },
  view: function (context) {
    return $(template("posts-show")({
      title: "Blog post #" + context.title + " (" + context.subtitle + ")"
    }));
  }
});

// blog page
handlers["posts.filter"] = _.extend({}, BaseRoute, {
  model: function (params) {
    return params;
  },
  activate: function (context) {
    this.render(context);
  },
  update: function (context) {
    this.render(context);
  },
  // queryParamsDidChange: function (queryParams) {
  //   var context = this.getContext();
  //   context.queryParams = queryParams;
  //   this.setContext(context);
  //   this.render(context);
  // },
  render: function (context) {
    if (context.filterId === "mine") {
      this.outlet().html("My posts...");
    } else {
      this.outlet().html("Filter not found");
    }
    if (context.queryParams.sortBy) {
      this.outlet().append("<div>Sorting by:" + context.queryParams.sortBy + "</div>");
    }
  }
});

module.exports = handlers;