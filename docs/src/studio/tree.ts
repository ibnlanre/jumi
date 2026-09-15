import type { SceneNode } from './model'

export const flatten = (root: SceneNode): SceneNode[] => [
  root,
  ...root.children.flatMap(flatten),
]
export function parentOf(root: SceneNode, id: string): SceneNode | undefined {
  return flatten(root).find(n => n.children.some(c => c.id === id))
}
