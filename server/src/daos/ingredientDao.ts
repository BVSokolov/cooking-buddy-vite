import {Ingredient} from '../shared/types/types'
import {getFirstRow} from './utils'
import {DaoContext} from '../types/types'

const TABLE_NAME = 'ingredient'

const createNew = async (trx: DaoContext['trx'], data: Omit<Ingredient, 'id'>): Promise<Ingredient['id']> =>
  await getFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getIdByName = async (db: DaoContext['db'], name: Ingredient['name']): Promise<Ingredient['id']> => {
  if (!name) throw new Error(`expected string value for name, got ${name}`)
  return await getFirstRow(db(TABLE_NAME).where({name}), 'id')
}

const gotIdByName = async ({db, trx}: DaoContext, name: Ingredient['name']): Promise<Ingredient['id']> => {
  const id = await getIdByName(db, name)
  return id ? id : await createNew(trx, {name})
}

export const ingredientDao = {
  createNew,
  getIdByName,
  gotIdByName,
}
