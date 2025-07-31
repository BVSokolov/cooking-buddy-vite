import {recipeDao} from '../daos/recipeDao'
import {recipeTimeDao} from '../daos/recipeTimeDao'
import {recipeSectionDao} from '../daos/recipeSectionDao'
import {ingredientDao} from '../daos/ingredientDao'
import {recipeIngredientDao} from '../daos/recipeIngredientDao'
import {recipeStepDao} from '../daos/recipeStepDao'
import {FacadeContext} from '../types/types'
import {NewRecipeFormData, RecipeData} from '../shared/types/types'

const importRecipe = (source: string) => {
  console.log('asd in import', source)

  return {ingredients: ['test']}
}

const newRecipe = async ({db, trx}: FacadeContext, recipeData: NewRecipeFormData) => {
  // when creating a new recipe we first create an entry in recipe table and get its id
  const {name, servings, time} = recipeData
  const recipeId = await recipeDao.createNew(trx, {name, servings})

  // then we create a row in the recipeTime table using recipe id
  await recipeTimeDao.createNew(trx, {recipeId, ...time})

  // then (if there are any ingredient sections in the recipe) we create an entry for each section in the recipeSection table and return its id
  const {sections} = recipeData
  const sectionIndexToIdMap = {}
  for (const {name, tempSectionId} of sections) {
    const sectionId = await recipeSectionDao.createNew(trx, {recipeId, name})
    sectionIndexToIdMap[tempSectionId] = sectionId
  }

  const getSectionId = (sectionIndex: number | null, errorMsg: string) => {
    if (sectionIndex === null) return undefined

    const sectionId = sectionIndexToIdMap[sectionIndex]
    if (sectionId === undefined) throw new Error(errorMsg)

    return sectionId
  }

  // then we create each ingredient (if it doesn't exist) in the ingredient table and return its id
  // then using recipeId and ingredientId (and recipeSectionId if available)...
  // ...we create an entry for each ingredient in the recipeIngredient table along amount and UOM
  const {ingredients} = recipeData
  for (const {name, refId, tempSectionId, ...rest} of ingredients) {
    const ingredientId = await ingredientDao.gotIdByName({db, trx}, name)
    const recipeSectionId = getSectionId(
      tempSectionId,
      `ingredient ${name} position ${rest.position} section index ${tempSectionId} to id mismatch`,
    )

    await recipeIngredientDao.createNew(trx, {recipeId, ingredientId, recipeSectionId, ...rest})
  }

  // // then using recipeId we create an entry for each step in the recipeStep table
  const {steps} = recipeData
  for (const {text, position, tempSectionId} of steps) {
    // search and replace any ref strings with recipeIngredientId in text here when i implement that on frontend
    const recipeSectionId = getSectionId(
      tempSectionId,
      `step position ${position} section index ${tempSectionId} to id mismatch`,
    )
    await recipeStepDao.createNew(trx, {recipeId, recipeSectionId, text, position})
  }

  return recipeId
}

const getById = async (db: FacadeContext['db'], recipeId: string): Promise<RecipeData> => {
  const recipe = await recipeDao.getById(db, recipeId)
  if (recipe === undefined) throw new Error('could not find recipe with provided id')

  const time = await recipeTimeDao.getByRecipeId(db, recipeId)
  const sections = await recipeSectionDao.getByRecipeId(db, recipeId)
  const ingredients = await recipeIngredientDao.getByRecipeId(db, recipeId)
  const steps = await recipeStepDao.getByRecipeId(db, recipeId)
  const result: RecipeData = {...recipe, time, sections, ingredients, steps}

  return result
}

export const recipesFacade = {importRecipe, newRecipe, getById}
