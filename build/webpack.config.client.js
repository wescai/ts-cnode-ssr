const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./webpack.config.base')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const pordWebpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  module: {
    rules: utils.cssLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  plugins: [
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      chunkFilename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    new OptimizeCssAssetsPlugin(),
    new webpack.HashedModuleIdsPlugin()
  ],
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'all'
    },
    runtimeChunk: true
  },
})

module.exports = pordWebpackConfig
