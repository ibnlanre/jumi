import type { PropertyType, PropertyVariable } from '@/types'

import { propertyVariables } from '@/variables/property'

type PropertyVariables = Partial<Record<PropertyVariable, string>>

export function assemble(property: PropertyType): PropertyVariables {
  const variables: PropertyVariables = {}
  const attribute = propertyVariables[property]

  if (typeof attribute !== 'object') return variables
  const dependencies = attribute.dependencies || []

  if (dependencies.length) {
    for (const dependency of dependencies) {
      if (dependency === property) continue
      Object.assign(variables, assemble(dependency))
    }
  }

  if (attribute.value) {
    variables[attribute.variable] = attribute.value
  }

  return variables
}
