import type {NewRecipeData, DB_Recipe, RecipeDataRaw} from '@shared/types/types'
import axios, {type AxiosPromise} from 'axios'

const recipes = {
  getRecipes: async () => await axios.get('http://localhost:3000/recipes'),
  getRecipe: async (recipeId: DB_Recipe['id']): AxiosPromise<RecipeDataRaw> =>
    await axios.get(`http://localhost:3000/recipes/${recipeId}`),
  putRecipe: async (data: NewRecipeData) => await axios.post('http://localhost:3000/recipes/new', data),
  deleteRecipe: async (recipeId: DB_Recipe['id']) =>
    await axios.delete(`http://localhost:3000/recipes/${recipeId}`),
}

const api = {
  recipes,
}

export {api}
