const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.join(__dirname),
  devtool: process.env.NODE_ENV !== 'production' ? 'inline-sourcemap' : null,
  entry: './app.jsx',
  output: {
    path: path.join(__dirname, '../public'),
    filename: 'bundle.js',
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
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader', 'resolve-url-loader'],
    }, {
      test: /\.scss$/,
      loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader?sourceMap'],
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.(jpg|fig|woff|woff2|png|eot|ttf|svg)$/,
      loader: 'url-loader?limit=5000',
    }],
  },
  plugins: process.env.NODE_ENV !== 'production' ? [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.BASE_URL': JSON.stringify('http://localhost:4000/api'),
    }),
  ] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
