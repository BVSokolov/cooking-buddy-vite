import {recipeDao} from '../daos/recipeDao'
import {recipeTimeDao} from '../daos/recipeTimeDao'
import {recipeSectionDao} from '../daos/recipeSectionDao'
import {ingredientDao} from '../daos/ingredientDao'
import {recipeIngredientDao} from '../daos/recipeIngredientDao'
import {recipeStepDao} from '../daos/recipeStepDao'
import {FacadeContext} from '../types/types'
import {NewRecipeData, DB_Recipe, RecipeDataRaw} from '../shared/types/types'

const importRecipe = (source: string) => {
  console.log('asd in import', source)

  return {ingredients: ['test']}
}

const newRecipe = async ({db, trx}: FacadeContext, recipeData: NewRecipeData) => {
  // when creating a new recipe we first create an entry in recipe table and get its id
  const {name, servings, time} = recipeData
  const recipeId = await recipeDao.createNew(trx, {name, servings})

  // then we create a row in the recipeTime table using recipe id
  await recipeTimeDao.createNew(trx, {recipeId, ...time})

  // then we create each ingredient (if it doesn't exist) in the ingredient table and return its id
  // then using recipeId and ingredientId (and recipeSectionId if available)...
  // ...we create an entry for each ingredient in the recipeIngredient table along amount and UOM
  const {ingredients: ingredientSections} = recipeData
  for (const {name, position, elements} of ingredientSections) {
    const recipeSectionId = await recipeSectionDao.createNew(trx, {recipeId, name, position})
    for (const {name, ...rest} of elements) {
      const ingredientId = await ingredientDao.gotIdByName(trx, name)
      await recipeIngredientDao.createNew(trx, {recipeId, ingredientId, recipeSectionId, ...rest})
    }
  }

  // // then using recipeId we create an entry for each step in the recipeStep table
  const {steps: stepSections} = recipeData
  for (const {name, position, elements} of stepSections) {
    const recipeSectionId = await recipeSectionDao.createNew(trx, {recipeId, name, position})

    for (const step of elements) {
      await recipeStepDao.createNew(trx, {recipeId, recipeSectionId, ...step})
    }
  }

  return recipeId
}

const editRecipe = async ({db, trx}: FacadeContext, recipeData: NewRecipeData) => {
  const {name, servings, time} = recipeData
  const recipeId = await recipeDao.createNew(trx, {name, servings}) // update instead of create new

  await recipeTimeDao.createNew(trx, {recipeId, ...time}) // update instead of create new

  // await recipeIngredientDao.deleteByRecipeId(trx, recipeId)
  // await recipeStepDao.deleteByRecipeId(trx, recipeId)
  // await recipeSectionDao.deleteByRecipeId(trx, recipeId)

  const {ingredients: ingredientSections} = recipeData
  for (const {name, position, elements} of ingredientSections) {
    const recipeSectionId = await recipeSectionDao.createNew(trx, {recipeId, name, position})
    for (const {name, ...rest} of elements) {
      const ingredientId = await ingredientDao.gotIdByName(trx, name)
      await recipeIngredientDao.createNew(trx, {recipeId, ingredientId, recipeSectionId, ...rest})
    }
  }

  const {steps: stepSections} = recipeData
  for (const {name, position, elements} of stepSections) {
    const recipeSectionId = await recipeSectionDao.createNew(trx, {recipeId, name, position})

    for (const step of elements) {
      await recipeStepDao.createNew(trx, {recipeId, recipeSectionId, ...step})
    }
  }

  return recipeId
}

const getById = async (db: FacadeContext['db'], recipeId: string): Promise<RecipeDataRaw> => {
  const recipe = await recipeDao.getById(db, recipeId)
  if (recipe === undefined) throw new Error('could not find recipe with provided id')

  const time = await recipeTimeDao.getByRecipeId(db, recipeId)
  const sections = await recipeSectionDao.getByRecipeId(db, recipeId)
  const ingredients = await recipeIngredientDao.getByRecipeId(db, recipeId)
  const steps = await recipeStepDao.getByRecipeId(db, recipeId)
  const result: RecipeDataRaw = {...recipe, time, sections, ingredients, steps}

  return result
}

const getAll = async (db: FacadeContext['db']): Promise<Array<DB_Recipe>> => {
  const result = await recipeDao.getAll(db)
  return result
}

const deleteById = async (trx: FacadeContext['trx'], recipeId: string): Promise<void> => {
  await recipeTimeDao.deleteByRecipeId(trx, recipeId)
  await recipeIngredientDao.deleteByRecipeId(trx, recipeId)
  await recipeStepDao.deleteByRecipeId(trx, recipeId)
  await recipeSectionDao.deleteByRecipeId(trx, recipeId)
  await recipeDao.deleteById(trx, recipeId)
}

export const recipeFacade = {importRecipe, newRecipe, getById, getAll, deleteById}
