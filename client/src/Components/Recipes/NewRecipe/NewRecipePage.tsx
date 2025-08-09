import {useEffect, useState, type FC, type InputHTMLAttributes} from 'react'
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldArrayWithId,
  type UseFieldArrayRemove,
  type UseFieldArrayReturn,
} from 'react-hook-form'
import type {
  NewRecipeFormData,
  NewRecipeIngredientFormData,
  NewRecipeSectionFormData,
  NewRecipeStepFormData,
  RecipeBodySectionsFormData,
} from '@shared/types/types'
import {QuantityUOM, TimeUOM} from '@shared/types/types'
import {useNewRecipeMutation} from '@/Hooks/Queries/Recipe/recipeQueries'

type RecipeBodyFieldArray<T extends NewRecipeIngredientFormData | NewRecipeStepFormData> = Partial<
  T extends NewRecipeIngredientFormData
    ? {
        ingredients: RecipeBodySectionsFormData<NewRecipeIngredientFormData>
      }
    : {
        steps: RecipeBodySectionsFormData<NewRecipeStepFormData>
      }
>

type useFieldArrayReturnIngredients = UseFieldArrayReturn<
  RecipeBodyFieldArray<NewRecipeIngredientFormData>,
  `ingredients.${number}.elements`,
  'field_id'
>

type useFieldArrayReturnSteps = UseFieldArrayReturn<
  RecipeBodyFieldArray<NewRecipeStepFormData>,
  `steps.${number}.elements`,
  'field_id'
>

//==> TODO Move these elsewhere
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
}

interface FormSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  name: string
  label?: string
}

const FormInput: FC<FormInputProps> = ({name, label, ...props}) => {
  const {register} = useFormContext()
  return (
    <>
      {label && <label htmlFor={name}>{label}</label>}
      <input key={name} {...register(name)} {...props} />
    </>
  )
}

const FormSelect: FC<FormSelectProps> = ({name, label, children, ...props}) => {
  const {register} = useFormContext()
  return (
    <>
      {label && <label htmlFor={name}>{label}</label>}
      <select key={name} {...register(name)} {...props}>
        {children}
      </select>
    </>
  )
}
// <==

type GetDefaultSectionValues<T extends NewRecipeIngredientFormData | NewRecipeStepFormData> =
  () => NewRecipeSectionFormData<
    T extends NewRecipeIngredientFormData ? NewRecipeIngredientFormData : NewRecipeStepFormData
  >
const getDefaultSectionValues: GetDefaultSectionValues<
  NewRecipeIngredientFormData | NewRecipeStepFormData
> = () => ({
  name: '',
  elements: [],
})

const getDefaultIngredientValues = (index: number): NewRecipeIngredientFormData => ({
  name: '',
  amount: 0,
  //@ts-ignore TODO: remove this and fix the shared types
  amountUOM: QuantityUOM.ITEM,
  position: index,
  refId: null,
})

const getDefaultStepValues = (index: number): NewRecipeStepFormData => ({
  text: '',
  position: index,
})

const getDefaultValues = (): NewRecipeFormData => ({
  name: '',
  servings: null,
  time: {
    cook: null,
    inAdvance: null,
    prep: null,
    total: null,
    //@ts-ignore TODO: remove this and fix the shared types
    cookUOM: TimeUOM.NONE,
    //@ts-ignore TODO: remove this and fix the shared types
    inAdvanceUOM: TimeUOM.NONE,
    //@ts-ignore TODO: remove this and fix the shared types
    prepUOM: TimeUOM.NONE,
    //@ts-ignore TODO: remove this and fix the shared types
    totalUOM: TimeUOM.NONE,
  },
  ingredients: [],
  steps: [],
})

type MoveArrayField = (
  fieldArray: UseFieldArrayReturn<any, any, 'field_id'>,
  index: number,
  up: boolean,
) => void
const moveArrayField: MoveArrayField = (fieldArray, index, up) => {
  const {fields: elementFields, move: moveElement} = fieldArray
  const targetIndex = (up ? index + elementFields.length - 1 : index + 1) % elementFields.length // we add the length if we're going down to make sure we never get a negative value
  console.log(`up ${up}, index ${index}, targetIndex ${targetIndex}`)

  console.log('same section')
  moveElement(index, targetIndex)
}

type RecipeBodySectionFieldProps = {index: number}

