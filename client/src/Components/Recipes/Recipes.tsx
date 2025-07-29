import {Route, Routes} from 'react-router-dom'
import {NewRecipePage} from './NewRecipe/NewRecipePage'

export const Recipes = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<RecipesPage />} /> */}
      <Route path="/new" element={<NewRecipePage />} />
      {/* <Route path="/:index" element={<RecipePage />} /> */}
    </Routes>
  )
}
