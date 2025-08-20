import {RecipeTime} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {gotFirstRow} from './utils'

const TABLE_NAME = 'recipeTime'

const createNew = async (trx: DaoContext['trx'], data: Omit<RecipeTime, 'id'>) =>
  await gotFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: RecipeTime['recipeId']) =>
  await gotFirstRow(db(TABLE_NAME).where({recipeId}))

export const recipeTimeDao = {
  createNew,
  getByRecipeId,
}
