export function toOklch(color: string, alpha: string) {
  return `oklch(from ${color} l c h / ${alpha})`
}
