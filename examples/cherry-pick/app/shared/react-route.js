import R from 'ramda'
import React from 'react'
import Route from 'cherrytree/route'

module.exports = Route.extend({

  rootEl: document.body,

  initialize: function () {
    if (this.componentClass) {
      this.componentFactory = React.createFactory(this.componentClass)
    }
  },

  activate: function (context) {
    this.render(context)
    this.afterActivate()
  },

  afterActivate: function () {},

  deactivate: function () {
    React.unmountComponentAtNode(this.targetEl())
  },

  createComponent: function (context) {
    if (this.componentFactory) {
      var props = R.mixin(context || {}, {
        router: this.router
      })
      return this.componentFactory(props, this.children)
    }
  },

  targetEl: function () {
    return this.parent ? this.parent.outletEl : this.rootEl
  },

  render: function (context) {
    this.component = this.createComponent(context)

    var targetEl = this.targetEl()
    if (this.component) {
      var c = React.render(this.component, targetEl)
      this.outletEl = c.getDOMNode().querySelectorAll('.outlet')[0]
    } else {
      this.outletEl = targetEl
    }
  },

  rerenderParents: function () {
    if (this.parent && this.parent.render) {
      var component = this.component || this.children
      this.parent.children = component
      this.parent.render(this.parent.getContext())
    }
  }
})
