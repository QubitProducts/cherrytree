module.exports = {
  model: function (params, context, transition) {
    this.router.replaceWith('posts.show', {id: 1})
  },
  activate: function () {},
  deactivate: function () {}
}
