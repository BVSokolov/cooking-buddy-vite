import {Ingredient} from '../shared/types/types'
import {getFirstRow, gotFirstRow} from './utils'
import {DaoContext} from '../types/types'

const TABLE_NAME = 'ingredient'

const createNew = async (trx: DaoContext['trx'], data: Omit<Ingredient, 'id'>): Promise<Ingredient['id']> =>
  await gotFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getIdByName = async (
  {db, trx}: Partial<DaoContext>,
  name: Ingredient['name'],
): Promise<Ingredient['id']> => {
  if (!name) throw new Error(`expected string value for name, got ${name}`)
  const qb = trx ?? db
  return await getFirstRow(qb(TABLE_NAME).where({name}), 'id')
}

const gotIdByName = async (trx: DaoContext['trx'], name: Ingredient['name']): Promise<Ingredient['id']> => {
  const id = await getIdByName({trx}, name)
  return id ? id : await createNew(trx, {name})
}

export const ingredientDao = {
  createNew,
  getIdByName,
  gotIdByName,
}
