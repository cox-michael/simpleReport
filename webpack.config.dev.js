const dotenv = require('dotenv');
const webpack = require('webpack');
const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => {
  const env = dotenv.config().parsed;

  const envKeys = Object.keys(env).reduce((prev, next) => {
    // eslint-disable-next-line no-param-reassign
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
    entry: './src/index.js',
    output: {
      // `filename` provides a template for naming your bundles (remember to use `[name]`)
      filename: '[name].js',
      // `chunkFilename` provides a template for naming code-split bundles (optional)
      chunkFilename: '[name].js',
      // `path` is the folder where Webpack will place your bundles
      path: path.resolve(__dirname, 'dist'),
      // `publicPath` is where Webpack will load your bundles from (optional)
      publicPath: 'dist/',
    },
    mode: 'development',
    watch: true,
    watchOptions: {
      ignored: /node_modules/
    },
    module: {
      rules: [{
        test: /.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        }],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'],
      }],
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      // new HtmlWebpackPlugin({
      //  API_URL: process.env.API_URL,
      //   filename: 'index.html',
      //   template: 'src/index_template.html',
      //  inject: false
      // })
    ],
  };
};
