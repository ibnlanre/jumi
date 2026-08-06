/**
 * Generates a stable, very short, suffixable id from an arbitrary value.
 *
 * The value can contain characters that are invalid inside a CSS keyframe
 * name (slashes, spaces, brackets, commas, etc.). This hashes the value
 * deterministically into a short base-36 slug so the same value always
 * maps to the same id, and the result is safe to append to a `jumi-` name.
 */

const BASE = 36
const LENGTH = 6

export function shortId(value: string): string {
  let hash = 2166136261 // FNV-1a 32-bit offset basis

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619) // FNV-1a 32-bit prime
  }

  // Normalize to a positive 32-bit unsigned integer.
  const uint = hash >>> 0

  return uint.toString(BASE).slice(0, LENGTH)
}
