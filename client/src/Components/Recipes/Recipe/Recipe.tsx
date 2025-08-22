import {useGetRecipe, type RecipeData} from '@/Hooks/Queries/Recipe/recipeQueries'
import type {DB_RecipeTime} from '@shared/types/types'
import type {FC} from 'react'
import {useParams} from 'react-router-dom'

const RecipeTime: FC<{recipeTime: DB_RecipeTime}> = ({recipeTime}) => {
  const {cook, cookUOM, inAdvance, inAdvanceUOM, prep, prepUOM, total, totalUOM} = recipeTime
  return (
    <table>
      <tr>
        <th>Cook</th>
        <th>In Advance</th>
        <th>Prep</th>
        <th>Total</th>
      </tr>
      <tr>
        <td>{`${cook} ${cookUOM}`}</td>
        <td>{`${inAdvance} ${inAdvanceUOM}`}</td>
        <td>{`${prep} ${prepUOM}`}</td>
        <td>{`${total} ${totalUOM}`}</td>
      </tr>
    </table>
  )
}

const Ingredients: FC<{ingredients: RecipeData['ingredients']}> = ({ingredients}) => {
  return (
    <ol>
      {ingredients.map(({name, elements}) => (
        <li>
          <h3>{name}</h3>
          <ol>
            {elements.map(({name}) => (
              <li>{name}</li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  )
}

const Steps: FC<{steps: RecipeData['steps']}> = ({steps}) => {
  return (
    <ol>
      {steps.map(({name, elements}) => (
        <li>
          <h3>{name}</h3>
          <ol>
            {elements.map(({text}) => (
              <li>{text}</li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  )
}

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
          <h3>Servings {recipeData.servings}</h3>
          <RecipeTime recipeTime={recipeData.time} />
          <Ingredients ingredients={recipeData.ingredients} />
          <Steps steps={recipeData.steps} />
        </div>
      )}
    </div>
  )
}
