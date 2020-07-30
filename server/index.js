const fs = require('fs')
const Koa = require('koa')
const path = require('path')
const LRU = require('lru-cache')
const send = require('koa-send')
const Router = require('koa-router')
const { createBundleRenderer } = require('vue-server-renderer')

// 缓存
const microCache = new LRU({
  max: 100,
  maxAge: 1000 * 60 // 重要提示：条目在 1 秒后过期。
})

const isCacheable = ctx => {
  // 实现逻辑为，检查请求是否是用户特定(user-specific)。
  // 只有非用户特定(non-user-specific)页面才会缓存
  if (ctx.url === '/' || ctx.url.startsWith('/details')) {
    return true
  }
  return false
}

//  第 1 步：创建koa、koa-router 实例
const app = new Koa()
const router = new Router()

let renderer
const templatePath = path.resolve(__dirname, '../public/index.html')


// 获取客户端、服务器端打包生成的json文件
const serverBundle = require('../dist/vue-ssr-server-bundle.json')
const clientManifest = require('../dist/vue-ssr-client-manifest.json')
// 赋值
renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: fs.readFileSync(templatePath, 'utf-8'),
  clientManifest
})
// 静态资源
router.get('/static/*', async (ctx, next) => {
  await send(ctx, ctx.path, { root: __dirname + '/../dist' });
})
router.get('/public/*', async (ctx, next) => {
  await send(ctx, ctx.path, { root: __dirname + '/..' });
})



const render = async (ctx, next) => {
  ctx.set('Content-Type', 'text/html')

  const handleError = err => {
    if (err.code === 404) {
      ctx.status = 404
      ctx.body = '404 Page Not Found'
    } else {
      ctx.status = 500
      ctx.body = '500 Internal Server Error'
      console.error(`error during render : ${ctx.url}`)
      console.error(err.stack)
    }
  }

  const context = {
    url: ctx.url
  }

  // 判断是否可缓存，可缓存并且缓存中有则直接返回
  const cacheable = isCacheable(ctx)
  if (cacheable) {
    const hit = microCache.get(ctx.url)
    if (hit) {
      console.log('从缓存中取', ctx.url)
      return ctx.body = hit
    }
  }

  try {
    const html = await renderer.renderToString(context)
    ctx.body = html
    if (cacheable) {
      console.log('设置缓存: ', ctx.url)
      microCache.set(ctx.url, html)
    }
  } catch (error) {
    handleError(error)
  }

}

router.get('*', render)

app
  .use(router.routes())
  .use(router.allowedMethods())



const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`server started at http://127.0.0.1:${port}`)
})
