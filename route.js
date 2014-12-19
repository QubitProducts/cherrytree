(function (define) { 'use strict';
  define(function (require) {

    var _ = require('./lib/utils/smalldash');
    var inherit = require('./lib/inherit');
    var noop = function () {};

    var Route = function (options) {
      this.name = options.name;
      this.router = options.router;
      this.id = _.uniqueId();
      this._context = {};
      this.initialize();
    };

    _.extend(Route.prototype, {

      /**
       * A hook for your own initialization logic.
       */
      initialize: noop,
      
      /**
        This hook is the first of the route entry validation hooks
        called when an attempt is made to transition into a route
        or one of its children. It is called before `model` and
        `afterModel`, and is appropriate for cases when:

        1) A decision can be made to redirect elsewhere without
           needing to resolve the model first.
        2) Any async operations need to occur first before the
           model is attempted to be resolved.

        This hook is provided the current `transition` attempt
        as a parameter, which can be used to `.abort()` the transition,
        save it for a later `.retry()`, or retrieve values set
        on it from a previous hook. You can also just call
        `this.transitionTo` to another route to implicitly
        abort the `transition`.

        You can return a promise from this hook to pause the
        transition until the promise resolves (or rejects). This could
        be useful, for instance, for retrieving async code from
        the server that is required to enter a route.

        ```js
        var PostRoute = Route.extend({
          beforeModel: function(transition) {
            var post = this.get("posts").first();
            if (!post) {
              this.transitionTo("/somewhere");
            }
          }
        });
        ```

        @method beforeModel
        @param {Transition} transition
        @param {Object} queryParams the active query params for this route
        @return {Promise} if the value returned from this hook is
          a promise, the transition will pause until the transition
          resolves. Otherwise, non-promise return values are not
          utilized in any way.
      */
      beforeModel: noop,

      /**
        A hook you can implement to convert the URL into the context for
        this route.

        ```js
        Router.map(function() {
          this.resource('post', {path: '/posts/:post_id'});
        });
        ```

        This hook follows the asynchronous/promise semantics
        described in the documentation for `beforeModel`. In particular,
        if a promise returned from `model` fails, the error will be
        handled by the `error` hook unless you `catch` the failed promise
        and handle the error locally.

        Example

        ```js
        PostRoute = Route.extend({
          model: function(params) {
            return Post.find(params.post_id).then(function (post) {
              return {
                post: post
              };
            });
          }
        });
        ```

        Notice how we return an object with key `post` - that's because
        we want to name the model. This way the child routes can access this
        model by calling `this.get("post")`.

        @method model
        @param {Object} params the parameters extracted from the URL
        @param {Transition} transition
        @param {Object} queryParams the query params for this route
        @return {Object|Promise} the context for this route. If
          a promise is returned, the transition will pause until
          the promise resolves, and the resolved value of the promise
          will be used as the context for this route.
      */
      model: noop,
      
      /**
        This hook is called after this route's model has resolved.
        It follows identical async/promise semantics to `beforeModel`
        but is provided the route's resolved context in addition to
        the `transition`, and is therefore suited to performing
        logic that can only take place after the model has already
        resolved.

        ```js
        PostsRoute = Route.extend({
          afterModel: function(posts, transition) {
            if (posts.length === 1) {
              this.transitionTo('post.show', posts[0]);
            }
          }
        });
        ```

        Refer to documentation for `beforeModel` for a description
        of transition-pausing semantics when a promise is returned
        from this hook.

        @method afterModel
        @param {Object} resolvedContext the value returned from `model`,
          or its resolved value if it was a promise
        @param {Transition} transition
        @param {Object} queryParams the active query params for this handler
        @return {Promise} if the value returned from this hook is
          a promise, the transition will pause until the transition
          resolves. Otherwise, non-promise return values are not
          utilized in any way.
       */
      afterModel: noop,

      /**
        This hook is executed when the router enters the route or when the context
        of the route changes, unless the context change has been handled in the update
        hook
        @method activate
      */
      activate: noop,

      /**
        This hook is executed when the context of the route changes. Return false
        to indicate that the update of the route has been handled and route shouldn't
        be reactivated. Any other return value will proceed with reactivating
        the route.
        @method update
      */
      update: function () {
        return false;
      },

      /**
        This hook is executed when the router exits this route or when the context changes
        to prepare the route for activating again, unless the context changing has been
        handled in the update hook.

        @method deactivate
      */
      // TODO rename to deactivate
      deactivate: noop,

      /**
        @private
      */
      enter: function () {
        this._setup = 0;
        this.needsReactivation = false;
      },

      /**
        @private
      */
      exit: function () {
        this.deactivate.apply(this, arguments);
      },

      /**
        @private
      */
      setup: function () {
        this._setup += 1;
        var route = this;
        var args = arguments;

        function activate() {
          route.activate.apply(route, args);
        }

        function reactivate() {
          route.exit();
          route.activate.apply(route, args);
        }

        function shouldTryUpdate() {
          return route.parent && !route.parent.needsReactivation;
        }

        // if it's the first time setup is called after
        // the route has been entered - activate
        if (this._setup === 1) {
          return activate();
        }

        // give route.update a chance to deal with the change in context / params
        if (shouldTryUpdate() && this.update && this.update.apply(this, args) !== false) {
          // inform child routes that actually this route didn't need reactivation
          // so they can also use their update methods
          route.needsReactivation = false;
          return;
        }

        // if none of the above - reactivate
        reactivate();
      },

      /**
        @private
      */
      setParent: function (parent) {
        this.parent = parent;
      },

      /**
        Get the context of this route
        Context is typically stateful data, often deserialized from URL, that affects the behaviour
        of the route and child routes.
        @public
      */
      getContext: function () {
        return this._context;
      },

      /**
       * Set the context of this route - overwrites the previous context
       * @param {Object} context
       */
      setContext: function (context) {
        this._context = context;
        return this;
      },

      /**
       * A fancy helper for retrieving a field from route's or it's parent's context.
       * It first tries accessing the context of this route, but if the field is not found there
       * the parent routes are traversed to try and find context containing the required field
       * 
       * @param  {String} field
       * @return {*}
       */
      get: function (field) {
        var context;
        var route = this;
        while (route) {
          context = route.getContext();
          if (context && context[field]) {
            return context[field];
          } else {
            route = route.parent;
          }
        }
      },

      /**
        Transition into another route. Optionally supply params for the
        route in question. If multiple params are supplied they will be applied
        last to first recursively up the resource tree (see Multiple Params Example
        below). See also 'replaceWith'.

        Simple Transition Example

        ```javascript
        Router.map(function() {
          this.route("index");
          this.route("secret");
          this.route("fourOhFour", { path: "*:"});
        });

        var IndexRoute = Route.extend({
          moveToSecret: function(model){
            if (authorized()){
              this.transitionTo('secret', model.id);
            } else {
              this.transitionTo('fourOhFour');
            }
          }
        });
        ```

       Transition to a nested route

       ```javascript
       Router.map(function() {
         this.resource('articles', { path: '/articles' }, function() {
           this.route('new');
         });
       });

       var IndexRoute = Route.extend({
         transitionToNewArticle: function() {
           this.transitionTo('articles.new');
         }
       });
       ```

        Multiple Params Example

        ```javascript
        Router.map(function() {
          this.route("index");
          this.resource('breakfast', {path:':breakfastId'}, function(){
            this.resource('cereal', {path: ':cerealId'});
          });
        });

        var IndexRoute = Route.extend({
          moveToChocolateCereal: function(){
            var cerealId = "CerealAndMilk";
                breakfastId = "ChocolateYumminess";
            this.transitionTo('cereal', breakfastId, cerealId);
            // or calling with one param only will reuse
            // the currently active breakfastId (if any)
            // this.transitionTo('cereal', cerealId);
          }
        });

        @method transitionTo
        @param {String} name the name of the route
        @param {...String|Number} params the param(s) to be used while transitioning
        to the route.
        @return {Transition} the transition object associated with this
          attempted transition
      */
      transitionTo: function () {
        var router = this.router;
        return router.transitionTo.apply(router, arguments);
      },

      /**
        Transition into another route while replacing the current URL, if possible.
        This will replace the current history entry instead of adding a new one.
        Beside that, it is identical to `transitionTo` in all other respects. See
        'transitionTo' for additional information regarding multiple params.

        Example

        ```javascript
        Router.map(function() {
          this.route("index");
          this.route("secret");
        });

        var SecretRoute = Route.extend({
          afterModel: function() {
            if (!authorized()){
              this.replaceWith('index');
            }
          }
        });
        ```

        @method replaceWith
        @param {String} name the name of the route
        @param {...String|Number} params the param(s) to be used while transitioning
        to the route.
        @return {Transition} the transition object associated with this
          attempted transition
      */
      replaceWith: function () {
        var router = this.router;
        return router.replaceWith.apply(router, arguments);
      }
    });

    /**
     * Extend static method enables inheritance for Routes.
     * E.g. var BaseRoute = Route.extend({...});
     */
    Route.extend = inherit;

    /**
     * export
     */
    return Route;

  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });