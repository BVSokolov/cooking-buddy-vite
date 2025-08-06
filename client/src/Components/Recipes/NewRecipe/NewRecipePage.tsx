import type {FC, InputHTMLAttributes} from 'react'
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
} from '@shared/types/types'
import {QuantityUOM, TimeUOM} from '@shared/types/types'
import {useNewRecipeMutation} from '@/Hooks/Queries/Recipe/recipeQueries'

type useFieldArrayReturnIngredients = UseFieldArrayReturn<
  Partial<{ingredients: NewRecipeFormData['ingredients']}>,
  'ingredients',
  'id'
>
type useFieldArrayReturnSteps = UseFieldArrayReturn<
  Partial<{steps: NewRecipeFormData['steps']}>,
  'steps',
  'id'
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

const getDefaultSectionValues = (): NewRecipeSectionFormData => ({
  name: '',
  elementIds: [],
})

const getDefaultIngredientValues = (
  tempId: string,
  tempSectionId: string | null,
  index: number,
): NewRecipeIngredientFormData => ({
  tempId,
  name: '',
  amount: 0,
  //@ts-ignore TODO: remove this and fix the shared types
  amountUOM: QuantityUOM.ITEM,
  position: index,
  refId: null,
  tempSectionId: tempSectionId,
})

const getDefaultStepValues = (
  tempId: string,
  tempSectionId: string | null,
  index: number,
): NewRecipeStepFormData => ({
  tempId,
  text: '',
  position: index,
  tempSectionId,
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
  sections: {},
  ingredients: [],
  steps: [],
})

const Section = ({
  recipeBodyFieldIndex,
  recipeBodyFieldArray,
}: {
  recipeBodyFieldIndex: number
  recipeBodyFieldArray: useFieldArrayReturnIngredients | useFieldArrayReturnSteps
}) => {
  const {watch, setValue, unregister} = useFormContext()
  const {fields: recipeBodyFields} = recipeBodyFieldArray
  const {tempSectionId: elementTempSectionId, tempId: elementId} = recipeBodyFields.at(recipeBodyFieldIndex)!

  const sectionKey = `sections.${elementTempSectionId}`
  const elementIdsKey = `${sectionKey}.elementIds`
  const elementIds = watch(elementIdsKey) as string[]
  if (!elementIds || elementIds.at(0) !== elementId) return null

  const onClickRemoveSection = () => {
    elementIds.forEach((elementId) => {
      const elementIndex = recipeBodyFields.findIndex(({tempId}) => tempId === elementId)
      if ('amount' in recipeBodyFields[elementIndex]) {
        setValue(`ingredients.${elementIndex}.tempSectionId`, null)
      } else {
        setValue(`steps.${elementIndex}.tempSectionId`, null)
      }
    })
    unregister(sectionKey)
  }

  return (
    <div>
      <input type="button" value="remove" onClick={onClickRemoveSection} />
      <FormInput name={`${sectionKey}.name`} type="text" required />
    </div>
  )
}

type RemoveProperties = {
  fields:
    | FieldArrayWithId<Partial<{ingredients: NewRecipeFormData['ingredients']}>, 'ingredients', 'id'>[]
    | FieldArrayWithId<Partial<{steps: NewRecipeFormData['steps']}>, 'steps', 'id'>[]
  removeElement: UseFieldArrayRemove
}
const useRemoveIngredientOrStep = ({fields, removeElement}: RemoveProperties) => {
  const {watch, setValue, unregister} = useFormContext()

  const handleRemove = (index: number) => {
    const element = fields.at(index)
    if (!element) return

    const {tempSectionId, tempId: elementId} = element
    removeElement(index)
    if (tempSectionId === null) return

    const sectionKey = `sections.${tempSectionId}`
    const elementIdsKey = `${sectionKey}.elementIds`
    const elementIds = [...(watch(elementIdsKey) as string[])]
    const newElementIds = elementIds.filter((id) => id !== elementId)
    if (newElementIds.length === 0) {
      unregister(sectionKey)
      return
    }
    setValue(`${elementIdsKey}`, newElementIds)
  }
  return handleRemove
}

const useUpdateSectionElementIds = ({
  recipeBodyFieldArray,
}: {
  recipeBodyFieldArray: useFieldArrayReturnIngredients | useFieldArrayReturnSteps
}) => {
  const {setValue, watch} = useFormContext()
  const {fields} = recipeBodyFieldArray

  const handleUpdate = (tempElementId: string, tempSectionId?: string) => {
    const thisTempSectionId = tempSectionId
      ? tempSectionId
      : fields.at(-1) !== undefined
      ? fields.at(-1)!.tempSectionId
      : null

    if (thisTempSectionId !== null) {
      const key = `sections.${thisTempSectionId}.elementIds`
      setValue(key, [...(watch(key) as string[]), tempElementId])
    }
    return thisTempSectionId
  }
  return handleUpdate
}

