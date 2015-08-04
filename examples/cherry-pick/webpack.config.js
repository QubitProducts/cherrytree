var webpack = require('webpack');
var reworkLoader = require('rework-webpack-loader');

module.exports = {
  context: __dirname,
  entry: "./index",
  output: {
    path: "dist",
    filename: "bundle.js"
  },
  devtool: "inline-source-map",
  resolve: {
    modulesDirectories: ["node_modules", "shared"]
  },
  plugins: [
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"development"'})
  ],
  module: {
    loaders: [
      { test:  /.*\.js$/, exclude: /node_modules/, loader: "babel" },
      { test: /.*node_modules\/cherrytree\/.*\.js$/, loader: "babel" },
      { test: /\.css$/, loader: "style!rework-webpack" },
      { test: /\.woff$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.png$/, loader: "file-loader?mimetype=image/png" },
      { test: /\.ttf$/, loader: "file-loader" },
      { test: /\.eot$/, loader: "file-loader" },
      { test: /\.svg$/, loader: "file-loader" }
    ]
  },
  rework: {
    use: [
      reworkLoader.plugins.imports,
      reworkLoader.plugins.urls
    ]
  }
};