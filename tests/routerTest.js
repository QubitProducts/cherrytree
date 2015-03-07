let _ = require('lodash')
let {assert} = require('referee')
let {suite, test, beforeEach, afterEach} = window
let cherrytree = require('..')

suite('Cherrytree')

let router

let routes = function () {
  this.route('application', function () {
    this.route('home', {path: ''})
    this.route('notifications')
    this.route('messages')
    this.route('status', {path: ':user/status/:id'})
  })
}

beforeEach(() => {
  router = cherrytree()
})

afterEach(() => {
  router.destroy()
})

// @api public

test('#use registers middleware', () => {
  assert.expect(3)
  let m = function () {}
  router.use(m)
  assert(router.middleware.length === 1)
  assert(router.middleware[0] === m)
})

test('#map registers the routes', () => {
  assert.expect(3)
  router.map(routes)
  // check that the internal matchers object is created
  assert.equals(_.pluck(router.matchers, 'path'), [
    '/application',
    '/application/notifications',
    '/application/messages',
    '/application/:user/status/:id'
  ])
  // check that the internal routes object is created
  assert.equals(router.routes[0].name, 'application')
  assert.equals(router.routes[0].routes[3].options.path, ':user/status/:id')
})

test('#generate generates urls given route name and params', () => {
  assert.expect(1)
  router.map(routes)
  router.listen()
  var url = router.generate('status', {user: 'foo', id: 1})
  assert.equals(url, '#application/foo/status/1')
})

test('#generate throws a useful error when listen has not been called', () => {
  assert.expect(1)
  router.map(routes)
  try {
    router.generate('messages')
  } catch (err) {
    assert.equals(err.message, 'Invariant Violation: call .listen() before using .generate()')
  }
})

// @api private

test('#match matches a path against the routes', () => {
  assert.expect(2)
  router.map(routes)
  let match = router.match('/application/KidkArolis/status/42')
  assert.equals(match.params, {
    user: 'KidkArolis',
    id: '42',
    queryParams: {}
  })
  assert.equals(_.pluck(match.routes, 'name'), ['application', 'status'])
})

// describe("cherrytree router", function () {

//   beforeEach(function (done) {
//     window.location.hash = "/";
//     app = new TestApp();
//     router = app.router;
//     app.start().then(done, done);
//   });

//   afterEach(function () {
//     app.destroy();
//   });

//   it("should transition when location.hash is changed", function (done) {
//     window.location.hash = "#about";
//     router.options.onURLChanged = function (url) {
//       url.should.equal("/about");
//       $(".application .outlet").html().should.equal("This is about page");
//       done();
//     };
//   });

//   describe("query params", function () {
//     it("should update routes in a similar fashion to regular params", function (done) {
//       router.transitionTo("about").then(function () {
//         // we can also transition via URL
//         return router.transitionTo("/faq?sortBy=date");
//       }).then(function () {
//         $(".application .outlet").html().should.equal("FAQ. Sorted By: date");
//         // we can change the param now
//         return router.transitionTo("faq", {queryParams: { sortBy: "user" }});
//       }).then(function () {
//         $(".application .outlet").html().should.equal("FAQ. Sorted By: user");
//       }).then(done, done);
//     });
//   });

//   it.skip("should log info if logging is turned on", function () {});

//   it("can be used to render a webapp", function (done) {
//     $(".application .outlet").html().should.equal("Welcome to this application");
//     // we can transition into different parts of the app
//     // using the transitionTo method
//     router.transitionTo("about").then(function () {
//       $(".application .outlet").html().should.equal("This is about page");
//     }).then(function () {
//       // we can also transition via URL
//       return router.transitionTo("/faq?sortBy=date");
//     }).then(function () {
//       $(".application .outlet").html().should.equal("FAQ. Sorted By: date");
//       // we can change the param now
//       return router.transitionTo("faq", {queryParams: { sortBy: "user" }});
//     }).then(function () {
//       $(".application .outlet").html().should.equal("FAQ. Sorted By: user");
//     }).then(function () {
//       // we can also change the url directly to cause another transition to happen
//       return new Promise(function (resolve) {
//         router.options.onURLChanged = function (url) {
//           url.should.equal("/posts/filter/mine");
//           resolve();
//         };
//         window.location.hash = "#posts/filter/mine";
//       });
//     }).then(function () {
//       $(".application .outlet").html().should.equal("My posts...");
//     }).then(function () {
//       // let's try a different filter
//       return new Promise(function (resolve) {
//         router.options.onURLChanged = function (url) {
//           url.should.equal("/posts/filter/foo");
//           resolve();
//         };
//         window.location.hash = "#posts/filter/foo";
//       });
//     }).then(function () {
//       $(".application .outlet").html().should.equal("Filter not found");
//     }).then(function () {
//       // we can abort transitions
//       router.location.getURL().should.be.equal("/posts/filter/foo");
//       var transition = router.transitionTo("about");
//       transition.abort();
//       router.location.getURL().should.be.equal("/posts/filter/foo");
//     }).then(done, done);
//   });
// });
