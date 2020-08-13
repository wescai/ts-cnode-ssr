const fs = require('fs')
const path = require('path')
const config = require('../config')
const packageConfig = require('../package.json')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.join(assetsSubDirectory, _path)
}

const findExisting = (context, files) => {
  for (const file of files) {
    if (fs.existsSync(path.join(context, file))) {
      return file
    }
  }
}

exports.cssLoaders = function (rootOptions) {
  const shadowMode = !!process.env.VUE_CLI_CSS_SHADOW_MODE
  const isProd = process.env.NODE_ENV === 'production'

  const {
    extract = isProd,
    sourceMap = false,
    usePostCSS = false,
    loaderOptions = {}
  } = rootOptions


  const shouldExtract = extract !== false
  const filename = exports.assetsPath(`css/[name].[contenthash:8].css`)
  const extractOptions = Object.assign({
    filename,
    chunkFilename: filename
  }, extract && typeof extract === 'object' ? extract : {})

  const cssPublicPath = '../'.repeat(
    extractOptions.filename
      .replace(/^\.[\/\\]/, '')
      .split(/[\/\\]/g)
      .length - 1
  )

  const hasPostCSSConfig = !!(loaderOptions.postcss || findExisting(__dirname, [
    '.postcssrc',
    '.postcssrc.js',
    'postcss.config.js',
    '.postcssrc.yaml',
    '.postcssrc.json'
  ]))

  if (!hasPostCSSConfig) {
    loaderOptions.postcss = {
      plugins: [
        require('autoprefixer')
      ]
    }
  }

  const needInlineMinification = isProd

  const cssnanoOptions = {
    preset: ['default', {
      mergeLonghand: false,
      cssDeclarationSorter: false
    }]
  }
  if (sourceMap) {
    cssnanoOptions.map = { inline: false }
  }

  function createCSSRule (test, loader, options) {

    const oneOf = [
      { resourceQuery: /module/, use: applyLoaders(true) },
      { resourceQuery: /\?vue/, use: applyLoaders() },
      { test: /\.module\.\w+$/, use: applyLoaders(true) },
      { use: applyLoaders() }
    ]

    function applyLoaders (isCssModule) {
      const loaders = []

      if (shouldExtract) {
        loaders.push({
          loader: require('mini-css-extract-plugin').loader,
          options: {
            hmr: !isProd,
            publicPath: cssPublicPath
          }
        })
      } else {
        loaders.push({
          loader: require.resolve('vue-style-loader'),
          options: {
            sourceMap,
            shadowMode
          }
        })
      }

      const cssLoaderOptions = Object.assign({
        sourceMap,
        importLoaders: (
          1 + // stylePostLoader injected by vue-loader
          1 + // postcss-loader
          (needInlineMinification ? 1 : 0)
        )
      }, loaderOptions.css)

      if (isCssModule) {
        cssLoaderOptions.modules = {
          localIdentName: '[name]_[local]_[hash:base64:5]',
          ...cssLoaderOptions.modules
        }
      } else {
        delete cssLoaderOptions.modules
      }

      loaders.push({
        loader: 'css-loader',
        options: cssLoaderOptions
      })

      if (needInlineMinification) {
        loaders.push({
          loader: require.resolve('postcss-loader'),
          options: {
            sourceMap,
            plugins: [require('cssnano')(cssnanoOptions)]
          }
        })
      }

      loaders.push({
        loader: require.resolve('postcss-loader'),
        options: Object.assign({ sourceMap }, loaderOptions.postcss)
      })

      if (loader) {
        let resolvedLoader
        try {
          resolvedLoader = require.resolve(loader)
        } catch (error) {
          resolvedLoader = loader
        }
        loaders.push({
          loader: resolvedLoader,
          options: Object.assign({ sourceMap }, options)
        })
      }
      return loaders
    }
    return { test, oneOf }
  }

  const rules = [
    createCSSRule(/\.css$/),
    createCSSRule(/\.p(ost)?css$/),
    createCSSRule(/\.scss$/, 'sass-loader', Object.assign(
      {},
      loaderOptions.scss || loaderOptions.sass
    )),
    createCSSRule(/\.sass$/, 'sass-loader', Object.assign(
      {},
      loaderOptions.sass,
      {
        sassOptions: Object.assign(
          {},
          loaderOptions.sass && loaderOptions.sass.sassOptions,
          {
            indentedSyntax: true
          }
        )
      }
    )),
    createCSSRule(/\.less$/, 'less-loader', loaderOptions.less),
    createCSSRule(/\.styl(us)?$/, 'stylus-loader', Object.assign({
      preferPathResolver: 'webpack'
    }, loaderOptions.stylus))

  ]

  return rules
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
    })
  }
}
