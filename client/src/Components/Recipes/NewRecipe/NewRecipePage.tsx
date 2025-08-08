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

type AppendSectionElementIdFn = (tempSectionId: string, tempElementId: string, isNewElement?: boolean) => void
type RemoveSectionElementIdFn = (tempSectionId: string, tempElementId: string) => void
type SortSectionElementIdsFn = (tempSectionId: string) => void
const useSections = (elementsFieldArray: useFieldArrayReturnIngredients | useFieldArrayReturnSteps) => {
  const {watch, setValue, unregister} = useFormContext()

  const _getElementIndex = (elementId: string, tempElementId?: string, isNewElement?: boolean) => {
    const {fields: elementFields} = elementsFieldArray
    if (elementId === tempElementId && isNewElement) return elementFields.length
    else return elementFields.findIndex(({tempId}) => tempId === elementId)
  }

  const _getSortedElementIds = (key: string, tempElementId?: string, isNewElement?: boolean) => {
    const elementIds = tempElementId
      ? [...(watch(key) as string[]), tempElementId]
      : [...(watch(key) as string[])]
    // sort the elements
    // get the index of tempElementId in elementFields

    const sortedElementIds = [...elementIds].sort((leftId, rightId) => {
      console.log(
        `(${leftId} ${_getElementIndex(leftId, tempElementId, isNewElement)}), (${rightId} ${_getElementIndex(
          rightId,
          tempElementId,
          isNewElement,
        )})`,
      )
      return (
        _getElementIndex(leftId, tempElementId, isNewElement) -
        _getElementIndex(rightId, tempElementId, isNewElement)
      )
    })
    // for each element id
    // get its index in elementFields and compare to index of this element
    console.log(`[${elementIds}], [${sortedElementIds}]`)
    return sortedElementIds
  }

  const createSection = () => {
    const tempSectionId = crypto.randomUUID()
    setValue(`sections.${tempSectionId}`, getDefaultSectionValues())
    return tempSectionId
  }

  const sortElementIds: SortSectionElementIdsFn = (tempSectionId: string) => {
    const key = `sections.${tempSectionId}.elementIds`
    const sortedElementIds = _getSortedElementIds(key)
    setValue(key, sortedElementIds)
  }

  const appendElementId: AppendSectionElementIdFn = (tempSectionId, tempElementId, isNewElement) => {
    const key = `sections.${tempSectionId}.elementIds`
    const sortedElementIds = _getSortedElementIds(key, tempElementId, isNewElement)
    setValue(key, sortedElementIds)
  }

  const removeElementId: RemoveSectionElementIdFn = (tempSectionId, tempElementId) => {
    const sectionKey = `sections.${tempSectionId}`
    const elementIdsKey = `${sectionKey}.elementIds`
    const elementIds = [...(watch(elementIdsKey) as string[])]
    const newElementIds = elementIds.filter((id) => id !== tempElementId)
    if (newElementIds.length === 0) {
      unregister(sectionKey)
      return
    }
    setValue(`${elementIdsKey}`, newElementIds)
  }

  return {
    createSection,
    appendElementId,
    removeElementId,
    sortElementIds,
  }
}

type AppendElementFn = (
  elementsFieldArray: useFieldArrayReturnIngredients | useFieldArrayReturnSteps,
  appendSectionElementIdFn: AppendSectionElementIdFn,
  getDefaultValuesFn: any,
  newTempSectionId?: string,
  getDefaultValuesParams?: any[],
) => void

const c_appendElement: AppendElementFn = (
  elementsFieldArray,
  appendSectionElementIdFn,
  getDefaultValuesFn,
  newTempSectionId,
  getDefaultValuesParams = [],
) => {
  const getElementSectionId = () => {
    const {fields: elementFields} = elementsFieldArray
    return newTempSectionId
      ? newTempSectionId
      : elementFields.at(-1) !== undefined
      ? elementFields.at(-1)!.tempSectionId
      : null
  }

  const {append: appendElement} = elementsFieldArray
  const tempElementId = crypto.randomUUID()
  const tempSectionId = getElementSectionId()
  appendElement(getDefaultValuesFn(tempElementId, tempSectionId, ...getDefaultValuesParams))
  tempSectionId && appendSectionElementIdFn(tempSectionId, tempElementId, true)
}

type RemoveElementFn = (
  elementsFieldArray: useFieldArrayReturnIngredients | useFieldArrayReturnSteps,
  index: number,
  removeElementIdFromSectionFn: RemoveSectionElementIdFn,
) => void

