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
    // chunkhash是根据内容生成的hash, 易于缓存
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  module: {
    rules: utils.cssLoaders({
      sourceMap: config.build.productionSourceMap,
      // 将css样式单独提取出文件
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
    //  当vendor模块不再改变时, 根据模块的相对路径生成一个四位数的hash作为模块id
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
