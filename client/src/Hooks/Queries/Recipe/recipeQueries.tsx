import {api} from '@/api/api'
import type {
  NewRecipeData,
  Recipe,
  RecipeBodySectionsDataNew,
  RecipeIngredient,
  RecipeStep,
  RecipeTime,
} from '@shared/types/types'
import {useMutation, useQuery} from '@tanstack/react-query'
import _ from 'lodash'

export type RecipeData = Recipe & {
  time: RecipeTime
  ingredients: RecipeBodySectionsDataNew<RecipeIngredient>
  steps: RecipeBodySectionsDataNew<RecipeStep>
}

const useGetRecipes = () =>
  useQuery({
    queryKey: ['recipes'],
    queryFn: api.recipes.getRecipes,
  })

const useGetRecipe = (recipeId: Recipe['id']) =>
  useQuery<RecipeData>({
    queryKey: ['recipes', recipeId],
    queryFn: async (): Promise<RecipeData> => {
      const data = await api.recipes.getRecipe(recipeId)
      if (data.status !== 200)
        throw new Error(`Something went wrong fetching recipe. Error message: ${data.statusText}`)

      const {sections: sectionsRaw, ingredients: ingredientsRaw, steps: stepsRaw} = data.data
      const sections = _(sectionsRaw).keyBy('id').value()
      const ingredients = _(ingredientsRaw)
        .groupBy('recipeSectionId')
        .map((sectionIngredients, sectionId) => ({...sections[sectionId], elements: sectionIngredients}))
        .value()
      const steps = _(stepsRaw)
        .groupBy('recipeSectionId')
        .map((sectionSteps, sectionId) => ({...sections[sectionId], elements: sectionSteps}))
        .value()

      const recipeData = {...data.data, ingredients, steps}
      return recipeData
    },
  })

const useNewRecipeMutation = () =>
  useMutation({
    mutationFn: (recipeData: NewRecipeData) => api.recipes.putRecipe(recipeData),
  })

export {useGetRecipes, useGetRecipe, useNewRecipeMutation}
