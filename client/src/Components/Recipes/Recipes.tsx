import {Route, Routes, useNavigate, useParams} from 'react-router-dom'
import {NewRecipePage} from './NewRecipe/NewRecipePage'
import {useGetRecipe, useGetRecipes} from '@/Hooks/Queries/Recipe/recipeQueries'
import type {Recipe} from '@shared/types/types'

const RecipeList = () => {
  const {isLoading, isSuccess, data} = useGetRecipes()
  const navigate = useNavigate()

  if (isLoading) return <div>loading...</div>
  const recipes: Array<Recipe> = data?.data || []

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

const RecipePage = () => {
  const {id} = useParams()
  console.log(id)
  if (!id) return <div>error loading recipe id</div>

  const {isLoading, isSuccess, data: recipeData} = useGetRecipe(id)
  if (isLoading) return <div>loading...</div>

  return (
    <div>
      {isSuccess && (
        <div>
          <h1>{recipeData.name}</h1>
          <pre>time: {JSON.stringify(recipeData.time, null, '\t')}</pre>
          <pre>ingredients: {JSON.stringify(recipeData.ingredients, null, '\t')}</pre>
          <pre>steps: {JSON.stringify(recipeData.steps, null, '\t')}</pre>
        </div>
      )}
    </div>
  )
}

export const Recipes = () => {
  return (
    <Routes>
      <Route path="/" element={<RecipeList />} />
      <Route path="/new" element={<NewRecipePage />} />
      <Route path="/:id" element={<RecipePage />} />
    </Routes>
  )
}
