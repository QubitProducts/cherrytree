module.exports = {
  context: __dirname,
  output: {
    library: 'cherrytree',
    libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      'expect': 'referee/lib/expect'
    }
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  },
  devtool: process.env.DEBUG ? 'inline-source-map' : false
}
