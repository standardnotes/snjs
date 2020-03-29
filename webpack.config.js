const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
module.exports = {
  entry: {
    'snjs.js': './lib/main.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@Root': path.resolve(__dirname, '.'),
      '@Lib': path.resolve(__dirname, 'lib'),
      '@Services': path.resolve(__dirname, 'lib/services'),
      '@Models': path.resolve(__dirname, 'lib/models'),
      '@Protocol': path.resolve(__dirname, 'lib/protocol'),
      '@Payloads': path.resolve(__dirname, 'lib/protocol/payloads')
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './[name]',
    library: 'SNLibrary',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: 'babel-loader',
      }
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: 'node_modules/sncrypto/dist/libsodium.bundle.js', to: 'libsodium.bundle.js' },
      { from: 'node_modules/sncrypto/dist/vendors~libsodium.bundle.js', to: 'vendors~libsodium.bundle.js' },
    ]),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // add errors to webpack instead of warnings
      failOnError: false,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    })
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map'
};
