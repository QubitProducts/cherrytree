var path = require("path");

module.exports = {
  context: __dirname,
  entry: "./index",
  output: {
    path: "",
    filename: "bundle.js"
  },
  devtool: "source-map",
  resolve: {
    root: [__dirname],
    modulesDirectories: ["node_modules", "shared"]
  },
  module: {
    loaders: [
      { test: /vanilla\-blog.*\.js$/, exclude: /node_modules/, loader: "babel" },
      { test: /\.css$/, loader: "style!css" },
      { test: /\.html$/, loader: "underscore-template" },
    ]
  }
};