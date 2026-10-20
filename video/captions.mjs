#!/usr/bin/env node
/**
 * Captions for the film, as SubRip (.srt).
 *
 * Each line of `voiceover.json` is split at its punctuation into cues of at most two short rows,
 * which is what X, LinkedIn and YouTube render comfortably. A cue's time span is its share of the
 * line's spoken length, measured from the trimmed read that `voice.mjs` mixed, so the captions
 * follow the voice rather than the scene.
 *
 * Run:  node video/voice.mjs --keep && node video/captions.mjs   → video/jumi.srt
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const script = JSON.parse(
  readFileSync(path.join(here, 'voiceover.json'), 'utf8'),
)

const ROW = 38 // characters per caption row
const seconds = file =>
  Number(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=nw=1:nk=1',
      file,
    ]).toString(),
  )

// Split at sentence and clause breaks, then pack the pieces into cues of up to two rows.
const pieces = text =>
  text
    .split(/(?<=[.;:?!,])\s+/)
    .map(s => s.trim())
    .filter(Boolean)

// One row when it fits; otherwise the two-row split that leaves the rows most even, so a cue never
// ends on a stranded word. Longer text falls back to filling rows in order.
const rows = piece => {
  if (piece.length <= ROW) return [piece]
  const words = piece.split(' ')
  let best = null
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ')
    const b = words.slice(i).join(' ')
    if (a.length > ROW || b.length > ROW) continue
    const gap = Math.abs(a.length - b.length)
    if (!best || gap < best.gap) best = { gap, rows: [a, b] }
  }
  if (best) return best.rows
  const out = []
  let row = ''
  for (const word of words) {
    if ((row + ' ' + word).trim().length > ROW && row) {
      out.push(row)
      row = word
    } else row = (row + ' ' + word).trim()
  }
  if (row) out.push(row)
  return out
}

const cuesFor = text => {
  const cues = []
  let current = []
  for (const piece of pieces(text)) {
    const next = rows([...current, piece].join(' '))
    if (next.length <= 2 && !/[.?!]$/.test(current.join(' ')))
      current.push(piece)
    else {
      if (current.length) cues.push(rows(current.join(' ')))
      current = [piece]
    }
  }
  if (current.length) cues.push(rows(current.join(' ')))
  return cues
}

const stamp = ms => {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const f = Math.round(ms % 1000)
  const pad = (n, w = 2) => String(n).padStart(w, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(f, 3)}`
}

let index = 0
const out = []
for (const line of script.lines) {
  const trimmed = path.join(here, 'voice', '.trimmed', `${line.scene}.wav`)
  const raw = path.join(here, 'voice', `${line.scene}.wav`)
  const file = existsSync(trimmed) ? trimmed : raw
  if (!existsSync(file)) {
    console.error(
      `no read for scene ${line.scene}; run speak.mjs and voice.mjs --keep first`,
    )
    process.exit(1)
  }
  const length = seconds(file) * 1000
  const cues = cuesFor(line.text)
  const weight = cues.map(c => c.join(' ').length)
  const total = weight.reduce((a, b) => a + b, 0)
  let t = line.at
  for (const [i, cue] of cues.entries()) {
    const span = (length * weight[i]) / total
    const start = Math.round(t)
    const end = Math.round(
      Math.min(t + span, line.until) - (i === cues.length - 1 ? 0 : 40),
    )
    out.push(
      `${++index}\n${stamp(start)} --> ${stamp(end)}\n${cue.join('\n')}\n`,
    )
    t += span
  }
}

const file = path.join(here, 'jumi.srt')
writeFileSync(file, out.join('\n'))
console.log(`· wrote video/jumi.srt: ${index} cues`)
