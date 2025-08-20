import {RecipeStep} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {gotFirstRow} from './utils'

const TABLE_NAME = 'recipeStep'

const createNew = async (trx: DaoContext['trx'], data: Omit<RecipeStep, 'id'>) =>
  await gotFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: RecipeStep['recipeId']) =>
  await db(TABLE_NAME).where({recipeId})

export const recipeStepDao = {
  createNew,
  getByRecipeId,
}
