import type { Collection, CssInJs } from '@/types'

export function animate(collection: CssInJs): Collection<CssInJs> {
  return { '.animate': collection }
}
