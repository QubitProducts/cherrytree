# Cherrytree guide

When your application starts, the router is responsible for displaying views, loading data, and otherwise setting up application state. It does so by matching the current URL to the _routes_ that you've defined.

First you'll need to create an instance of the router.

```js
var Router = require("cherrytree");
var router = new Router({
  pushState: true
});
```

The `map` method of the router can be invoked to define URL mappings. When calling `map`, you should pass a function that will be invoked with the value
`this` set to an object which you can use to create and resources.

```js
router.map(function() {
  this.route("about", { path: "/about" });
  this.route("favorites", { path: "/favs" });
});
```

Now, when the user visits `/about`, Cherrytree will activate the `about`
route. Visiting `/favs` will activate the `favorites` route.

<aside>
**Heads up!** You get a few routes for free: the `application` and the `index` (corresponding to the `/` path). [See below](#initial-routes) for more details.
</aside>

Note that you can leave off the path if it is the same as the route name. In this case, the following is equivalent to the above example:

```js
router.map(function() {
  this.route("about");
  this.route("favorites", { path: "/favs" });
});
```

To generate links to the different routes you can use the `generate` method using the name that you provided to the `route` method (or, in the case of `/`, the name `index`).

```js
router.generate("favorites");
// => /favs
router.generate("index");
// => /
```

If you configure the HistoryLocation to use hashchange event (by setting `pushState: false`), the generated links will start with `#`.

You can customize the behavior of a route by creating a `Route`
subclass. For example, to customize what happens when your user visits
`/`, assign a Route subclass to `router.routes["index"]`:

```js
var Route = require("cherrytree/route");

router.routes["index"] = Route.extend({
  activate: function(controller) {
    document.body.innerHTML = "My App";
  }
});
```

<aside>
Routes subclasses can be retrieved from a different locations by passing Cherrytree a custom resolver. For example, you could use a resolver that dynamically loads the code for a given route based on the route name. [See below](#custom-resolvers) for more details.
</aside>

### Resources

You can define groups of routes that work with a resource:

```js
router.map(function() {
  this.resource('posts', { path: '/posts' }, function() {
    this.route('new');
  });
});
```

As with `this.route`, you can leave off the path if it's the same as the
name of the route, so the following router is equivalent:

```js
router.map(function() {
  this.resource('posts', function() {
    this.route('new');
  });
});
```

This router creates three routes:

<table>
  <thead>
  <tr>
    <th>URL</th>
    <th>Route Name</th>
  </tr>
  </thead>
  <tr>
    <td><code>/</code></td>
    <td><code>index</code></td>
  </tr>
  <tr>
    <td>N/A</td>
    <td><code>posts</code><sup>1</sup></td>
  </tr>
  <tr>
    <td><code>/posts</code></td>
    <td><code>posts.index</code></code></td>
  </tr>
  <tr>
    <td><code>/posts/new</code></td>
    <td><code>posts.new</code></td>
  </tr>
</table>

<small><sup>1</sup> Transitioning to `posts` or creating a link to `posts` is equivalent to transitioning to `posts.index` or linking to `posts.index`</small>

NOTE: If you define a resource using `this.resource` and **do not** supply a function, then the implicit `resource.index` route is **not** created.

Routes nested under a resource take the name of the resource plus their name as their route name. If you want to transition to a route (e.g. via `transitionTo`), make sure to use the full route name (`posts.new`, not `new`).

Visiting `/` activates the `index` route, as you would expect.

Visiting `/posts` is slightly different. It will first activate the `posts` route. Then, it will activate the `posts.index` route. In other words, multiple routes will be active at the same time. (You can see the list of currently active routes using `router.activeRoutes()` or `router.activeRouteNames`).

Finally, visiting `/posts/new` will first activate the `posts` route, then activate the `posts.new` route.

NOTE: Ember advises using `this.resource` for URLs that represent a **noun**,
and `this.route` for URLs that represent **adjectives** or **verbs**
modifying those nouns. For example, in the code sample above, when
specifying URLs for posts (a noun), the route was defined with
`this.resource('posts')`. However, when defining the `new` action
(a verb), the route was defined with `this.route('new')`. However, I've found various different use cases for when to use `this.resource` or `this.route`, so feel free to do whatever is appropriate for your application.

### Dynamic Segments

One of the responsibilities of a route handler is to convert a URL into data or a model.

For example, if we have the resource `this.resource('posts');`, our
route handler might look like this:

```js
router.routes.posts = Route.extend({
  model: function() {
    this.setContext({posts: new PostsCollection()});
    return this.get("posts").fetch();
  }
});
```

Adding the posts collection to the context of the route makes the posts collection available to all nested routes and resources (via `this.get` method).

<aside>
Returning a promise in the model hooks, puts the router into a loading state (giving you a change to show a loading animation) and only continues activating child routes once the returned promise is resolved. In other words Cherrytree treats asynchronous transitions like a first class citizen, such transitions can be paused or aborted. If the user clicks three links on the page in rapid succession, the router won't go into an inconsistent state, but instead will make sure all the routes are deactivated and reactivated in the right order to transition to the required route.
</aside>

Because `/posts` represents a fixed model, we don't need any additional information to know what to retrieve.  However, if we want a route to represent a single post, we would not want to have to hardcode every possible post into the router.

Enter _dynamic segments_.

A dynamic segment is a portion of a URL that starts with a `:` and is followed by an identifier.

```js
router.map(function() {
  this.resource('posts');
  this.resource('post', { path: '/post/:postId' });
});

router.routes.post = Route.extend({
  model: function(params) {
    var post = new Post({id: params.postId});
    this.setContext({post: post)});
    return post.fetch();
  }
});
```

### Nested Resources

You cannot nest routes, but you can nest resources:

```js
router.map(function() {
  this.resource('post', { path: '/post/:postId' }, function() {
    this.route('edit');
    this.resource('comments', function() {
      this.route('new');
    });
  });
});
```

This router creates five routes:

<div style="overflow: auto">
  <table>
    <thead>
    <tr>
      <th>URL</th>
      <th>Route Name</th>
    </tr>
    </thead>
    <tr>
      <td><code>/</code></td>
      <td><code>index</code></td>
    </tr>
    <tr>
      <td>N/A</td>
      <td><code>post</code></td>
    </tr>
    <tr>
      <td><code>/post/:postId<sup>2</sup></code></td>
      <td><code>post.index</code></td>
    </tr>
    <tr>
      <td><code>/post/:postId/edit</code></td>
      <td><code>post.edit</code></td>
    </tr>
    <tr>
      <td>N/A</td>
      <td><code>comments</code></td>
    </tr>
    <tr>
      <td><code>/post/:postId/comments</code></td>
      <td><code>comments.index</code></td>
    </tr>
    <tr>
      <td><code>/post/:postId/comments/new</code></td>
      <td><code>comments.new</code></td>
    </tr>
  </table>
</div>


<small><sup>2</sup> `:postId` is the post's id.  For a post with id = 1, the route will be:
`/post/1`</small>

The `comments` route will be activated after the `post` route is activated. This way the `comments` route can render views inside of the views rendered in the `post` route. All routes under `comments` (`comments/index` and `comments/new`) are activated after the `post` and `comments` routes have been activated.

You are also able to create prefixed resources in order to preserve the namespace on your routes:

```js
router.map(function() {
  this.resource('foo', function() {
    this.resource('foo.bar', { path: '/bar' }, function() {
      this.route('baz'); // This will be foo.bar.baz
    });
  });
});
```

This router creates the following routes:

<div style="overflow: auto">
  <table>
    <thead>
    <tr>
      <th>URL</th>
      <th>Route Name</th>
    </tr>
    </thead>
    <tr>
      <td><code>/</code></td>
      <td><code>index</code></td>
    </tr>
    <tr>
      <td><code>/foo</code></td>
      <td><code>foo.index</code></td>
    </tr>
    <tr>
      <td><code>/foo/bar</code></td>
      <td><code>foo.bar.index</code></td>
    </tr>
    <tr>
      <td><code>/foo/bar/baz</code></td>
      <td><code>foo.bar.baz</code></td>
    </tr>
  </table>
</div>


### Initial routes

A few routes are immediately available within your application:

  - `application` is activated when your app first boots up. It's a good place to initialize application wide state, setup global error handling, global loading animations, render the layout of the application, etc.

  - `index` is the default route, and will activate when the user visits `/` (unless `/` has been overridden by your own custom route).

Remember, these routes are part of every application, so you don't need to
specify them in `router.map`.

### Wildcard / globbing routes

You can define wildcard routes that will match mutliple routes. This could be used, for example, if you'd like a catchall route which is useful when the user enters an incorrect URL not managed by your app.

```js
router.map(function() {
  this.route('catchall', {path: '/*wildcard'});
});
```

Like all routes with a dynamic segment, you must provide a context when using a `generate` or `transitionTo` to programatically enter this route.

```js
router.routes.application = Route.extend({
  error: function () {
    this.transitionTo("catchall", "application-error");
  }
});
```

With this code, if an error bubbles up to the Application route, your application will enter the `catchall` route and display `/application-error` in the URL.

## Custom resolvers

By default, cherrytree always look at the `router.routes` hash to find all the route classes. However, you can override the resolver to load routes from anywhere else. That is especially useful if you want to be loading your routes asynchronously. It's possible to override the global resolver or specify a per route/resource resolver in the route map. For example, if we wanted to load each route asynchronously using AMD style require, we could do this:

```js
var router = new Router({
  resolver: function (name, cb) {
    require(["app/routes/" + name + ".route.js"], function (Route) {
      cb(Route);
    });
  },
  map: function () {
    this.resource("branches", function () {
      this.route("stale");
      this.route("merged");
    });
  }
});
```

If the route hasn't been loaded before and the router needs to activate it - it will be loaded asynchronously. For exaple, `router.transitionTo('branches.merged')` would load `app/routes/application.route.js`, `app/routes/branches.route.js` and `app/routes/branches.merged.route.js`, but would not load the `app/routes/branches.stale.route.js`. This can facilitate splitting your application into multiple bundles.

# URLs!

Cherrytree helps with making URLs useful and shareable. Check out this [talk by Tom Dale about the importance of URLs in webapps](https://www.youtube.com/watch?v=OSEXpsVcTxI).

# Acknowledgement

This guide is adapted from the official Ember guide (I told you Cherrytree is _heavily_ inspired by Ember). Be careful as the API of Ember Router will differ subtly, but a lot of higher level concepts are similar, so be sure to check out their guide for more advanced topics http://emberjs.com/guides/routing/ until I "adapt" more of their docs.