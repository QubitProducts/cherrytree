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
    root: [__dirname]
  },
  module: {
    loaders: [
      { test: /vanilla\-blog.*\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/, loader: "style" }
    ]
  }
};