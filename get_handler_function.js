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
    var stateClasses = router.stateClasses;
    var prepares = router.prepares;

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

      if (name === "loading" && !stateClasses["loading"]) {
        handler = {};
        seen[name] = handler;
        return handler;
      }

      var lastParams, state, oldState;

      handler = {
        serialize: function (params) {
          // console.log("serializing", name, params);
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
        beforeModel: function (transition) {
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
          transition.providedModelsArray = [];
        },
        model: function (params, transition) {
          // console.log("cherry:", name, ":", "model", (state || {}).id);
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

          // This is currently not used anywhere in the app
          // The soft param feature where certain URL parameters
          // don't recreate the state, but instead only call an
          // update method on the state
          if (params && state && state.softParams) {
            var hardLastParams = _.omit(lastParams, state.softParams);
            var hardParams = _.omit(params, state.softParams);
            if (_.isEqual(hardLastParams, hardParams)) {
              state.update(params);
              return state;
            }
          }

          lastParams = _.clone(params);


          function createState(State) {
            oldState = state;
            // console.log("cherry:", name, ":", "createState", (state || {}).id, "with params", params);
            state = new State(name, _.extend(params || {}, {
              router: router,
            }));

            // need to set parent here..?
            if (transition) {
              transition.then(function () {
                // TODO what should we do with the abandoned states?
                _.each(abandonedStates, function (state) {
                  if (!state._activated) {
                    // console.log("cherry:", name, ":", "destroying", (state || {}).id);
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
                // console.log("ACTIVATING", name);
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


          var State;
          if (!prepares[name]) {
            State = stateClasses[name];
            if (State) {
              return createState(State);
            }
          } else {
            var promise = new RSVP.Promise(function(resolve, reject){
              prepares[name](router, function () {
                // now that we gave the prepare method a chance to preload
                // the states
                State = stateClasses[name];
                if (State) {
                  resolve(createState(State));
                } else {
                  reject(new Error("called the state loader, but that didn't provide the state for id", name));
                }
              });
            });
            return promise;
          }
        },

        afterModel: function (state, transition) {
          // console.log("cherry:", name, ":", "afterModel", (state || {}).id);
          if (state) {
            // update the transition's parentState
            // transition.data.parentState = state;
            if (state.afterPrepare) {
              state.afterPrepare();
            }
          }
        },
        setup: function () {
          // console.log("cherry:", name, ":", "setup", (state || {}).id);
          if (state) {
            if (!state._activated) {
              state.activate();
              state._activated = true;
            }
          }
          // now that we've activated the new state,
          // we can destroy the old one
          if (oldState) {
            // console.log("cherry:", name, ":", "destroying old state", (oldState || {}).id);
            oldState.destroy();
            oldState = null;
          }
        },
        exit: function () {
          // console.log("cherry:", name, ":", "exit", (state || {}).id);
          if (state) {
            // console.log("DESTROYING", name);
            state.destroy();
            state = null;
            lastParams = null;
          }
        },
        events: {
          willTransition: function () {
            currentHandlers.pop();
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

      handler.routeName = name;
      seen[name] = handler;

      return handler;
    };
  };
});