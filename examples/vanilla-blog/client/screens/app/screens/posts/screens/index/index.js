module.exports = {
  model: function (params, context, transition) {
    transition.redirectTo("posts.show", 1);
  },
  activate: function () {},
  deactivate: function () {}
};