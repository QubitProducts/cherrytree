require.config({
  paths: {
    "underscore": "node_modules/underscore/underscore",
    "jquery": "node_modules/jquery/dist/jquery",
    "location-bar": "node_modules/location-bar/location-bar"
  },
  packages: [{
    name: "cherrytree", location: ".", main: "router"
  }, {
    name: "when", location: "node_modules/when", main: "when"
  }, {
    name: "lodash", location: "node_modules/lodash-amd", main: "main"
  }]
});