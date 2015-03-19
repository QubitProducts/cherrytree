# Cherrytree

![build status](https://www.codeship.io/projects/aa5e37b0-aeb1-0131-dd5f-06fd12e6a611/status)

Cherrytree is a flexible hierarchical router. Use middleware functions to configure your router to render views, fetch parts of the application, load data, etc.

# Installation

You can get cherrytree from npm - it supports both AMD and CJS.

```sh
npm install --save cherrytree
```

# Usage

```js
var cherrytree = require('cherrytree')

var router = cherrytree();

router.map(function (route) {
  route('application', {path: '/'}, function () {
    route('messages')
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user'}, function () {
      route('profile.index')
      route('profile.lists')
      route('profile.edit')
    })
  })
})

router.use(function (transition) {
  transition.routes.forEach(function (route, i) {
    var View = require('./views/' + route.name)
    route.view = new View({
      params: transition.params,
      query: transition.query
    })
    var parent = transition.routes[i-1]
    var $outlet = parent ? parent.view.$el.find('.outlet') : $(document.body)
    $outlet.html(view.render().el)
  })
})

router.use(function (transition) {
  transition.catch(function (err) {
    dispatchError(err.message)
  })
})

router.listen()

```

# Docs

Read [the guide](docs/guide.md) or [the API docs](docs/api.md).

# Examples

* [Hello World standalone](http://requirebin.com/embed?gist=543a9f1a36382683f422) - you can see the URL change
* [Hello World with code](http://requirebin.com/?gist=543a9f1a36382683f422)


# Features

* generate links in your application in a simple, systematic way, e.g. `router.generate("commit.index", {sha: "1e2760"})`
* easily switch between pushState or hashState - all urls in your app are generated the right way depending on which mode you're in
* load parts of the app on demand by utilising the middleware
* manage the lifecycle of all your routes
* dynamic segments, optional params and query params
* transition is a first class citizen - abort, pause, resume, retry failed ones. E.g. pause the transition to display "There are unsaved changes" message if the user clicked some link on the page or used browser's back/forward buttons
* navigate around the app programatically, e.g. `router.transitionTo("commits")`
* rename URL segments (e.g. /account -> /profile) without having to change route names or rewrite links
* link clicks on the page are intercepted automatically when using pushState
