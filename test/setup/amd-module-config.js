require.config({
  paths: {
    "underscore": "bower_components/underscore/underscore",
    "jquery": "bower_components/jquery/jquery",
    "location-bar": "bower_components/location-bar/location-bar"
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