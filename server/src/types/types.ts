import {Knex} from 'knex'
import {Context} from 'koa'

type KnexContext = {
  db: Knex
  trx: Knex.Transaction
}

export type EndpointContext = Context & KnexContext

export type FacadeContext = KnexContext

export type DaoContext = KnexContext
