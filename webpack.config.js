const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

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
      // path: path.resolve(__dirname, 'dist'),
      path: path.resolve(process.cwd(), 'dist'),
      // `publicPath` is where Webpack will load your bundles from (optional)
      publicPath: 'dist/',
    },
    mode: 'production',
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
      }],
    },
    resolve: {
      symlinks: false,
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      new HtmlWebpackPlugin({
        API_URL: process.env.API_URL,
        filename: 'index.html',
        template: 'src/index_template.html',
        inject: false,
      }),
    ],
  };
};
