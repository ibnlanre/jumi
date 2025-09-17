/**
 * Flattens TailwindCSS color palette from nested object to flat object
 * Converts { red: { 500: '#ef4444', DEFAULT: '#dc2626' } }
 * to { red: '#dc2626', 'red-500': '#ef4444' }
 */
export const flattenColorPalette = (colors: Record<string, any>): Record<string, string> => {
  const result: Record<string, string> = {}

  const flatten = (obj: Record<string, any>, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      if (value != null && typeof value === 'object' && !Array.isArray(value)) {
        const nestedFlat = flattenColorPalette(value)

        for (const [nestedKey, nestedValue] of Object.entries(nestedFlat)) {
          const finalKey = nestedKey === 'DEFAULT' || nestedKey === key
            ? key
            : `${key}-${nestedKey}`
          result[finalKey] = nestedValue
        }
      }
      else {
        result[key] = value
      }
    }
  }

  if (colors != null) {
    flatten(colors)
  }

  return result
}
