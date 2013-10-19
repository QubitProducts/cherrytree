define(function (require) {

  // This generates a handler function for each route
  // This is where all the State lifecycle management happens

  // each handler is an everliving object, which can store
  // a reference to a context (in router.js language) or
  // a state (in cherrytree language). The state is where
  // the users of cherrytree libraries do interesting things
  // like fetching data, creating views and nesting them.

  // So a route, has an everliving handler which manages
  // a state that can be instantiated with params, activated,
  // and destroyed when handler becomes inactive

  /**
    TODO
    * look into not having a state thing, but just using
      handlers as they're meant to be used, to avoid memory
      leaks, simply return context from model, if the handler is
      never activated, the context won't be saved, etc.
  */


  var _ = require("underscore");
  var RSVP = require("rsvp");
  var BaseState = require("./state");

  return function getHandlerFunction(router) {
    var seen = {};
    var stateClasses = router.stateClasses;
    var prepares = router.prepares;
    var preparesCalled = {};

    // abandoned states are states that have been initialized
    // so that "model" could be called on them, but that are
    // no longer needed, because the transition has been aborted
    // (either by explicitly aborting it, or by initiating a new
    // transition). Router.js won't call exit on such a state
    // because it hasn't been entered/setup, but we still want
    // to call a destroy on those, and so we'll keep these abandoned
    // states in this array until the end of the loop
    router.abandonedStates = [];

    return function(name) {
      // special loading handler case
      if (name === "loading" && !stateClasses["loading"]) {
        seen[name] = {};
      }

      // look up previously generated handler functions
      if (seen[name]) { return seen[name]; }

      var lastParams, lastQueryParams, state, oldState;

      function destroyState(state) {
        // console.log("cherry:", state.name, ":", "destroying", (state || {}).id);
        state.destroy();
        state._destroyed = true;

        // check if we're in the right closure
        // TODO: the closure stuff seems quite tricky here
        // not clear what's happening in different situations, perhaps it's better
        // to store all these infos on an object instead of in a closure
        if (state.name === name) {
          state = null;
          lastParams = null;
          lastQueryParams = null;
        }
      }

      var handler = {

        serialize: function (params) {
          if (params === state) {
            return lastParams || {};
          } else {
            // normally we're not passing models to
            // generate/transitionTo/replaceWith, etc.
            // we simply pass in an object with params,
            // therefore in those cases we just want to
            // return whatever we passed in
            // TODO routing: perhaps this should be deprecated
            // perhaps we should only allow using the new syntax
            // this.transitionTo("foo.bar", 32, "b");
            // instead of
            // this.transitionTo("foo.bar", {
            //   param1: 32,
            //   param2: "b"
            // })
            return params;
          }
        },
        beforeModel: function (queryParams, transition) {
          if (transition === undefined) {
            transition = queryParams;
            queryParams = false;
          }

          // keep clearing the providedModels object,
          // we currently aren't using this functionality where
          // an instance of the model can passed in transitionTo calls, etc.
          // therefore we never want router.js to think that some models
          // are provided, we always wanna be calling the model method in
          // this handler, that's where we decide ourselves if the state
          // should be reinstantiated or not, etc.
          // We could probably still pass in real instances via transitionTo
          // and handle that in the model function - params would contain
          // those instances that we could possible pass on to the states to consume
          // etc.
          transition.providedModels = {};
          transition.providedModelsArray = [Math.random()];

          // clean up in case we didn't have a chance to cleanup before
          // that happens when we transition while transitioning, which means
          // we abandon some states and even though we've destroyed them, we
          // were in the wrong closure to clean up the closure variables...
          if (state && state._destroyed) {
            state = null;
            lastParams = null;
            lastQueryParams = null;
          }
        },
        model: function (params, queryParams, transition) {
          // console.log("cherry:", name, ":", "model", (state || {}).id);

          if (transition === undefined) {
            transition = queryParams;
            queryParams = false;
          }

          // normalize params
          if (_.isEmpty(params)) {
            params = false;
          }
          if (_.isEmpty(queryParams)) {
            queryParams = false;
          }

          // if params didn't change - we keep this state
          if (_.isEqual(lastParams, params) && _.isEqual(lastQueryParams, queryParams)) {
            return state;
          }

          // keep a record of the new params
          lastParams = _.clone(params);
          lastQueryParams = _.clone(queryParams);

          // if the params changed - call an optional update
          // method on the state - return value false,
          // prevents the desctruction of the state and proceeds
          // with the transition. Otherwise we will destroy this
          // state and recreate it
          if ((params || queryParams) && state && state.update) {
            if (state.update(params, queryParams) === false) {
              return state;
            }
          }


          function createState(State) {
            // console.log("cherry:", name, ":", "createState", (state || {}).id, "with params", params);
            if (state) {
              if (!state._setup) {
                destroyState(state);
              } else {
                oldState = state;
              }
            }

            state = new State(name, _.extend(params || {}, {
              router: router,
              queryParams: queryParams || {}
            }));

            // need to set parent here..?
            if (transition) {
              transition.then(function () {
                // TODO what should we do with the abandoned states?
                _.each(router.abandonedStates, function (state) {
                  if (!state._setup) {
                    destroyState(state);
                  }
                });
                router.abandonedStates = [];
              }, function () {
                // in case the transition was aborted, we might need to
                // destroy this state, after the transition has settled in
                // currently there is no way to call into
                if (!state._setup && transition.isAborted) {
                  router.abandonedStates.push(state);
                }
              });
              var parentState = transition.data.parentState;
              if (!parentState) {
                // var parentName = name.split(".");
                // parentName.pop();
                // parentName = parentName.join(".");
                // if (!parentName) {
                //   parentName = "application";
                // }
                // parentState = transition.resolvedModels[parentName];
                // var resolvedModels = _.values(transition.resolvedModels);
                var leafState = _.find(transition.resolvedModels, function (leafState) {
                  // it's a leafState only if every other state is not pointing to it
                  return _.every(transition.resolvedModels, function (state) {
                    return state.parent !== leafState;
                  });
                });
                parentState = leafState;
              }
              state.setParent(parentState);
              transition.data.parentState = state;

            }
            var modelPromise = state.model();

            var whenModelResolved = function () {
              if (state.shouldActivate) {
                // destroy everything in the currentHandlerInfos down to the
                // match point. then we can
                // TODO: what if the transition is later aborted, I guess
                // we're fucked? but aborting would usually mean a failur
                // which you want to handle, not just stop transitioning...
                // aborting otherwise should be done before the deserialzie
                // is even called
                state.activate();
                state._activated = true;
              }
              return state;
            };
            if (modelPromise && modelPromise.then) {
              return RSVP.resolve(modelPromise).then(whenModelResolved);
            } else {
              whenModelResolved();
              return state;
            }
          }


          var State;
          // if we don't have a prepare method for this state
          // or if it's already been called - proceed with creating
          // the state
          if (!prepares[name] || preparesCalled[name]) {
            State = stateClasses[name] || router.BaseState || BaseState;
            if (State) {
              return createState(State);
            }
          } else {
            var promise = new RSVP.Promise(function(resolve, reject){
              // TODO routing: once a prepare has been called, we should remember
              // that and not call it again in the future
              prepares[name](router, function () {
                // record that this prepare has been called - we only
                // do this per the lifetime of the application as it's
                // mostly intended for loading extra code
                preparesCalled[name] = true;

                // now that we gave the prepare method a chance to preload the states
                State = stateClasses[name];
                if (State) {
                  resolve(createState(State));
                } else {
                  reject(new Error("called the prepare, but that didn't provide the state for route", name));
                }
              });
            });
            return promise;
          }
        },

        afterModel: function (state, queryParams, transition) {
          // console.log("cherry:", name, ":", "afterModel", (state || {}).id);

          if (transition === undefined) {
            transition = queryParams;
            queryParams = false;
          }

          if (state) {
            // update the transition's parentState
            // transition.data.parentState = state;
            if (state.afterModel) {
              state.afterModel(transition);
            }
          }
        },
        setup: function () {
          // console.log("cherry:", name, ":", "setup", (state || {}).id);

          if (state) {
            // used when determining abandoned states
            state._setup = true;
            if (!state._activated) {
              state.activate();
              state._activated = true;
            }
          }

          // if we were using the same handler for this
          // state, it won't be exited, it will just be setup
          // again, therefore we'll use this chance to
          // check if we do indeed have an old instance of this
          // same handler-state pair and destroy it
          if (oldState && !oldState._destroyed) {
            destroyState(oldState);
            oldState = null;
          }
        },
        exit: function () {
          // console.log("cherry:", name, ":", "exit", (state || {}).id);
          if (state) {
            destroyState(state);
          }
        },
        events: {
          willTransition: function (transition) {
            // TODO if transition is aborted - should we
            // still be popping the handler?
            if (state && state.willTransition) {
              return state.willTransition(transition);
            } else {
              return true;
            }
          },
          error: function (err, transition) {
            if (state && state.error) {
              // console.error("ERROR IN STATE", name, e);
              return state.error(err, transition);
            } else {
              return true;
            }
          }
        }
      };

      seen[name] = handler;

      return handler;
    };
  };
});