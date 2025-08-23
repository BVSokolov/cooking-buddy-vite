import {DB_Recipe, DB_RecipeTime} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {gotFirstRow} from './utils'

const TABLE_NAME = 'recipeTime'

const createNew = async (trx: DaoContext['trx'], data: Omit<DB_RecipeTime, 'id'>) =>
  await gotFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: DB_RecipeTime['recipeId']) =>
  await gotFirstRow(db(TABLE_NAME).where({recipeId}))

const deleteByRecipeId = async (trx: DaoContext['trx'], recipeId: DB_Recipe['id']) =>
  await trx(TABLE_NAME).delete().where({recipeId})

export const recipeTimeDao = {
  createNew,
  getByRecipeId,
  deleteByRecipeId,
}
