## Basic Example

Check out this example in action at [http://requirebin.com/embed?gist=aa3edb9fb05fa01c59f0](http://requirebin.com/embed?gist=aa3edb9fb05fa01c59f0) or edit it at [http://requirebin.com/?gist=aa3edb9fb05fa01c59f0](http://requirebin.com/?gist=aa3edb9fb05fa01c59f0).

```js
var Router = require("cherrytree");
var Route = require("cherrytree/route");

// some things we'll use to render the views
var $ = require("jquery");
var insert = require("insert-stylesheet");
var insertCss = require("insert-css");
var lorem = require("lorem-ipsum");

// style this a little bit
insert("http://yui.yahooapis.com/pure/0.5.0/pure-min.css");
insertCss([
  "h1 {padding: 10px; border-bottom: 1px solid #eee;}",
  ".post {padding: 10px; border: 1px solid #eee;}"
].join(""));

// create some fake data
var posts = [{
  id: 1,
  title: "Post 1",
  content: lorem()
}, {
  id: 2,
  title: "Post 2",
  content: lorem()
}];

// create a very simple model class, you can fetch data any way you
// want, cherrytree doesn't prescribe that
var Post = function (attr) {
  this.attr = attr;
};
Post.prototype.fetch = function () {
  this.attr = posts[this.attr.id - 1];
  return this;
};

// create the router
var router = new Router();

// create the route map
router.map(function () {
  this.resource("post", {path: "/post/:postId"}, function () {
    this.route("show", {path: "/"});
    this.route("edit");
  });
});

// register route handlers
// the application route is the top level route,
// let's render the layout of the app in here
router.handlers["application"] = Route.extend({
  activate: function () {
    var template = [
      "<div>",
        "<h1>My Blog</h1>",
        "<ul class='pure-menu pure-menu-open pure-menu-horizontal'>",
          "<li><a href='" + this.postLink(1) + "'>Post 1</a></li>",
          "<li><a href='" + this.postLink(2) + "'>Post 2</a></li>",
        "</ul>",
        "<div class='outlet'></div>",
      "</div>"
    ].join("");
    this.view = $(template);
    $(document.body).html(this.view);
  },
  postLink: function (id) {
    return this.router.generate("post.show", id);
  }
});

// another default route that's always available
// let's redirect to the first post in here
router.handlers["index"] = Route.extend({
  beforeModel: function () {
    this.router.transitionTo('post.show', 1);
  }
});

// in the post resource we'll fetch the post model
// so that child routes can use it
router.handlers["post"] = Route.extend({
  model: function (params) {
    var post = new Post({
      id: params.postId
    });
    return {
      post: post.fetch()
    }
  },
  activate: function () {
    this.outlet = this.parent.view.find(".outlet");
  }
});

// route for displaying the post
router.handlers["post.show"] = Route.extend({
  activate: function () {
    var editLink = this.router.generate("post.edit");
    var template = [
      "<div class='post'>",
        "<h3>" + this.get("post").attr.title + "</h3>",
        "<a href='" + editLink + "'>Edit</a>",
        "<p>" + this.get("post").attr.content + "</p>",
      "</div>"
    ].join("");
    this.view = $(template);
    this.parent.outlet.html(this.view);
  },
  deactivate: function () {
    this.view.remove();
  }
});

// and one for editing the post
router.handlers["post.edit"] = Route.extend({
  activate: function () {
    this.parent.outlet.html("Editing post " + this.get("post").attr.id);
  }
});

// let's do this!
router.startRouting();
```
