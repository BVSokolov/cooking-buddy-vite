import {RecipeIngredient} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {gotFirstRow} from './utils'

const TABLE_NAME = 'recipeIngredient'

const createNew = async (trx: DaoContext['trx'], data: Omit<RecipeIngredient, 'id'>) =>
  await gotFirstRow(trx('recipeIngredient').insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: RecipeIngredient['recipeId']) =>
  await db(TABLE_NAME).where({recipeId})

export const recipeIngredientDao = {
  createNew,
  getByRecipeId,
}
