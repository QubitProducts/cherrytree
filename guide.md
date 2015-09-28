# Cherrytree guide

When your application starts, the router is responsible for loading data, rendering views and otherwise setting up application state. It does so by translating every URL change to a transition object and a list of matching routes. You then need to apply a middleware function to translate the transition data into the desired state of your application.

First create an instance of the router.

```js
var cherrytree = require("cherrytree");
var router = cherrytree({
  pushState: true
});
```

Then use the `map` method to define the route map.

```js
router.map(function(route) {
  route('application', { path: '/', handler: App }, function () {
    route('about', { handler: About })
    route('favorites', { path: 'favs', handler: Favorites })
    route('message', { path: 'message/:id', handler: Message })
  })
});
```

Next, define some middleware.

```js
router.use(function activate (transition) {
  transition.routes.forEach(function (route) {
    route.options.handler.activate(transition.params, transition.query)
  })
})
```

Now, when the user enters `/about` page, Cherrytree will call the middleware with the transition object and `transition.routes` will be the route descriptors of `application` and `about` routes.

Note that you can leave off the path if you want to use the route name as the path. For example, these are equivalent

```js
router.map(function(route) {
  route('about');
});

// or

router.map(function(route) {
  route('about', {path: 'about'});
});
```

To generate links to the different routes use `generate` and pass the name of the route:

```js
router.generate('favorites')
// => /favs
router.generate('application');
// => /
router.generate('messages', {id: 24});
```

You may opt out of a route being generated for a parent by setting `routeable: true` in the options.

If you configure the HistoryLocation to use hashchange event (by setting `pushState: false`), the generated links will start with `#`.

### Route params

Routes can have dynamic urls by specifying that in the `path` configuration. For example

```js
router.map(function(route) {
  route('posts');
  route('post', { path: '/post/:postId' });
});

router.use(function (transition) {
  console.log(transition.params)
  // => {postId: 5}
});

router.transitionTo('/post/5')
```

See what other types of dynamic routes is supported in the [api docs](api.md#intercepting-links).

### Route Nesting

Route nesting is one of the core features of cherrytree. It's useful to nest routes, because you can configure each route to do a different part of the work - e.g. the root `application` route can do some initial data loading/initialization, but you can avoid redoing that work on subsequent transitions by checking if the route is already active. The child route can then load data specific for that page. Nesting routes is also very useful for rendering nested UIs, e.g. if you're building an email application, you might have the following route map

```js
router.map(function(route) {
  route('gmail', {path: '/'}, function () {
    route('inbox', function() {
      route('mail', {path: 'm/:mailId'}, function () {
        route('mail.raw')
      })
    })
  })
})
```

This router creates the following routes:

<div style="overflow: auto">
  <table>
    <thead>
    <tr>
      <th>URL</th>
      <th>Route Name</th>
      <th>Reason</th>
    </tr>
    </thead>
    <tr>
      <td><code>/</code></td>
      <td><code>gmail</code></td>
      <td>Redirect to inbox</td>
    </tr>
    <tr>
      <td>N/A</td>
      <td><code>inbox</code></td>
      <td>Load 1 page of emails and render it</td>
    </tr>
    <tr>
      <td>N/A</td>
      <td><code>mail</code></td>
      <td>Load the email contents of email with id `transition.params.mailId` and expand it in the list of emails while keeping the email list rendered</td>
    </tr>
    <tr>
      <td><code>/inbox/m/:mailId/raw</code></td>
      <td><code>mail.raw</code></td>
      <td>Render the raw textual version of the email in the expanded pane</td>
    </tr>
  </table>
</div>

## Examples

I hope you found this brief guide useful, check out some example apps next in the [examples](examples) dir.
