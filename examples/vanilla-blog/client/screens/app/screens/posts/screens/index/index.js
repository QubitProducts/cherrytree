module.exports = {
  model: function (params, context, transition) {
    transition.redirectTo('posts.show', {id: 1})
  },
  activate: function () {},
  deactivate: function () {}
}
