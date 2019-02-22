const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => {
  const env = dotenv.config().parsed;

  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
    entry: './src/index.js',
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
        }, ],
      }, ],
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      new HtmlWebpackPlugin({
        API_URL: process.env.API_URL,
        filename: 'index.html',
        template: 'src/index_template.html',
        inject: false
      })
    ]
  };
};
