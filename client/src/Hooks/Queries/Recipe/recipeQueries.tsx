import {api} from '@/api/api'
import type {
  NewRecipeData,
  DB_Recipe,
  RecipeBodySectionsDataNew,
  DB_RecipeIngredient,
  DB_RecipeStep,
  DB_RecipeTime,
} from '@shared/types/types'
import {useMutation, useQuery} from '@tanstack/react-query'
import _ from 'lodash'

export type RecipeData = DB_Recipe & {
  time: DB_RecipeTime
  ingredients: RecipeBodySectionsDataNew<DB_RecipeIngredient>
  steps: RecipeBodySectionsDataNew<DB_RecipeStep>
}

const useGetRecipes = () =>
  useQuery({
    queryKey: ['recipes'],
    queryFn: api.recipes.getRecipes,
  })

const useGetRecipe = (recipeId: DB_Recipe['id']) =>
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
