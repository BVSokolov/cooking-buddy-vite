const Koa = require('koa')
const BodyParser = require('koa-bodyparser')
const Logger = require('koa-logger')
const cors = require('koa-cors')
import {db} from './src/db/db'
import {router} from './src/routes'

const app = new Koa()

const isGet = (ctx) => ctx.request.method === 'GET'

app
  .use(Logger())
  .use(cors())
  .use(BodyParser())
  .use(async (ctx, next) => {
    ctx.db = db
    ctx.body = ctx.request.body
    if (!isGet(ctx)) ctx.trx = await db.transaction()
    await next()
  })
  .use(async (ctx, next) => {
    try {
      await next()
      if (!isGet(ctx)) ctx.trx.commit()
    } catch (err) {
      if (!isGet(ctx)) ctx.trx.rollback()
      console.log('ROLLED BACK')

      ctx.status = err.status || 500
      ctx.body = {
        success: false,
        message: err.message || 'Internal Server Error',
      }
      ctx.app.emit('error', err, ctx)
    }
  })
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000, () => console.log('---------- Server started ----------'))

module.exports = app