type IngredientSectionProps = RecipeBodySectionFieldProps
const IngredientSection: FC<IngredientSectionProps> = ({index: sectionIndex}) => {
  const ELEMENTS_KEY = `ingredients.${sectionIndex}.elements`

  const sectionElementsFieldArray = useFieldArray<
    RecipeBodyFieldArray<NewRecipeIngredientFormData>,
    `ingredients.${number}.elements`,
    'field_id'
  >({
    name: `ingredients.${sectionIndex}.elements`,
    keyName: 'field_id',
  })
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = sectionElementsFieldArray

  const onClickAddIngredient = () => {
    appendIngredient(getDefaultIngredientValues(ingredientFields.length))
  }

  const onClickRemoveIngredient = (index: number) => {
    removeIngredient(index)
  }

  const onClickMoveIngredient = (index: number, up: boolean) => {
    moveArrayField(sectionElementsFieldArray, index, up)
  }

  return (
    <div>
      <div>
        <FormInput name={`ingredients.${sectionIndex}.name`} type="text" required />
      </div>
      {ingredientFields.map(({field_id}, index) => (
        <div key={`${field_id}-ingredient`}>
          <input type="button" value="remove" onClick={() => onClickRemoveIngredient(index)} />
          <input type="button" value="move up" onClick={() => onClickMoveIngredient(index, true)} />
          <input type="button" value="move down" onClick={() => onClickMoveIngredient(index, false)} />
          <FormInput name={`${ELEMENTS_KEY}.${index}.name`} label="name" type="text" required />
          <FormInput name={`${ELEMENTS_KEY}.${index}.amount`} label="amount" type="number" required />
          <FormSelect name={`${ELEMENTS_KEY}.${index}.amountUOM`} required>
            {Object.entries(QuantityUOM).map(([key, value]) => (
              <option key={`${field_id}-ingredient-amountuom-option-${key}`} value={value}>
                {key}
              </option>
            ))}
          </FormSelect>
        </div>
      ))}
      <input type="button" value="add ingredient" onClick={onClickAddIngredient} />
    </div>
  )
}

type StepSectionProps = RecipeBodySectionFieldProps
const StepSection: FC<StepSectionProps> = ({index: sectionIndex}) => {
  const ELEMENTS_KEY = `steps.${sectionIndex}.elements`

  const sectionElementsFieldArray = useFieldArray<
    RecipeBodyFieldArray<NewRecipeStepFormData>,
    `steps.${number}.elements`,
    'field_id'
  >({
    name: `steps.${sectionIndex}.elements`,
    keyName: 'field_id',
  })
  const {fields: stepFields, append: appendStep, remove: removeStep} = sectionElementsFieldArray

  const onClickAddStep = () => {
    appendStep(getDefaultStepValues(stepFields.length))
  }

  const onClickRemoveStep = (index: number) => {
    removeStep(index)
  }

  const onClickMoveStep = (index: number, up: boolean) => {
    moveArrayField(sectionElementsFieldArray, index, up)
  }

  return (
    <div>
      <div>
        <FormInput name={`steps.${sectionIndex}.name`} type="text" required />
      </div>
      {stepFields.map(({field_id}, index) => (
        <div>
          <div key={`${field_id}-step`}>
            <input type="button" value="remove" onClick={() => onClickRemoveStep(index)} />
            <input type="button" value="move up" onClick={() => onClickMoveStep(index, true)} />
            <input type="button" value="move down" onClick={() => onClickMoveStep(index, false)} />
            <FormInput name={`${ELEMENTS_KEY}.${index}.text`} label={`${index + 1}.`} />
          </div>
        </div>
      ))}

      <input type="button" value="add step" onClick={onClickAddStep} />
    </div>
  )
}

type RecipeBodySectionsProps<T extends NewRecipeIngredientFormData | NewRecipeStepFormData> = {
  sectionsFieldArray: T extends NewRecipeIngredientFormData
    ? UseFieldArrayReturn<Partial<{ingredients: NewRecipeFormData['ingredients']}>, 'ingredients', 'field_id'>
    : UseFieldArrayReturn<Partial<{steps: NewRecipeFormData['steps']}>, 'steps', 'field_id'>
  SectionElementComponent: FC<
    T extends NewRecipeIngredientFormData ? IngredientSectionProps : StepSectionProps
  >
}
const RecipeBodySections: FC<
  RecipeBodySectionsProps<NewRecipeIngredientFormData | NewRecipeStepFormData>
