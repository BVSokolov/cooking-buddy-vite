import {Context} from 'koa'
import {recipeController} from './controllers/recipeController'
const router = require('koa-router')()

const root = async (ctx: Context) => {
  ctx.status = 200
  ctx.body = 'Hey bud :)'
  return ctx
}

router.get('/', root)
router.get('/recipes', recipeController.getRecipes)
router.get('/recipes/:recipeId', recipeController.getRecipe)
router.post('/recipes/new', recipeController.newRecipe)
router.delete('/recipes/:recipeId', recipeController.deleteRecipe)
// router.put('/recipes/:recipeId/edit', recipesController.getRecipe)

export {router}
