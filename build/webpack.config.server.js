const path = require('path')
const webpack = require('webpack')
const utils = require('./utils')
const config = require('../config')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseWebpackConfig = require('./webpack.config.base')
const VueServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  target: 'node',
  devtool: 'source-map',
  entry: path.join(__dirname, '../src/entry-server.ts'),
  output: {
    libraryTarget: 'commonjs2',
    filename: 'server-bundle.js',
  },
  module: {
    rules: utils.cssLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: false,
    }),
  },
  externals: nodeExternals({
    allowlist: /\.css$/
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VUE_ENV': '"server"'
    }),
    // 默认文件名为 `vue-ssr-server-bundle.json`
    new VueServerPlugin()
  ]
})
