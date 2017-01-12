module.exports = {
  context: __dirname,
  output: {
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
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: {presets: ['es2015']} }
    ]
  },
  devtool: process.env.DEBUG ? 'inline-source-map' : false
}
