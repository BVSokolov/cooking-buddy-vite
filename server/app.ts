const Koa = require('koa')
const BodyParser = require('koa-bodyparser')
const Logger = require('koa-logger')
const cors = require('koa-cors')
import {db} from './src/db/db'
import {router} from './src/routes'

const app = new Koa()

app
  .use(Logger())
  .use(cors())
  .use(BodyParser())
  .use(async (ctx, next) => {
    const trx = await db.transaction()
    ctx.db = db
    ctx.trx = trx
    ctx.body = ctx.request.body
    return next()
  })
  .use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.trx.rollback()
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
