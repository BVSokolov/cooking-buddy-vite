import {Route, Routes, useNavigate} from 'react-router-dom'
import {Recipes} from './Recipes/Recipes'

const HomeComponent = () => {
  const navigate = useNavigate()

  const goToRecipes = () => {
    navigate('/recipes')
  }

  return (
    <div>
      asdasd
      <button onClick={(_e) => goToRecipes()}>Recipes</button>
    </div>
  )
}

export const Home = () => (
  <Routes>
    <Route path="/" element={<HomeComponent />} />
    <Route path="/recipes/*" element={<Recipes />} />
  </Routes>
)
