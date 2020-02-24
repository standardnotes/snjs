const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const JsDocPlugin = require('jsdoc-webpack-plugin');
module.exports = {
    entry: {
      "snjs.js": "./lib/main.js",
      "snjs.min.js": "./lib/main.js"
    },
    resolve: {
      alias: {
        "@Root": path.resolve(__dirname, "."),
        "@Lib": path.resolve(__dirname, "lib"),
        "@Services": path.resolve(__dirname, "lib/services"),
        "@Models": path.resolve(__dirname, "lib/models"),
        "@Protocol": path.resolve(__dirname, "lib/protocol"),
        "@Payloads": path.resolve(__dirname, "lib/protocol/payloads")
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
          test: /\.js$/,
          loader: 'babel-loader',
        }
      ]
    },
    plugins: [
      new CopyPlugin([
        { from: 'node_modules/sncrypto/dist/libsodium.bundle.js', to: 'libsodium.bundle.js' },
        { from: 'node_modules/sncrypto/dist/vendors~libsodium.bundle.js', to: 'vendors~libsodium.bundle.js' },
      ]),
      new JsDocPlugin({
        conf: 'jsdoc.json',
        cwd: '.',
        preserveTmpFile: false,
        recursive: false
      })
    ],
    stats: {
      colors: true
    },
    devtool: 'source-map'
};
