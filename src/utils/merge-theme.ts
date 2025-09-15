export function mergeTheme(...themes: Array<Record<string, any> | undefined>) {
  return themes.reduce((acc = {}, theme = {}) => {
    return Object.assign(acc, theme);
  }, {} as Record<string, any>) ?? {};
}