const Ingredients = () => {
  const ingredientsFieldArray = useFieldArray<
    Partial<{ingredients: NewRecipeFormData['ingredients']}>,
    'ingredients',
    'id'
  >({
    name: 'ingredients',
  })
  const {fields: ingredientFields, append: appendIngredient, remove: removeIngredient} = ingredientsFieldArray
  const {setValue} = useFormContext()
  const handleRemove = useRemoveIngredientOrStep({
    fields: ingredientFields,
    removeElement: removeIngredient,
  })
  const handleUpdate = useUpdateSectionElementIds({recipeBodyFieldArray: ingredientsFieldArray})

  const onClickAddIngredient = (_e: React.MouseEvent, tempSectionId?: string) => {
    const tempIngredientId = crypto.randomUUID()
    const thisTempSectionId = handleUpdate(tempIngredientId, tempSectionId)
    appendIngredient(getDefaultIngredientValues(tempIngredientId, thisTempSectionId, ingredientFields.length))
  }

  const onClickAddSection = (e: React.MouseEvent) => {
    const tempSectionId = crypto.randomUUID()
    setValue(`sections.${tempSectionId}`, getDefaultSectionValues())
    onClickAddIngredient(e, tempSectionId)
  }

  const onClickRemoveIngredient = (index: number) => {
    handleRemove(index)
  }

  return (
    <div>
      <h4>Ingredients</h4>
      {ingredientFields.map((ingredientField, index) => {
        return (
          <div key={`${ingredientField.id}-row`}>
            <Section recipeBodyFieldArray={ingredientsFieldArray} recipeBodyFieldIndex={index} />
            <div key={`${ingredientField.id}-ingredient`}>
              <input type="button" value="remove" onClick={() => onClickRemoveIngredient(index)} />
              <FormInput name={`ingredients.${index}.name`} label="name" type="text" required />
              <FormInput name={`ingredients.${index}.amount`} label="amount" type="number" required />
              <FormSelect name={`ingredients.${index}.amountUOM`} required>
                {Object.entries(QuantityUOM).map(([key, value]) => (
                  <option key={`${ingredientField.id}-ingredient-amountuom-option-${key}`} value={value}>
                    {key}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>
        )
      })}
      <div>
        <input type="button" value="add section" onClick={onClickAddSection} />
        <input type="button" value="add ingredient" onClick={onClickAddIngredient} />

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

const Steps = () => {
  const stepsFieldArray = useFieldArray<Partial<{steps: NewRecipeFormData['steps']}>, 'steps', 'id'>({
    name: 'steps',
  })
  const {fields: stepFields, append: appendStep, remove: removeStep} = stepsFieldArray
  const {setValue} = useFormContext()
  const handleRemove = useRemoveIngredientOrStep({
    fields: stepFields,
    removeElement: removeStep,
  })
  const handleUpdate = useUpdateSectionElementIds({recipeBodyFieldArray: stepsFieldArray})

  const onClickAddStep = (_e: React.MouseEvent, tempSectionId?: string) => {
    const tempStepId = crypto.randomUUID()
    const thisTempSectionId = handleUpdate(tempStepId, tempSectionId)
    appendStep(getDefaultStepValues(tempStepId, thisTempSectionId, stepFields.length))
  }

  const onClickAddSection = (e: React.MouseEvent) => {
    const tempSectionId = crypto.randomUUID()
    setValue(`sections.${tempSectionId}`, getDefaultSectionValues())
    onClickAddStep(e, tempSectionId)
  }

  const onClickRemoveStep = (index: number) => {
    handleRemove(index)
  }

  return (
    <div>
      <h4>Steps</h4>
      {stepFields.map((stepField, index) => {
        return (
          <div key={`${stepField.id}-row`}>
            <Section recipeBodyFieldArray={stepsFieldArray} recipeBodyFieldIndex={index} />
            <div key={`${stepField.id}-step`}>
              <input type="button" value="remove" onClick={() => onClickRemoveStep(index)} />
              <FormInput name={`steps.${index}.text`} label={`${index + 1}.`} />
            </div>
          </div>
        )
      })}
      <div>
        <input type="button" value="add section" onClick={onClickAddSection} />
        <input type="button" value="add step" onClick={onClickAddStep} />
      </div>
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

const RecipeBody = () => {
  return (
    <div>
      <Ingredients />
      <Steps />
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
    if (newRecipeData.sections === undefined) newRecipeData.sections = {}
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
        <RecipeBody />
      </form>
    </FormProvider>
  )
}
