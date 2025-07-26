import {RecipeSection} from '../shared/types/types'
import {DaoContext} from '../types/types'
import {getFirstRow} from './utils'

const TABLE_NAME = 'recipeSection'

const createNew = async (trx: DaoContext['trx'], data: Omit<RecipeSection, 'id'>) =>
  await getFirstRow(trx(TABLE_NAME).insert(data, 'id'), 'id')

const getByRecipeId = async (db: DaoContext['db'], recipeId: RecipeSection['recipeId']) =>
  await db(TABLE_NAME).where({recipeId})

export const recipeSectionDao = {
  createNew,
  getByRecipeId,
}
