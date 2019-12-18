const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
      "snjs.js": "./lib/main.js",
      "snjs.min.js": "./lib/main.js"
    },
    mode: 'production',
    resolve: {
      alias: {
        "@Root": path.resolve(__dirname, "."),
        "@Lib": path.resolve(__dirname, "lib"),
        "@Services": path.resolve(__dirname, "lib/services"),
        "@Models": path.resolve(__dirname, "lib/models"),
        "@Protocol": path.resolve(__dirname, "lib/protocol")
      }
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: './[name]',
      library: 'SNLibrary',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    optimization: {
      minimize: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
        }
      ]
    },
    stats: {
      colors: true
    },
    devtool: 'source-map'
};
