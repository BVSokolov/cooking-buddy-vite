import {api} from '@/api/api'
import {useMutation, useQuery} from '@tanstack/react-query'

const useGetRecipes = () =>
  useQuery({
    queryKey: ['recipes'],
    queryFn: api.recipes.getRecipes,
  })

const useNewRecipeMutation = () =>
  useMutation({
    mutationFn: (recipeData: {}) => api.recipes.putRecipe(recipeData),
  })

export {useGetRecipes, useNewRecipeMutation}
