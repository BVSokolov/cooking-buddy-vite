import {DB_Recipe, DB_RecipeStep} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {gotFirstRow} from './utils'

const TABLE_NAME = 'recipeStep'

const createNew = async (trx: DaoContext['trx'], data: Omit<DB_RecipeStep, 'id'>) =>
  await gotFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: DB_RecipeStep['recipeId']) =>
  await db(TABLE_NAME).where({recipeId}).orderBy('position')

const deleteByRecipeId = async (trx: DaoContext['trx'], recipeId: DB_Recipe['id']) =>
  await trx(TABLE_NAME).delete().where({recipeId})

export const recipeStepDao = {
  createNew,
  getByRecipeId,
  deleteByRecipeId,
}
