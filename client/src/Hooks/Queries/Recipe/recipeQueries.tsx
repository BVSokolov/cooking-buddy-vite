import {api} from '@/api/api'
import type {
  NewRecipeData,
  DB_Recipe,
  DB_RecipeTime,
  RecipeStepRaw,
  RecipeIngredientRaw,
  RecipeBodySectionsDataNew,
} from '@shared/types/types'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import _ from 'lodash'

const queryClient = useQueryClient()

export type RecipeData = DB_Recipe & {
  time: DB_RecipeTime
  ingredients: RecipeBodySectionsDataNew<RecipeIngredientRaw>
  steps: RecipeBodySectionsDataNew<RecipeStepRaw>
}

const queryKeys = {
  getRecipes: () => ['recipes'],
  getRecipe: (recipeId: DB_Recipe['id']) => ['recipes', recipeId],
}

const useGetRecipes = () =>
  useQuery({
    queryKey: queryKeys.getRecipes(),
    queryFn: api.recipes.getRecipes,
  })

const useGetRecipe = (recipeId: DB_Recipe['id']) =>
  useQuery<RecipeData>({
    queryKey: queryKeys.getRecipe(recipeId),
    queryFn: async (): Promise<RecipeData> => {
      const data = await api.recipes.getRecipe(recipeId)
      if (data.status !== 200)
        throw new Error(`Something went wrong fetching recipe. Error message: ${data.statusText}`)

      const {sections: sectionsRaw, ingredients: ingredientsRaw, steps: stepsRaw} = data.data
      const sections = _(sectionsRaw).keyBy('id').value()
      const ingredients = _(ingredientsRaw)
        .groupBy('recipeSectionId')
        .map((sectionIngredients, sectionId) => ({...sections[sectionId], elements: sectionIngredients}))
        .orderBy('position')
        .value()
      const steps = _(stepsRaw)
        .groupBy('recipeSectionId')
        .map((sectionSteps, sectionId) => ({...sections[sectionId], elements: sectionSteps}))
        .orderBy('position')
        .value()

      const {id, name, servings, time} = data.data
      const recipeData: RecipeData = {id, name, servings, time, ingredients, steps}
      return recipeData
    },
  })

const useNewRecipeMutation = () =>
  useMutation({
    mutationFn: (recipeData: NewRecipeData) => api.recipes.putRecipe(recipeData),
    onSuccess: () => queryClient.invalidateQueries({queryKey: queryKeys.getRecipes()}),
  })

const useDeleteRecipeMutation = () =>
  useMutation({
    mutationFn: (recipeId: DB_Recipe['id']) => api.recipes.deleteRecipe(recipeId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: queryKeys.getRecipes()}),
  })

export {useGetRecipes, useGetRecipe, useNewRecipeMutation, useDeleteRecipeMutation}
