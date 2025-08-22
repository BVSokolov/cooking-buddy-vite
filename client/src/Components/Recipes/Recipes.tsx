import {Route, Routes, useNavigate} from 'react-router-dom'
import {NewRecipePage} from './NewRecipe/NewRecipe'
import {useGetRecipes} from '@/Hooks/Queries/Recipe/recipeQueries'
import type {DB_Recipe} from '@shared/types/types'
import {Recipe} from './Recipe/Recipe'

const RecipeList = () => {
  const {isLoading, isSuccess, data} = useGetRecipes()
  const navigate = useNavigate()

  if (isLoading) return <div>loading...</div>
  const recipes: Array<DB_Recipe> = data?.data || []

  return (
    <div>
      <button onClick={() => navigate('new')}>New Recipe</button>
      <h1>Recipes</h1>
      {isSuccess && (
        <ul>
          {recipes.map((recipe, _index) => (
            <li key={recipe.id}>
              <a href="" onClick={() => navigate(`${recipe.id}`)}>
                {recipe.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const Recipes = () => {
  return (
    <Routes>
      <Route path="/" element={<RecipeList />} />
      <Route path="/new" element={<NewRecipePage />} />
      <Route path="/:id" element={<Recipe />} />
    </Routes>
  )
}
