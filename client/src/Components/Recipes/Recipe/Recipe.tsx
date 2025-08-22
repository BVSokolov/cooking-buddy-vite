import {useGetRecipe} from '@/Hooks/Queries/Recipe/recipeQueries'
import {useParams} from 'react-router-dom'

export const Recipe = () => {
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
