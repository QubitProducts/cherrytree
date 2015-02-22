var _ = require("lodash");
var BaseHandler = require("base_handler");

var handlers = {
  "application": require("./screens/app"),
  "home": require("./screens/app/screens/home"),
  "about": require("./screens/app/screens/about"),
  "faq": require("./screens/app/screens/faq"),
  "posts": require("./screens/app/screens/posts"),
  "posts.index": require("./screens/app/screens/posts/screens/index"),
  "posts.show": require("./screens/app/screens/posts/screens/show"),
  "posts.search": require("./screens/app/screens/posts/screens/search"),
};

module.exports = function getHandler(routeName) {
  return handlers[routeName] || _.clone(BaseHandler);
};