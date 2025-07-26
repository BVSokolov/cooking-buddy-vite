import {recipesFacade} from '../facades/recipesFacade'
import {NewRecipeFormData, Recipe} from '../shared/types/types'
import {EndpointContext} from '../types/types'

const getRecipes = async (ctx: EndpointContext) => {
  const {db} = ctx
  ctx.status = 200
  // ctx.body = await recipeDao.getAll(db)
  return ctx
}

type GetRecipeEndpointCtx = EndpointContext & {
  params: {
    recipeId: Recipe['id']
  }
}
const getRecipe = async (ctx: GetRecipeEndpointCtx) => {
  const {recipeId} = ctx.params
  const {db} = ctx
  ctx.status = 200
  ctx.body = await recipesFacade.getById(db, recipeId)
  return ctx
}

type NewRecipeEndpointCtx = EndpointContext & {
  body: NewRecipeFormData
}
const newRecipe = async (ctx: NewRecipeEndpointCtx) => {
  const recipeData = ctx.body
  const {db, trx} = ctx
  const recipeId = await recipesFacade.newRecipe({db, trx}, recipeData)
  const recipe = await recipesFacade.getById(db, recipeId)

  ctx.response.body = JSON.stringify(recipe)
  ctx.status = 200
  return ctx
}

export const recipesController = {
  getRecipes,
  getRecipe,
  newRecipe,
}
