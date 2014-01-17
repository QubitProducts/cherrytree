define(function (require) {

  var _ = require("underscore");
  var RSVP = require("rsvp");
  var BaseRoute = require("./route");

  return function createRoute(router) {
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

    return function (name) {
      // special loading handler case
      if (name === "loading" && !stateClasses["loading"]) {
        seen[name] = {};
      }

      // look up previously generated handler functions
      if (seen[name]) { return seen[name]; }

      var state;

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
        }
      }

      var handler = {
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

          this.params = _.clone(params);

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
            State = stateClasses[name] || router.BaseRoute || BaseRoute;
            if (State) {
              return createState(State);
            }
          } else {
            var promise = new RSVP.Promise(function (resolve) {
              // TODO routing: once a prepare has been called, we should remember
              // that and not call it again in the future
              prepares[name](router, function () {
                // record that this prepare has been called - we only
                // do this per the lifetime of the application as it's
                // mostly intended for loading extra code
                preparesCalled[name] = true;

                // now that we gave the prepare method a chance to preload the states
                State = stateClasses[name] || router.BaseRoute || BaseRoute;
                resolve(createState(State));
              });
            });
            return promise;
          }
        }
      };

      seen[name] = handler;

      return handler;
    };
  };
});