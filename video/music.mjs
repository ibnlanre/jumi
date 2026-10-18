#!/usr/bin/env node
/**
 * The instrumental bed, composed in code.
 *
 * Nothing here is sampled or licensed: every sound is synthesized from sine waves and noise, so
 * the track is the repository's own. It is written to the film's scene boundaries, read from
 * `voiceover.json`: each scene gets an intensity, and the arrangement steps up or breaks down on
 * the cut. 122 BPM, A minor, a four-chord loop (Am · F · C · G), one bar each.
 *
 * Run:  node video/music.mjs          → video/music.wav (48 kHz stereo), then `voice.mjs --keep`
 *       node video/music.mjs --bpm 118
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? fallback : args[at + 1]
}

const script = JSON.parse(
  readFileSync(path.join(here, 'voiceover.json'), 'utf8'),
)
// A scene runs from the previous scene's out point to its own; the line's `at` is only the voice cue.
const scenes = script.lines.map((line, i) => ({
  at: i ? script.lines[i - 1].until : 0,
  scene: line.scene,
  until: line.until,
}))
const sceneStart = Math.min(...scenes.map(s => s.at))
const end = Math.max(...scenes.map(s => s.until)) / 1000

const RATE = 48000
const BPM = Number(flag('bpm', 122))
const BEAT = 60 / BPM
const BAR = 4 * BEAT

/* ----------------------------------------------------------------------------------------------
 * The arrangement: how much is playing in each scene
 *   0  nothing      1  pad + hats + sparse kick      2  + bass, kick on every beat, clap
 *   3  + arpeggio, open hats                          (the break before the last scene is a 1)
 * -------------------------------------------------------------------------------------------- */

const INTENSITY = {
  '01': 1,
  '02': 2,
  '03': 3,
  '04': 2,
  '05': 3,
  '06': 3,
  '07': 1,
  '08': 3,
}
const intensityAt = t => {
  const ms = t * 1000
  const scene = scenes.find(s => ms >= s.at && ms < s.until)
  if (!scene) return ms < sceneStart ? 1 : 3
  return INTENSITY[scene.scene] ?? 2
}

// Risers: a noise swell over the last bar before a scene that steps up to 3.
const risers = scenes
  .filter(
    (s, i) =>
      i > 0 && INTENSITY[s.scene] === 3 && INTENSITY[scenes[i - 1].scene] < 3,
  )
  .map(s => s.at / 1000)

/* ----------------------------------------------------------------------------------------------
 * Notes
 * -------------------------------------------------------------------------------------------- */

const hz = midi => 440 * 2 ** ((midi - 69) / 12)
// A2 C3 E3 · F2 A2 C3 · C3 E3 G3 · G2 B2 D3
const CHORDS = [
  [45, 48, 52],
  [41, 45, 48],
  [48, 52, 55],
  [43, 47, 50],
]
const ARP = [0, 1, 2, 1, 0, 2, 1, 2] // chord-tone indices, an octave up, on 16ths

/* ----------------------------------------------------------------------------------------------
 * The render: two float buffers, events added in place
 * -------------------------------------------------------------------------------------------- */

const frames = Math.ceil(end * RATE)
const L = new Float64Array(frames)
const R = new Float64Array(frames)

// A tiny deterministic noise source, so two renders are identical.
let seed = 0x2f6e2b1
const noise = () => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) / 0xffffffff) * 2 - 1
}

const add = (t0, duration, fn, pan = 0) => {
  const start = Math.floor(t0 * RATE)
  const n = Math.min(Math.ceil(duration * RATE), frames - start)
  const gl = Math.cos(((pan + 1) * Math.PI) / 4)
  const gr = Math.sin(((pan + 1) * Math.PI) / 4)
  for (let i = 0; i < n; i++) {
    const v = fn(i / RATE)
    L[start + i] += v * gl
    R[start + i] += v * gr
  }
}

const env = (t, attack, release, length) => {
  if (t < attack) return t / attack
  if (t > length - release) return Math.max(0, (length - t) / release)
  return 1
}

// Instruments
const pad = (t0, notes, length, gain) => {
  for (const [k, midi] of notes.entries()) {
    for (const [detune, pan] of [
      [-0.7, -0.5],
      [0.7, 0.5],
    ]) {
      const f = hz(midi + detune / 100)
      add(
        t0,
        length,
        t => {
          const e = env(t, 0.5, 0.7, length)
          const w =
            Math.sin(2 * Math.PI * f * t) +
            Math.sin(2 * Math.PI * f * 3 * t) / 9 +
            Math.sin(2 * Math.PI * f * 5 * t) / 25
          return w * e * gain * (k === 0 ? 1 : 0.8)
        },
        pan,
      )
    }
  }
}

const bass = (t0, midi, length, gain) => {
  const f = hz(midi - 12)
  add(t0, length, t => {
    const e = env(t, 0.005, 0.06, length)
    const w =
      Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * 2 * f * t)
    return Math.tanh(w * 1.6) * e * gain
  })
}

const kick = (t0, gain) =>
  add(t0, 0.35, t => {
    const f = 48 + 120 * Math.exp(-t / 0.045)
    const body = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.11)
    const click = noise() * Math.exp(-t / 0.004) * 0.6
    return (body + click) * gain
  })

