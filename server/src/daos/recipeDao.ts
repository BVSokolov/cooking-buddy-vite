import {Recipe} from '../shared/types/types'
import {getFirstRow} from './utils'
import {DaoContext} from '../types/types'

const getAll = async (db: DaoContext['db']) => await db('recipe').select(['id', 'name'])

const getById = async (db: DaoContext['db'], id: string) => {
  if (!id) throw new Error(`expected string value for id, got ${id}`)
  return await getFirstRow(db('recipe').where({id}))
}

const createNew = async (trx: DaoContext['trx'], data: Omit<Recipe, 'id'>) =>
  await getFirstRow(trx('recipe').insert(data, 'id'), 'id')

export const recipeDao = {
  getAll,
  getById,
  createNew,
}
