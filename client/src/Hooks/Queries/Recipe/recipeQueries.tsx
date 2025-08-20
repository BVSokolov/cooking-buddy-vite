import {api} from '@/api/api'
import type {NewRecipeData} from '@shared/types/types'
import {useMutation, useQuery} from '@tanstack/react-query'

const useGetRecipes = () =>
  useQuery({
    queryKey: ['recipes'],
    queryFn: api.recipes.getRecipes,
  })

const useNewRecipeMutation = () =>
  useMutation({
    mutationFn: (recipeData: NewRecipeData) => api.recipes.putRecipe(recipeData),
  })

export {useGetRecipes, useNewRecipeMutation}
