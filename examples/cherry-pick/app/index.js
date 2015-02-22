var _ = require("lodash");
import when from 'when';
import keys from 'when/keys';
import React from 'react';
import cherrytree from '../../../';
import routes from './routes';
import LoadingRoute from './routes/loading';


let App = React.createClass({
  childContextTypes: {
    router: React.PropTypes.object.isRequired
  },
  getChildContext: function () {
    return {
      router: router
    };
  },
  render: function () {
    return <div>{this.props.children}</div>;
  }
});

var router = cherrytree();
router.map(routes);
// load route handlers
router.use(function (transition) {
  transition.nextRoutes.forEach(function (route) {
    var RouteHandler = getRouteHandler(route.name);
    route.RouteHandler = RouteHandler;
  });
});
// load data
router.use(function (transition) {
  var datas = when.all(transition.nextRoutes.map(function (route) {
    if (route.RouteHandler.fetchData) {
      return keys.all(route.RouteHandler.fetchData(transition.params, transition));
    }
  }));
  return datas;
});
// render
router.use(function (transition, datas) {
  React.withContext({router: router}, function () {
    var childRouteHandler;
    var i = transition.nextRoutes.length - 1;
    _.clone(transition.nextRoutes).reverse().forEach(function (route) {
      var RouteHandler = route.RouteHandler;
      var data = datas[i--];
      childRouteHandler = <RouteHandler {...data}>{childRouteHandler}</RouteHandler>;
    });
    React.render(<App>{childRouteHandler}</App>, document.body);
  });
});
router.listen();

export default router;

// this is a webpack specific way of automatically
// loading the route file in asynchronously for each
// route. We might use System.import in the future.
function getRouteHandler(name) {
  // console.log("./components/" + name.replace(/\./, "_"));
  // return require("./components/" + name.replace(/\./, "_"));
  if (name === "application") {
    return require("./components/application");
  }
  if (name === "index") {
    return require("./pages/index");
  }
  if (name === "repo.commits") {
    return require("./pages/commits");
  }
  if (name === "repo") {
    return require("./components/repo_header");
  }
}

// for debugging and such
window.router = router;
// to enable the React Dev Tools
window.React = React;