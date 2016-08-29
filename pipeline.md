m1.next  >  m2.next  >  m3.next -->
                                  |
                                  |
m1.done  <  m2.done  <  m3.done <--



m1.next    >    m2.next(err) -->
                               |
                               |
m1.error(err) <  m2.error(err) <--



m1.next  >  m2.next  >  m3.next -->
                                  |
                                  |
m1.done  <  m2.done(err)  <  m3.done <--

```js
function (router) {
    return function (transition) {
        // do stuff, such as
        // log
        // measure
        // render
        // fetch routes
        // compute and mark active
        // create handlers

        // and then proceed
        next(null, transition)
    }
}
```

```js
function (router) {
    return {
        next: function (transition) {
            // do stuff, such as
            // log
            // measure
            // render
            // fetch routes
            // compute and mark active
            // create handlers

            // and then proceed
            next(null, transition)

            // if this middleware errors, or calls next(err)
            // the transition will go into failed state
            // no further middlewares get called,
            // only error handlers get called, in reverse order
            // if you showed a "loading spinner", you might want
            // to hide in both done and error handlers
        },
        done: function (transition) {
            // after all next() middlewares complete,
            // done gets called in the reverse order
            // if done calles next(err) or errors,
            // the transition will go to failed state
            // and error handlers of the current middleware
            // and down will get called
        },
        error: function (err, transition) {
            // rarely used, use to intercept routing errors,
            // otherwise the error is just thrown at the top level
        }
    }
}
```

Only once all next and then all done/errors middlewares get completed, does the next queued up transition start running.
