import type { PropertyType, PropertyVariable } from '@/types'

import { propertyVariables } from '@/variables/property'

type PropertyVariables = Partial<Record<PropertyVariable, string>>

export function assemble(property: string): PropertyVariables {
  const variables: PropertyVariables = {}
  if (!assert(property)) return variables

  const attribute = propertyVariables[property]
  const { dependencies = [], value, variable } = attribute

  if (dependencies.length) {
    for (const dependency of dependencies) {
      if (dependency === property) continue
      Object.assign(variables, assemble(dependency))
    }
  }

  if (value && variable) variables[variable] = value

  return variables
}

function assert(property: string): property is PropertyType {
  return property in propertyVariables
}
