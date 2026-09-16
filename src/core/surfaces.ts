import type {
  AnimatableStandardPropertyType,
  PropertyParts,
  PropertyType,
} from '@/types'

/**
 * The properties a candidate's declaration makes addressable: its parts, or **the attribute itself** when
 * it declares none.
 *
 * A candidate declared `property('scale')` — no parts — writes `--jumi-scale-<id>-<offset>`, the
 * attribute's *own* frame key. That is the key a frame's outer read asks for, so the attribute is a writer
 * surface for itself, and it is recorded for exactly the reason each part is: a keyframe body asks whether
 * a writer **class** exists, and "a candidate declares the attribute with no parts" is one of them.
 *
 * Not recording it is what makes a shared definition dishonest. Without the fact, a body cannot ask
 * whether an outer read has any writer, so the read has to be emitted for some candidates and not others —
 * and which body a shared id gets then depends on which candidate happened to be compiled first. Measured
 * 2026-09-16: `animate-scale-[0:1|100:2] animate-scale-x-[0:1|100:2]` and the same pair reversed emitted
 * different `@keyframes jumi-scale-<id>` bodies, and computed `scale: 2` against `scale: 2 1`.
 *
 * Two properties of this function are load-bearing rather than incidental, and both are the same rule the
 * `surfaces` map exists under:
 *
 * - It answers from the **declaration**, not from use. The question is about classes, so a candidate that
 *   is registered but never matched is exactly as relevant as one that is.
 * - It is a pure function of `(attribute, parts)`. Nothing that builds a keyframe body may depend on which
 *   candidate is running, because two candidates can share one id and therefore one definition.
 */
export const surfacesOf = (
  attribute: AnimatableStandardPropertyType,
  parts: PropertyParts = [],
): PropertyType[] =>
  parts.length
    ? parts.map(part => (Array.isArray(part) ? part[0] : part))
    : [attribute as PropertyType]
