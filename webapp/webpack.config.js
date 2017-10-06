const path = require('path');
const webpack = require('webpack');

module.exports = env => ({
  context: path.join(__dirname),
  devtool: env.NODE_ENV !== 'production' ? 'inline' : false,
  entry: './app/app.jsx',
  output: {
    path: path.join(__dirname, './public'),
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
  plugins: env.NODE_ENV !== 'production' ? [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.BASE_URL': JSON.stringify('http://localhost:4000'),
    }),
  ] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BASE_URL': JSON.stringify(env.apiUrl),
    }),
  ],
});
