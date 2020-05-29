const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

// Config directories
const SRC_DIR = path.resolve(__dirname, 'src');
const OUTPUT_DIR = path.resolve(__dirname, 'dist');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const config = {
    entry: SRC_DIR + '/index.jsx',
    output: {
      path: OUTPUT_DIR,
      publicPath: '/',
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(scss|css)$/,
          exclude: /node_modules/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader"
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        filename: "./index.html",
        template: "./src/index.html",
      }),
    ],
    devServer: {
      host: '0.0.0.0',
      port: 3000,
      contentBase: OUTPUT_DIR,
      inline: true,
      hot: true,
    },
    devtool: isProduction ? undefined : 'eval-cheap-module-source-map',
  };
  return config;
}
