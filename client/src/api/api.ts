import axios from 'axios'

const recipes = {
  getRecipes: async () => await axios.get('http://localhost:3000/recipes'),
  putRecipe: async (data: {}) => await axios.post('http://localhost:3000/recipes/new', data),
}

const api = {
  recipes,
}

export {api}
