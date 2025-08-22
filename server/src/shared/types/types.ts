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

export type DB_Ingredient = {
  id: string
  name: string
}

export type DB_Recipe = {
  id: string
  name: string
  servings: number | null
}

export type DB_RecipeTime = {
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

export type DB_RecipeSection = {
  id: string
  recipeId: string
  name: string
  position: number
}

export type DB_RecipeIngredient = {
  id: string
  ingredientId: string
  recipeId: string
  recipeSectionId: string | null
  amount: number
  amountUOM: QuantityMeasureUnit
  position: number
}

export type DB_RecipeStep = {
  id: string
  recipeId: string
  recipeSectionId: string | null
  position: number
  text: string
}

export type NewRecipeMetaData = Omit<DB_Recipe, 'id'>

export type NewRecipeTimeData = Omit<DB_RecipeTime, 'id' | 'recipeId'>

export type NewRecipeIngredientData = {
  name: string
  amount: number
  amountUOM: QuantityMeasureUnit
  // refId: string | null
  position: number
}

export type NewRecipeStepData = {
  text: string
  position: number
}

export type RecipeIngredientRaw = DB_Ingredient & DB_RecipeIngredient
export type RecipeStepRaw = DB_RecipeStep
export type RecipeSectionRaw = DB_RecipeSection

export type NewRecipeSectionData<
  T extends
    | NewRecipeIngredientData
    | NewRecipeStepData
    | DB_RecipeIngredient
    | DB_RecipeStep
    | RecipeIngredientRaw
    | RecipeStepRaw,
> = {
  name: string
  position: number
  elements: Array<T>
}

export type RecipeBodySectionsDataNew<
  T extends NewRecipeIngredientData | NewRecipeStepData | DB_RecipeIngredient | DB_RecipeStep,
> = Array<NewRecipeSectionData<T>>

export type NewRecipeData = NewRecipeMetaData & {
  time: NewRecipeTimeData
  ingredients: RecipeBodySectionsDataNew<NewRecipeIngredientData>
  steps: RecipeBodySectionsDataNew<NewRecipeStepData>
}

// ==========================================================
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

export type RecipeDataRaw = DB_Recipe & {
  time: DB_RecipeTime
  sections: Array<RecipeSectionRaw>
  ingredients: Array<RecipeIngredientRaw>
  steps: Array<RecipeStepRaw>
}
