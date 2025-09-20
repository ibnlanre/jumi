export function merge(...values: Array<Record<string, any> | undefined>) {
  return (
    values.reduce<Record<string, any>>(
      (acc, value) => Object.assign({ ...acc }, { ...value }),
      {} as Record<string, any>,
    )
  )
}
