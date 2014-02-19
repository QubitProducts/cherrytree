(function (define) { 'use strict';
  define(function (require) {

    var uniqueId = require('./lib/util/unique_id');
    var extend = require('./lib/util/extend');
    var extender = require('./lib/extender');
    var noop = function () {};

    var Route = function (options) {
      this.name = options.name;
      this.router = options.router;
      this.id = uniqueId();
      this.initialize();
    };

    extend(Route.prototype, {

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
        App.PostRoute = Ember.Route.extend({
          beforeModel: function(transition) {
            if (!App.Post) {
              return Ember.$.getScript('/models/post.js');
            }
          }
        });
        ```

        If `App.Post` doesn't exist in the above example,
        `beforeModel` will use jQuery's `getScript`, which
        returns a promise that resolves after the server has
        successfully retrieved and executed the code from the
        server. Note that if an error were to occur, it would
        be passed to the `error` hook on `Ember.Route`, but
        it's also possible to handle errors specific to
        `beforeModel` right from within the hook (to distinguish
        from the shared error handling behavior of the `error`
        hook):

        ```js
        App.PostRoute = Ember.Route.extend({
          beforeModel: function(transition) {
            if (!App.Post) {
              var self = this;
              return Ember.$.getScript('post.js').then(null, function(e) {
                self.transitionTo('help');

                // Note that the above transitionTo will implicitly
                // halt the transition. If you were to return
                // nothing from this promise reject handler,
                // according to promise semantics, that would
                // convert the reject into a resolve and the
                // transition would continue. To propagate the
                // error so that it'd be handled by the `error`
                // hook, you would have to either
                return Ember.RSVP.reject(e);
              });
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
        A hook you can implement to convert the URL into the model for
        this route.

        ```js
        App.Router.map(function() {
          this.resource('post', {path: '/posts/:post_id'});
        });
        ```

        The model for the `post` route is `App.Post.find(params.post_id)`.

        By default, if your route has a dynamic segment ending in `_id`:

        * The model class is determined from the segment (`post_id`'s
          class is `App.Post`)
        * The find method is called on the model class with the value of
          the dynamic segment.

        Note that for routes with dynamic segments, this hook is only
        executed when entered via the URL. If the route is entered
        through a transition (e.g. when using the `link-to` Handlebars
        helper), then a model context is already provided and this hook
        is not called. Routes without dynamic segments will always
        execute the model hook.

        This hook follows the asynchronous/promise semantics
        described in the documentation for `beforeModel`. In particular,
        if a promise returned from `model` fails, the error will be
        handled by the `error` hook on `Ember.Route`.

        Example

        ```js
        App.PostRoute = Ember.Route.extend({
          model: function(params) {
            return App.Post.find(params.post_id);
          }
        });
        ```

        @method model
        @param {Object} params the parameters extracted from the URL
        @param {Transition} transition
        @param {Object} queryParams the query params for this route
        @return {Object|Promise} the model for this route. If
          a promise is returned, the transition will pause until
          the promise resolves, and the resolved value of the promise
          will be used as the model for this route.
      */
      model: noop,
      
      /**
        This hook is called after this route's model has resolved.
        It follows identical async/promise semantics to `beforeModel`
        but is provided the route's resolved model in addition to
        the `transition`, and is therefore suited to performing
        logic that can only take place after the model has already
        resolved.

        ```js
        App.PostsRoute = Ember.Route.extend({
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
        @param {Object} resolvedModel the value returned from `model`,
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
        This hook is executed when the router enters the route. It is not executed
        when the model for the route changes.

        @method activate
      */
      activate: noop,

      /**
        This hook is executed when the router completely exits this route. It is
        not executed when the model for the route changes.

        @method deactivate
      */
      // TODO rename to deactivate
      destroy: noop,

      /**
        @private
      */
      enter: function () {
        this._setup = 0;
      },

      /**
        @private
      */
      exit: function () {
        this.destroy.apply(this, arguments);
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

        // if it's the first time setup is called after
        // the route has been entered - activate
        if (this._setup === 1) {
          return activate();
        }

        // give route.update a chance to deal with the change in context / params
        if (this.update && this.update.apply(this, args) === false) {
          return;
        }
        
        // if none of the above - reactivate
        reactivate();
      },

      setParent: function (parent) {
        this.parent = parent;
      },

      /**
        Transition into another route. Optionally supply model(s) for the
        route in question. If multiple models are supplied they will be applied
        last to first recursively up the resource tree (see Multiple Models Example
        below). The model(s) will be serialized into the URL using the appropriate
        route's `serialize` hook. See also 'replaceWith'.

        Simple Transition Example

        ```javascript
        App.Router.map(function() {
          this.route("index");
          this.route("secret");
          this.route("fourOhFour", { path: "*:"});
        });

        App.IndexRoute = Ember.Route.extend({
          actions: {
            moveToSecret: function(context){
              if (authorized()){
                this.transitionTo('secret', context);
              }
                this.transitionTo('fourOhFour');
            }
          }
        });
        ```

       Transition to a nested route

       ```javascript
       App.Router.map(function() {
         this.resource('articles', { path: '/articles' }, function() {
           this.route('new');
         });
       });

       App.IndexRoute = Ember.Route.extend({
         actions: {
           transitionToNewArticle: function() {
             this.transitionTo('articles.new');
           }
         }
       });
       ```

        Multiple Models Example

        ```javascript
        App.Router.map(function() {
          this.route("index");
          this.resource('breakfast', {path:':breakfastId'}, function(){
            this.resource('cereal', {path: ':cerealId'});
          });
        });

        App.IndexRoute = Ember.Route.extend({
          actions: {
            moveToChocolateCereal: function(){
              var cereal = { cerealId: "ChocolateYumminess"},
                  breakfast = {breakfastId: "CerealAndMilk"};

              this.transitionTo('cereal', breakfast, cereal);
            }
          }
        });

        @method transitionTo
        @param {String} name the name of the route
        @param {...Object} models the model(s) to be used while transitioning
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
        'transitionTo' for additional information regarding multiple models.

        Example

        ```javascript
        App.Router.map(function() {
          this.route("index");
          this.route("secret");
        });

        App.SecretRoute = Ember.Route.extend({
          afterModel: function() {
            if (!authorized()){
              this.replaceWith('index');
            }
          }
        });
        ```

        @method replaceWith
        @param {String} name the name of the route
        @param {...Object} models the model(s) to be used while transitioning
        to the route.
        @return {Transition} the transition object associated with this
          attempted transition
      */
      replaceWith: function () {
        var router = this.router;
        return router.replaceWith.apply(router, arguments);
      },

      /**
       * Retrieve an attribute from route's context or any of it's
       * parents contexts.
       * 
       * @param  {String} modelName [description]
       * @return {*}      
       */
      get: function (modelName) {
        var context;
        var route = this;
        while (route) {
          context = route.getContext();
          if (context && context[modelName]) {
            return context[modelName];
          } else if (route[modelName]) {
            // TODO: consider removing this, it should either be
            // context or any attribute of the route. Context is a lot
            // more explicit so probably a better choice.
            return route[modelName];
          } else {
            route = route.parent;
          }
        }
      }
    });

    /**
     * Extend static method enables inheritance for Routes.
     * E.g. var BaseRoute = Route.extend({...});
     */
    Route.extend = extender;

    /**
     * export
     */
    
    return Route;

  });
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });