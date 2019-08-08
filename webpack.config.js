const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = env => {
  const dotenvParsed = dotenv.config().parsed;

  const envKeys = Object.keys(dotenvParsed).reduce((prev, next) => {
    // eslint-disable-next-line no-param-reassign
    prev[`process.env.${next}`] = JSON.stringify(dotenvParsed[next]);
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
    mode: env.prod ? 'production' : 'development',
    module: {
      rules: [
        {
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
        },
      ],
    },
    resolve: {
      symlinks: false,
      alias: env.dev ? {
        'react-dom': '@hot-loader/react-dom',
      } : {},
    },
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      public: process.env.FULL_URL,
      host: process.env.CLIENT_HOST, // Defaults to `localhost`
      port: process.env.CLIENT_PORT, // Defaults to 8080
      proxy: {
        [`https://${process.env.FULL_URL}/*`]: {
          target: `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/`,
          secure: false,
        },
      },
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
