type Item = false | null | string | undefined

export function join(...list: Array<Item>): string {
  return list.filter(Boolean).join(' ')
}