> = ({sectionsFieldArray, SectionElementComponent}) => {
  const {fields: sectionFields, append: appendSection, remove: removeSection} = sectionsFieldArray

  const onClickAddSection = () => {
    //@ts-ignore TODO: i don't know how to fix this and i've ran out of fucks to give
    appendSection(getDefaultSectionValues())
  }

  const onClickRemoveSection = (index: number) => {
    removeSection(index)
  }

  const onClickMoveSection = (index: number, up: boolean) => {
    moveArrayField(sectionsFieldArray, index, up)
  }

  return (
    <div>
      {sectionFields.map(({field_id}, index) => {
        return (
          <div key={`${field_id}-section`}>
            <input type="button" value="remove" onClick={() => onClickRemoveSection(index)} />
            <input type="button" value="move up" onClick={() => onClickMoveSection(index, true)} />
            <input type="button" value="move down" onClick={() => onClickMoveSection(index, false)} />
            <SectionElementComponent index={index} />
          </div>
        )
      })}
      <div>
        <input type="button" value="add section" onClick={onClickAddSection} />

        {/* <button type="button" onClick={onClickAddIngredient}>
          add ingredient
        </button>
        <button type="button" onClick={onClickAddSection}>
          add section
        </button> */}
      </div>
    </div>
  )
}

const Ingredients = () => {
  const ingredientSectionsFieldArray = useFieldArray<
    Partial<{ingredients: NewRecipeFormData['ingredients']}>,
    'ingredients',
    'field_id'
  >({
    name: 'ingredients',
    keyName: 'field_id',
  })

  return (
    <div>
      <h4>Ingredients</h4>
      <RecipeBodySections
        sectionsFieldArray={ingredientSectionsFieldArray}
        SectionElementComponent={IngredientSection}
      />
    </div>
  )
}

const Steps = () => {
  const stepSectionsFieldArray = useFieldArray<
    Partial<{steps: NewRecipeFormData['steps']}>,
    'steps',
    'field_id'
  >({
    name: 'steps',
    keyName: 'field_id',
  })

  return (
    <div>
      <h4>Steps</h4>
      <RecipeBodySections sectionsFieldArray={stepSectionsFieldArray} SectionElementComponent={StepSection} />
    </div>
  )
}

const TimeEntry = ({name, nameUOM, label}: {name: string; nameUOM: string; label: string}) => {
  return (
    <span>
      <FormInput name={`time.${name}`} label={label} type="number" />
      <FormSelect name={`time.${nameUOM}`} required>
        {Object.entries(TimeUOM).map(([key, value]) => (
          <option key={`time-${name}-timeuom-option-${key}`} value={value}>
            {key}
          </option>
        ))}
      </FormSelect>
    </span>
  )
}

const Time = () => {
  return (
    <div>
      <TimeEntry name="inAdvance" nameUOM="inAdvanceUOM" label="Time in advance to prepare" />
      <TimeEntry name="prep" nameUOM="prepUOM" label="Prep time" />
      <TimeEntry name="cook" nameUOM="cookUOM" label="Cook time" />
      <TimeEntry name="total" nameUOM="totalUOM" label="Total time" />
    </div>
  )
}

export const NewRecipePage = () => {
  // TODO to use elsewhere later
  // const {isLoading, data} = useGetRecipes()
  const mutation = useNewRecipeMutation()
  const methods = useForm<NewRecipeFormData>({
    defaultValues: getDefaultValues(),
  })
  const {handleSubmit} = methods

  const onSubmit = (formData: NewRecipeFormData) => {
    const newRecipeData = {...formData}
    // if (newRecipeData.sections === undefined) newRecipeData.sections = {}
    // TODO also go over the ingredients and steps and make sure their positions are correct

    alert(JSON.stringify(formData, null, '\t'))
    // mutation.mutate(formData)
  }

  return (
    <FormProvider {...methods}>
      <h3>New Recipe</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <FormInput name="name" label="Recipe name" type="text" required />
          <FormInput name="servings" label="Serves" type="number" />
          <input type="submit" value="Save" />
        </div>
        <Time />
        <Ingredients />
        <Steps />
      </form>
    </FormProvider>
  )
}
