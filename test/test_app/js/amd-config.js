require.config({
  paths: {
    "underscore": "bower_components/underscore/underscore",
    "jquery": "bower_components/jquery/dist/jquery",
    "location-bar": "bower_components/location-bar/location-bar",
    "sinon": "bower_components/sinon/lib/sinon",
  },
  packages: [{
    name: "cherrytree", location: ".", main: "router"
  }],
  shim: {
    "underscore": {
      exports: "_"
    }
  }
});