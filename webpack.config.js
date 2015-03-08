module.exports = {
  context: __dirname,
  entry: './index',
  output: {
    path: __dirname + '/dist',
    filename: 'cherrytree.js',
    library: 'cherrytree',
    libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      'cherrytree': __dirname,
      'expect': 'referee/lib/expect'
    }
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  },
  devtool: 'inline-source-map'
}
