import {Context} from 'koa'
import {recipesController} from './controllers/recipesController'
const router = require('koa-router')()

const root = async (ctx: Context) => {
  ctx.status = 200
  ctx.body = 'Hey bud :)'
  return ctx
}

router.get('/', root)
router.get('/recipes', recipesController.getRecipes)
router.get('/recipes/:recipeId', recipesController.getRecipe)
router.post('/recipes/new', recipesController.newRecipe)
// router.put('/recipes/:recipeId/edit', recipesController.getRecipe)

export {router}