const hat = (t0, open, gain) => {
  let last = 0
  add(
    t0,
    open ? 0.16 : 0.045,
    t => {
      const n = noise()
      const hp = n - last // a one-pole high-pass, which is what a hat is
      last = n
      return hp * Math.exp(-t / (open ? 0.06 : 0.012)) * gain
    },
    0.25,
  )
}

const clap = (t0, gain) => {
  let last = 0
  add(t0, 0.18, t => {
    const n = noise()
    const bp = (n - last) * 0.5 + last * 0.5
    last = n
    const bursts =
      (Math.exp(-t / 0.02) +
        Math.exp(-(t - 0.012) / 0.02) +
        Math.exp(-(t - 0.024) / 0.08)) /
      3
    return bp * bursts * gain
  })
}

const pluck = (t0, midi, gain, pan) => {
  const f = hz(midi)
  add(
    t0,
    0.22,
    t => {
      const e = Math.exp(-t / 0.07)
      return (
        (Math.sin(2 * Math.PI * f * t) +
          0.5 * Math.sin(2 * Math.PI * 2 * f * t) * e) *
        e *
        gain
      )
    },
    pan,
  )
}

const riser = (tEnd, gain) => {
  const length = BAR
  let last = 0
  add(tEnd - length, length, t => {
    const n = noise()
    const hp = n - last
    last = n
    const p = t / length
    return hp * p * p * gain
  })
}

/* ----------------------------------------------------------------------------------------------
 * The score
 * -------------------------------------------------------------------------------------------- */

const bars = Math.ceil(end / BAR)
for (let bar = 0; bar < bars; bar++) {
  const t0 = bar * BAR
  const chord = CHORDS[bar % CHORDS.length]
  const level = intensityAt(t0 + BEAT) // read a little inside the bar, past the scene fade

  pad(t0, chord, BAR + 0.1, level === 0 ? 0 : level === 1 ? 0.075 : 0.09)

  for (let beat = 0; beat < 4; beat++) {
    const tb = t0 + beat * BEAT
    const lv = intensityAt(tb)
    if (lv === 0) continue

    if (lv >= 2 || beat === 0) kick(tb, lv >= 3 ? 0.8 : lv === 2 ? 0.65 : 0.32)
    if (lv >= 2 && (beat === 1 || beat === 3)) clap(tb, lv >= 3 ? 0.16 : 0.11)

    for (let eighth = 0; eighth < 2; eighth++) {
      const th = tb + eighth * (BEAT / 2)
      const open = lv >= 3 && beat === 3 && eighth === 1
      if (lv === 1 && !eighth) continue // the quiet scenes keep only the offbeat tick
      hat(th, open, (eighth ? 0.055 : 0.035) * (lv >= 2 ? 1 : 0.6))
    }

    if (lv >= 2) {
      bass(tb, chord[0], BEAT * 0.48, lv >= 3 ? 0.34 : 0.28)
      bass(tb + BEAT / 2, chord[0], BEAT * 0.22, lv >= 3 ? 0.26 : 0.2)
    }

    if (lv >= 3) {
      for (let s = 0; s < 4; s++) {
        const idx = ARP[(beat * 4 + s) % ARP.length]
        pluck(tb + (s * BEAT) / 4, chord[idx] + 12, 0.13, s % 2 ? 0.35 : -0.35)
      }
    }
  }
}

for (const tEnd of risers) riser(tEnd, 0.07)

/* ----------------------------------------------------------------------------------------------
 * Fade the tail, keep the peaks honest, and write the file
 * -------------------------------------------------------------------------------------------- */

const fadeOut = 1.6
for (let i = 0; i < frames; i++) {
  const t = i / RATE
  const g = t > end - fadeOut ? Math.max(0, (end - t) / fadeOut) : 1
  L[i] = Math.tanh(L[i] * 0.9) * g
  R[i] = Math.tanh(R[i] * 0.9) * g
}
let peak = 0
for (let i = 0; i < frames; i++)
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
const norm = 10 ** (-3 / 20) / (peak || 1)

const data = Buffer.alloc(frames * 4)
for (let i = 0; i < frames; i++) {
  data.writeInt16LE(Math.round(L[i] * norm * 32767), i * 4)
  data.writeInt16LE(Math.round(R[i] * norm * 32767), i * 4 + 2)
}
const header = Buffer.alloc(44)
header.write('RIFF', 0)
header.writeUInt32LE(36 + data.length, 4)
header.write('WAVE', 8)
header.write('fmt ', 12)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(2, 22)
header.writeUInt32LE(RATE, 24)
header.writeUInt32LE(RATE * 4, 28)
header.writeUInt16LE(4, 32)
header.writeUInt16LE(16, 34)
header.write('data', 36)
header.writeUInt32LE(data.length, 40)

const out = path.join(here, 'music.wav')
writeFileSync(out, Buffer.concat([header, data]))
console.log(
  `· wrote video/music.wav: ${end.toFixed(1)}s at ${BPM} BPM, ${bars} bars, risers into ${risers.map(t => t.toFixed(1) + 's').join(', ') || 'none'}`,
)
