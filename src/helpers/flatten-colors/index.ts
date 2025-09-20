type ColorPalette = Record<string, any>

/**
 * Flattens TailwindCSS color palette from nested object to flat object
 *
 * Converts { red: { 500: '#ef4444', DEFAULT: '#dc2626' } }
 * to { red: '#dc2626', 'red-500': '#ef4444' }
 */
export function flattenColors(palette?: ColorPalette, prefix = ''): ColorPalette {
  if (palette == null || typeof palette !== 'object') return {}

  return Object.entries(palette).reduce((vars, [key, value]) => {
    const group = [prefix, key].filter(Boolean).join('-')
    const isDefault = key.toUpperCase() === 'DEFAULT'
    const isCssValue = key === '__CSS_VALUES__'
    const cssVariable = isDefault ? prefix : group

    if (value == null) return vars
    if (typeof value === 'string') return { ...vars, [cssVariable]: value }
    return { ...vars, ...flattenColors(value, group) }
  }, {} as ColorPalette)
}
