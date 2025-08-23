import {DB_Recipe, DB_RecipeSection} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {gotFirstRow} from './utils'

const TABLE_NAME = 'recipeSection'

const createNew = async (trx: DaoContext['trx'], data: Omit<DB_RecipeSection, 'id'>) =>
  await gotFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: DB_RecipeSection['recipeId']) =>
  await db(TABLE_NAME).where({recipeId}).orderBy('position', 'asc')

const deleteByRecipeId = async (trx: DaoContext['trx'], recipeId: DB_Recipe['id']) =>
  await trx(TABLE_NAME).delete().where({recipeId})

export const recipeSectionDao = {
  createNew,
  getByRecipeId,
  deleteByRecipeId,
}
