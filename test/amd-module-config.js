require.config({
  paths: {
    "route-recognizer": "bower_components/route-recognizer/dist/route-recognizer.amd",
    "router": "bower_components/router.js/dist/router.amd",
    "rsvp": "bower_components/rsvp/rsvp.amd",
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