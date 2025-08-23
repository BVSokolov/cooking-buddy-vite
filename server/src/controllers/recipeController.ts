import {recipeFacade} from '../facades/recipeFacade'
import {NewRecipeData, DB_Recipe} from '../shared/types/types'
import {EndpointContext} from '../types/types'

const getRecipes = async (ctx: EndpointContext) => {
  const {db} = ctx
  ctx.status = 200
  ctx.body = await recipeFacade.getAll(db)
  return ctx
}

type GetRecipeEndpointCtx = EndpointContext & {
  params: {
    recipeId: DB_Recipe['id']
  }
}
const getRecipe = async (ctx: GetRecipeEndpointCtx) => {
  const {recipeId} = ctx.params
  const {db} = ctx
  ctx.status = 200
  ctx.body = await recipeFacade.getById(db, recipeId)
  return ctx
}

type NewRecipeEndpointCtx = EndpointContext & {
  body: NewRecipeData
}
const newRecipe = async (ctx: NewRecipeEndpointCtx) => {
  const recipeData = ctx.body
  const {db, trx} = ctx
  // const recipeId = await recipeFacade.newRecipe({db, trx}, recipeData)

  // ctx.response.body = recipeId
  ctx.status = 200
  return ctx
}

type DeleteRecipeEndpointCtx = EndpointContext & {
  params: {
    recipeId: DB_Recipe['id']
  }
}
const deleteRecipe = async (ctx: DeleteRecipeEndpointCtx) => {
  const {recipeId} = ctx.params
  const {trx} = ctx
  ctx.status = 200
  ctx.body = await recipeFacade.deleteById(trx, recipeId)
  return ctx
}

export const recipeController = {
  getRecipes,
  getRecipe,
  newRecipe,
  deleteRecipe,
}
