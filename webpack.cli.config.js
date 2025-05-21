/**
 * Webpack configuration for Herta.js CLI
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './bin/herta.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'herta-cli.js',
    library: {
      name: 'hertaCLI',
      type: 'umd',
      umdNamedDefine: true
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@commands': path.resolve(__dirname, 'commands')
    }
  },
  externals: {
    // List external dependencies here that should not be bundled
    'chalk': 'chalk',
    'express': 'express',
    'commander': 'commander'
  }
};
