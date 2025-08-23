import {Route, Routes, useNavigate} from 'react-router-dom'
import {NewRecipePage} from './NewRecipe/NewRecipe'
import {useDeleteRecipeMutation, useGetRecipes} from '@/Hooks/Queries/Recipe/recipeQueries'
import type {DB_Recipe} from '@shared/types/types'
import {Recipe} from './Recipe/Recipe'

const RecipeList = () => {
  const {isLoading, isSuccess, data} = useGetRecipes()
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const navigate = useNavigate()

  const deleteRecipe = (recipeId: DB_Recipe['id']) => {
    deleteRecipeMutation.mutate(recipeId)
  }

  if (isLoading) return <div>loading...</div>
  const recipes: Array<DB_Recipe> = data?.data || []

  return (
    <div>
      <button onClick={() => navigate('new')}>New Recipe</button>
      <h1>Recipes</h1>
      {isSuccess && (
        <ul>
          {recipes.map(({id, name}, _index) => (
            <li key={id}>
              <a href="" onClick={() => navigate(`${id}`)}>
                {name}
              </a>
              <button onClick={() => deleteRecipe(id)}>Delete</button>
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
