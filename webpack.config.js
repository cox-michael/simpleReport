const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = options => {
	const env = dotenv.config().parsed;

	const envKeys = Object.keys(env).reduce((prev, next) => {
		prev[`process.env.${next}`] = JSON.stringify(env[next]);
		return prev;
	}, {});

	return {
		entry: './src/index.js',
		mode: 'production',
		module: {
			rules: [
				{
					test: /.js$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								cacheDirectory: true,
							},
						},
					],
				},
			],
		},
		plugins: [
			new webpack.DefinePlugin(envKeys),
			new HtmlWebpackPlugin({
				API_URL: process.env.API_URL,
	      filename: 'index.html',
	      template: 'src/index_template.html',
				inject: false
	    }),
			new HtmlWebpackPlugin({
				FULL_URL: process.env.FULL_URL,
	      filename: 'daily_delivery.html',
	      template: 'src/email_templates/daily_delivery.html',
				inject: false
	    }),
			new HtmlWebpackPlugin({
				FULL_URL: process.env.FULL_URL,
	      filename: 'immediate_notification.html',
	      template: 'src/email_templates/immediate_notification.html',
				inject: false
	    }),
			new HtmlWebpackPlugin({
				FULL_URL: process.env.FULL_URL,
	      filename: 'report_row.html',
	      template: 'src/email_templates/report_row.html',
				inject: false
	    })
		]
	}
}
