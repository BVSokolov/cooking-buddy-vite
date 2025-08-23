import {DB_Recipe, DB_RecipeIngredient} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {gotFirstRow} from './utils'

const TABLE_NAME = 'recipeIngredient'

const createNew = async (trx: DaoContext['trx'], data: Omit<DB_RecipeIngredient, 'id'>) =>
  await gotFirstRow(trx('recipeIngredient').insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: DB_RecipeIngredient['recipeId']) =>
  await db(TABLE_NAME)
    .join('ingredient', `${TABLE_NAME}.ingredientId`, 'ingredient.id')
    .where({recipeId})
    .orderBy('position')

const deleteByRecipeId = async (trx: DaoContext['trx'], recipeId: DB_Recipe['id']) =>
  await trx(TABLE_NAME).delete().where({recipeId})

export const recipeIngredientDao = {
  createNew,
  getByRecipeId,
  deleteByRecipeId,
}
