const path = require('path')
const utils = require('./utils')
const config = require('../config')
// vue-loader v15版本需要引入此插件
const { VueLoaderPlugin } = require('vue-loader');
// 服务端渲染用到的插件、默认生成JSON
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

// 用于返回文件相对于根目录的绝对路径
const resolve = dir => path.resolve(__dirname, '..', dir)

// 创建ESlint相关rules
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('server')],
  options: {
    // 更友好、更详细的提示
    formatter: require('eslint-friendly-formatter'),
    // 只给出警告，开发有很好的体验，emitError为true会阻止浏览器显示内容
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  entry: resolve('src/entry-client.ts'),
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          transformAssetUrls: {
            video: ['src', 'poster'],
            source: 'src',
            img: 'src',
            image: 'xlink:href'
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        )
      },
      { // 处理ts文件的loader
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: utils.assetsPath('img/[name].[hash:7].[ext]')
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new VueSSRClientPlugin()
  ]
}
