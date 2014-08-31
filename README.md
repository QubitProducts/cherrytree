# Cherrytree

![build status](https://www.codeship.io/projects/aa5e37b0-aeb1-0131-dd5f-06fd12e6a611/status)

Cherrytree is a framework agnostic hierarchical router. When your application starts, the router is responsible for displaying views, loading data, and otherwise setting up application state. It does so by matching the current URL to the routes that you've defined.

It's heavily inspired by Ember.js router and is built on top of [tildeio/router.js](https://github.com/tildeio/router.js) - a library written by the good folks of Ember. Cherrytree, however, does not depend on Ember or any other framework and so can be used with other libraries such as Backbone, React, Angular.

# Installation

Cherrytree supports both AMD and CJS. It's on `npm` and `bower`.

```sh
npm install --save cherrytree
```

or

```sh
bower install --save cherrytree
```

# Docs

Read [the guide](docs/guide.md) or [the API docs](docs/api.md).

# Examples

* [Hello World standalone](http://requirebin.com/embed?gist=aa3edb9fb05fa01c59f0)
* [Hello World with code](http://requirebin.com/?gist=aa3edb9fb05fa01c59f0)


# Features

* generate links in your application in a simple, systematic way, e.g. `router.generate("commit.index", "1e2760")`
* easily switch between pushState or hashState - all urls in your app are generated the right way depending on which mode you're in
* load parts of the app on demand with custom resolvers
* use routes for creating models, views and managing their lifecycles
* dynamic segments and query params
* transition is a first class citizen - abort, pause, resume, retry failed ones. E.g. pause the transition to display "There are unsaved changes" message if the user clicked some link on the page or used browser's back/forward buttons
* navigate around the app programatically, e.g. `router.transitionTo("commits")`
* rename URL segments (e.g. /account -> /profile) without having to change route names or rewrite links