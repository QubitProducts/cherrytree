module.exports = {
  model: function (params, transition) {
    transition.redirectTo("posts.show", 1);
  },
  activate: function () {},
  deactivate: function () {}
};