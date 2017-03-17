const debug = process.env.NODE_ENV !== 'production';
const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.join(__dirname),
  devtool: debug ? 'inline-sourcemap' : null,
  entry: './app.jsx',
  output: {
    path: path.join(__dirname, '../public/js/'),
    filename: 'index.js',
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules!bower_components)/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015', 'stage-0'],
        plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'],
      },
    }, {
      test: /\.hogan$/,
      loader: 'hogan',
    }],
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
};