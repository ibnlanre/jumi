import { getMatchTween } from '../../../src/properties/tween';
import { getMatchControls } from '../../../src/properties/controls';
import { nameable } from '../../../src/core';
import type { Creator } from '../../../src/types';

export type PropertyEntry = { utility: string; attribute: string; parts: string[]; types: string[]; values: string[]; group: string; nameable: boolean };
export type ControlEntry = { utility: string; types: string[]; values: string[] };
const group = (s: string) => {
  if (/^(offset|motion)/.test(s)) return 'Motion path';
  if (/^(perspective|backface|transform-style)/.test(s)) return 'Perspective & 3D';
  if (/^(transform|translate|rotate|scale|skew|matrix)/.test(s)) return 'Transform';
  if (/^(fill|stroke|cx$|cy$|r$|rx$|ry$|d$|x$|y$|stop-|flood-|lighting-|paint-|vector)/.test(s)) return 'SVG';
  if (/filter/.test(s)) return 'Filters';
  if (/^(border|outline)/.test(s)) return 'Border & outline';
  if (/color/.test(s)) return 'Color';
  if (/^(font|text|line|letter|word|white-space)/.test(s)) return 'Typography';
  if (/^(visibility|display|content-visibility)/.test(s)) return 'Visibility & discrete state';
  if (/^(position|inset|top|right|bottom|left|z-index)/.test(s)) return 'Position';
  if (/^(opacity|background|mask|clip|box-shadow|mix-blend)/.test(s)) return 'Appearance';
  return 'Layout & size';
};
/** The real registration functions supply the inventory. Only semantic grouping is editor policy. */
export function readCatalog(): { properties: PropertyEntry[]; controls: ControlEntry[] } {
  let captured: { attribute: string; parts: string[] } | null = null;
  const property = (attribute: string, parts: (string | [string, unknown])[] = []) => Object.assign(() => {
    captured = { attribute, parts: parts.map(p => Array.isArray(p) ? p[0] : p) }; return {};
  }, { [nameable]: true });
  const spy = {
    property, color: property, effect: () => '', name: () => ({}),
    theme: (_key: string, values = {}) => values,
    scope: () => () => ({}), stagger: () => () => ({}), transition: () => () => ({}),
  } as unknown as Creator;
  const properties: PropertyEntry[] = [];
  for (const [utility, def] of Object.entries(getMatchTween(spy))) {
    if (utility === 'animate') continue;
    captured = null;
    try { def.fn('1', { modifier: null }); } catch { continue; }
    const meta = captured as { attribute: string; parts: string[] } | null;
    if (!meta) continue;
    properties.push({ utility, ...meta, types: [def.type ?? 'any'].flat(), values: Object.keys(def.values ?? {}), group: group(utility.slice(8)), nameable: nameable in def.fn });
  }
  const controls = Object.entries(getMatchControls(spy)).map(([utility, def]) => ({utility, types: [def.type ?? 'any'].flat(), values: Object.keys(def.values ?? {})}));
  return { properties, controls };
}
