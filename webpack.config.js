module.exports = {
  context: __dirname,
  output: {
    // path: path.join(__dirname, 'build', 'amd'),
    // filename: 'cherrytree-amd.js',
    library: 'cherrytree-amd',
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
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel?optional=runtime' }
    ]
  },
  devtool: process.env.DEBUG ? 'inline-source-map' : false
}