const c_removeElement: RemoveElementFn = (elementsFieldArray, index, removeElementIdFromSectionFn) => {
  const {fields, remove: removeElement} = elementsFieldArray
  const element = fields.at(index)
  if (!element) return

  const {tempSectionId, tempId: tempElementId} = element
  removeElement(index)
  if (tempSectionId === null) return

  removeElementIdFromSectionFn(tempSectionId, tempElementId)
}

type MoveElementFn = (
  elementsFieldArray: useFieldArrayReturnIngredients | useFieldArrayReturnSteps,
  index: number,
  up: boolean,
  appendElementIdToSectionFn: AppendSectionElementIdFn,
  removeElementIdFromSectionFn: RemoveSectionElementIdFn,
  sortElementIdsFn: SortSectionElementIdsFn,
  setValue: any,
) => void

const c_moveElement: MoveElementFn = (
  elementsFieldArray,
  index,
  up,
  appendElementIdToSectionFn,
  removeElementIdFromSectionFn,
  sortElementIdsFn,
  setValue,
) => {
  const {fields: elementFields, move: moveElement, update: updateElement} = elementsFieldArray
  // first we get the target index
  const targetIndex = (up ? index + elementFields.length - 1 : index + 1) % elementFields.length // we add the length if we're going down to make sure we never get a negative value
  console.log(`up ${up}, index ${index}, targetIndex ${targetIndex}`)
  const element = elementFields.at(index)
  if (!element) return

  // we get the section id of the element at the target index
  const targetTempSectionId = elementFields.at(targetIndex)!.tempSectionId
  // we get the temp section id of the current element
  const tempSectionId = element.tempSectionId
  // if they are the same - move the element
  if (targetTempSectionId === tempSectionId) {
    console.log('same section')
    moveElement(index, targetIndex)
    tempSectionId && sortElementIdsFn(tempSectionId)
  } else {
    // if not - do not move the element, instead
    // update elementIds for the old section of the current element
    tempSectionId && removeElementIdFromSectionFn(tempSectionId, element.tempId)
    // AND the elementIds for the new section
    targetTempSectionId && appendElementIdToSectionFn(targetTempSectionId, element.tempId)
    // @ts-ignore assign the target section id to the current element TODO REMMOVE THE TS IGNORE AND DO THE CHECK CORRECTLY
    updateElement(index, {...element, tempSectionId: targetTempSectionId})
    // setValue(`ingredients.${index}.tempSectionId`, targetTempSectionId)
  }
}

const Ingredients = () => {
  const ingredientsFieldArray = useFieldArray<
    Partial<{ingredients: NewRecipeFormData['ingredients']}>,
    'ingredients',
    'id'
  >({
    name: 'ingredients',
  })
  const {fields: ingredientFields} = ingredientsFieldArray
  const {createSection, appendElementId, removeElementId, sortElementIds} = useSections(ingredientsFieldArray)
  const {setValue} = useFormContext()

  const onClickAddIngredient = (_e: React.MouseEvent, tempSectionId?: string) => {
    c_appendElement(ingredientsFieldArray, appendElementId, getDefaultIngredientValues, tempSectionId)
  }

  const onClickAddSection = (e: React.MouseEvent) => {
    const tempSectionId = createSection()
    onClickAddIngredient(e, tempSectionId)
  }

  const onClickRemoveIngredient = (index: number) => {
    c_removeElement(ingredientsFieldArray, index, removeElementId)
  }

  const onClickMoveIngredient = (index: number, up: boolean) => {
    c_moveElement(
      ingredientsFieldArray,
      index,
      up,
      appendElementId,
      removeElementId,
      sortElementIds,
      setValue,
    )
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
              <input type="button" value="move up" onClick={() => onClickMoveIngredient(index, true)} />
              <input type="button" value="move down" onClick={() => onClickMoveIngredient(index, false)} />
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

  const onClickAddStep = (_e: React.MouseEvent, tempSectionId?: string) => {
    // const tempStepId = crypto.randomUUID()
    // const thisTempSectionId = handleUpdate(tempStepId, tempSectionId)
    // appendStep(getDefaultStepValues(tempStepId, thisTempSectionId, stepFields.length))
  }

  const onClickAddSection = (e: React.MouseEvent) => {
    const tempSectionId = crypto.randomUUID()
    setValue(`sections.${tempSectionId}`, getDefaultSectionValues())
    onClickAddStep(e, tempSectionId)
  }

  const onClickRemoveStep = (index: number) => {
    // handleRemove(index)
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
