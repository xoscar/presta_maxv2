const { join } = require('path');
const { DefinePlugin, optimize } = require('webpack');
const dotenv = require('dotenv');

dotenv.load({ path: '../.env' });

const { NODE_ENV, API_URL } = process.env;

module.exports = {
  context: join(__dirname),
  devtool: 'inline-source-map',
  entry: './app/app.js',
  output: {
    path: join(__dirname, './public'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: join(__dirname, 'public'),
    historyApiFallback: true,
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
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
  plugins: NODE_ENV !== 'production' ? [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.BASE_URL': JSON.stringify('http://localhost:4000'),
    }),
  ] : [
    new optimize.DedupePlugin(),
    new optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BASE_URL': JSON.stringify(API_URL),
    }),
  ],
};
