export enum TimeUOM {
  NONE = 'none',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum QuantityUOM {
  GR = 'gr',
  KG = 'kg',
  TSP = 'tsp',
  TBSP = 'Tbsp',
  L = 'l',
  ML = 'ml',
  ITEM = 'item',
  CUP = 'cup',
  PINCH = 'pinch',
}

export type TimeMeasureUnit = Record<TimeUOM, string>
export type QuantityMeasureUnit = Record<QuantityUOM, string>

export type Ingredient = {
  id: string
  name: string
}

export type Recipe = {
  id: string
  name: string
  servings: number | null
}

export type RecipeTime = {
  id: string
  recipeId: string
  inAdvance: number | null
  prep: number | null
  cook: number | null
  total: number | null
  inAdvanceUOM: TimeMeasureUnit
  prepUOM: TimeMeasureUnit
  cookUOM: TimeMeasureUnit
  totalUOM: TimeMeasureUnit
}

export type RecipeSection = {
  id: string
  recipeId: string
  name: string
}

export type RecipeIngredient = {
  id: string
  ingredientId: string
  recipeId: string
  recipeSectionId: string | null
  amount: number
  amountUOM: QuantityMeasureUnit
  position: number
}

export type RecipeStep = {
  id: string
  recipeId: string
  recipeSectionId: string | null
  position: number
  text: string
}

export type NewRecipeSectionFormData = {
  name: string
  elementIds: Array<string>
  // tempSectionId: string | null // add color or whatever later, needs to be stored in db as well
}

export type NewRecipeIngredientFormData = {
  tempId: string
  name: string
  amount: number
  amountUOM: QuantityMeasureUnit
  tempSectionId: string | null //current time millis when section was created
  position: number
  refId: string | null
}

export type NewRecipeStepFormData = {
  tempId: string
  text: string
  position: number
  tempSectionId: string | null
}

// i should probably move this outside of shared after the changes
export type NewRecipeFormData = Omit<Recipe, 'id'> & {
  time: Omit<RecipeTime, 'id' | 'recipeId'>
  sections: Record<string, NewRecipeSectionFormData>
  ingredients: Array<NewRecipeIngredientFormData>
  steps: Array<NewRecipeStepFormData>
}

//=> on fronted only:
//counter = 0
// ref = {'ref<counter>'}
// ref = {ref0, ref1}
//<= on fronted only:

// step 1: chop the onion
// text : chop the ref0
// step 2: chop the garlic and throw the garlic and onion in the pan
// text : chop the ref1 and throw the ref1 and ref0 in the pan

// ingredients: [{name: onion, refId: ref0}, {name: garlic, refId: ref1}, {name: tomato, refId: null}]
// steps: [{text: chop the ref0, position: 0, sectionIndex: null},
//        {text: chop the ref1 and throw the ref1 and ref0 in the pan, position: 1, sectionIndex: null}]

export type RecipeData = Recipe &
  RecipeTime &
  Array<RecipeSection> &
  Array<RecipeIngredient> &
  Array<RecipeStep>
