import {RecipeTime} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {getFirstRow} from './utils'

const TABLE_NAME = 'recipeTime'

const createNew = async (trx: DaoContext['trx'], data: Omit<RecipeTime, 'id'>) =>
  await getFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: RecipeTime['recipeId']) =>
  await getFirstRow(db(TABLE_NAME).where({recipeId}))

export const recipeTimeDao = {
  createNew,
  getByRecipeId,
}
