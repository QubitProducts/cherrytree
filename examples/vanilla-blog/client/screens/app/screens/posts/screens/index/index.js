module.exports = {
  model: function () {
    this.router.transitionTo("posts.show", 1);
  },
  activate: function () {},
  deactivate: function () {}
};