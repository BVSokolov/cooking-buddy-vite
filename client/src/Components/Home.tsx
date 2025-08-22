import {Route, Routes, useNavigate} from 'react-router-dom'
import {Recipes} from './Recipes/Recipes'

const HomeComponent = () => {
  const navigate = useNavigate()

  const goToRecipes = () => {
    navigate('recipes')
  }

  return (
    <div>
      <a href="" onClick={(_e) => goToRecipes()}>
        Recipes
      </a>
    </div>
  )
}

export const Home = () => {
  const navigate = useNavigate()
  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/recipes/*" element={<Recipes />} />
      </Routes>
    </div>
  )
}
