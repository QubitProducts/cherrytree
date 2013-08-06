define(function (require) {

  // This generated a handler function for each route
  // This is where all the State management happens

  /**

    TODO

    * error handling and bubbling
    * events, send? bubbling, states, hmz..
    * look into not having a state thing, but just using
      handlers as they're meant to be used, to avoid memory
      leaks, simply return context from prepare, if the handler is
      never activated, the context won't be saved, etc.

  */


  var _ = require("underscore");
  var RSVP = require("rsvp");

  return function getHandlerFunction(router) {
    var seen = {};
    var states = router.states;

    var currentHandlers = [];
    var abandonedStates = [];

    return function(name) {
      var handler;
      
      // if (name === 'application') {
      //   // Inject default `routeTo` handler.
      //   handler.events = handler.events || {};
      //   handler.events.routeTo = handler.events.routeTo || Ember.TransitionEvent.defaultHandler;
      // }

      if (seen[name]) { return seen[name]; }

      // if (_.isObject(states[name])) {
      //   handler = states[name];
      //   handler.routeName = name;
      //   seen[name] = handler;
      //   return handler;
      // }

      if (name === "loading" && !states["loading"]) {
        handler = {};
        seen[name] = handler;
        return handler;
      }

      var lastParams, state;

      handler = {
        serialize: function (params) {
          return params;
        },
        model: function (params, transition) {
          _.each(params, function (val, key) {
            params[key] = _.isNumber(val) ? val + "" : val;
          });
          // reset
          if (name === "application") {
            currentHandlers = [handler];
          } else if (name !== "loading") {
            currentHandlers.push(handler);
          }

          if (_.isEmpty(params)) {
            params = false;
          }

          if (_.isEqual(lastParams, params)) {
            return state;
          }

          if (params && state && state.softParams) {
            var hardLastParams = _.omit(lastParams, state.softParams);
            var hardParams = _.omit(params, state.softParams);
            if (_.isEqual(hardLastParams, hardParams)) {
              state.update(params);
              return state;
            }
          }

          lastParams = _.clone(params);

          // if (state) {
          //   state.destroy();
          //   state = null;
          // }
          var State = states[name];

          if (State) {

            // we accept a State class, or a function that will give us one
            // check here which one it is
            // if (_.isEmpty(State)) {
            //   // it's a function!
            //   statePromise = State();
            // }

            state = new State(name, _.extend(params || {}, {
              router: router
            }));

            // need to set parent here..?
            if (transition) {
              transition.then(function () {
                _.each(abandonedStates, function (state) {
                  if (!state._activated) {
                    state.destroy();
                    state = null;
                    lastParams = null;
                  }
                });
                abandonedStates = [];
              }, function () {
                // in case the transition was aborted, we might need to
                // destroy this state, after the transition has settled in
                // currently there is no way to call into
                if (!state._activated && transition.isAborted) {
                  abandonedStates.push(state);
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
            var preparePromise = state.prepare();

            var afterPrepare = function () {
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
            if (preparePromise && preparePromise.then) {
              return RSVP.resolve(preparePromise).then(afterPrepare);
            } else {
              afterPrepare();
              return state;
            }
          }
        },
        afterModel: function (state, transition) {
          if (state) {
            transition.data.parentState = state;
            if (state.afterPrepare) {
              state.afterPrepare();
            }
          }
        },
        enter: function () {
        },
        setup: function () {
          if (state) {
            if (!state._activated) {
              state.activate();
              state._activated = true;
            }
          }
        },
        exit: function () {
          if (state) {
            state.destroy();
            state = null;
            lastParams = null;
          }
        },
        events: {
          willTransition: function () {
            currentHandlers.pop();
          },
          error: function (e) {
            console.error(e.stack);
          }
        }
      };

      handler.routeName = name;
      seen[name] = handler;

      return handler;
    };
  };
});