/**
 * Webpack configuration for Herta.js API components
 * Builds API-specific functionality into a separate bundle
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    'herta-api': './src/api/index.js',
    'herta-rest': './src/api/rest/index.js',
    'herta-graphql': './src/api/graphql/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      name: '[name]',
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
      '@api': path.resolve(__dirname, 'src/api'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@advanced': path.resolve(__dirname, 'src/advanced')
    }
  },
  externals: {
    // List external dependencies that should not be bundled
    'express': 'express',
    'cors': 'cors',
    'apollo-server-express': 'apollo-server-express',
    'graphql': 'graphql',
    'swagger-ui-express': 'swagger-ui-express',
    'swagger-jsdoc': 'swagger-jsdoc',
    'jsonwebtoken': 'jsonwebtoken'
  }
};
