import {RecipeIngredient} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {getFirstRow} from './utils'

const TABLE_NAME = 'recipeIngredient'

const createNew = async (trx: DaoContext['trx'], data: Omit<RecipeIngredient, 'id'>) =>
  await getFirstRow(trx('recipeIngredient').insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: RecipeIngredient['recipeId']) =>
  await db(TABLE_NAME).where({recipeId})

export const recipeIngredientDao = {
  createNew,
  getByRecipeId,
}
