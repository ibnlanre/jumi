#!/usr/bin/env node
/**
 * Read the narration with Kokoro, a neural voice that runs on this machine.
 *
 * One file per line of `voiceover.json` lands in `video/voice/<scene>.wav`, which is what
 * `voice.mjs --keep` mixes. The model (Kokoro-82M, ONNX) is fetched once from Hugging Face and
 * cached inside `video/node_modules`, so a reinstall fetches it again.
 *
 * Run:  node video/speak.mjs                     → af_heart, the default voice
 *       node video/speak.mjs --voice bm_george   → another Kokoro voice (--list prints them)
 *       node video/speak.mjs --speed 1.05        → a touch brisker
 *       node video/speak.mjs --only 03,07        → re-read some lines after an edit
 *
 * Then:  node video/voice.mjs --keep
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
const voice = flag('voice', script.kokoro?.voice ?? 'af_heart')
const speed = Number(flag('speed', script.kokoro?.speed ?? 1))
const only = flag('only', '').split(',').filter(Boolean)

// Transformers.js keeps the model in video/node_modules/@huggingface/transformers/.cache.
const { KokoroTTS } = await import('kokoro-js')

console.log('· loading Kokoro-82M (the first run downloads about 330 MB)')
const tts = await KokoroTTS.from_pretrained(
  'onnx-community/Kokoro-82M-v1.0-ONNX',
  {
    device: 'cpu',
    dtype: 'fp32',
  },
)

if (args.includes('--list')) {
  tts.list_voices()
  process.exit(0)
}

const dir = path.join(here, 'voice')
mkdirSync(dir, { recursive: true })

console.log(`· reading with ${voice} at speed ${speed}\n`)
for (const line of script.lines) {
  if (only.length && !only.includes(line.scene)) continue
  const text = line.kokoro ?? line.say ?? line.text
  const audio = await tts.generate(text, { speed, voice })
  const file = path.join(dir, `${line.scene}.wav`)
  writeFileSync(file, Buffer.from(audio.toWav()))
  console.log(
    `  ${line.scene}  ${(audio.audio.length / audio.sampling_rate).toFixed(2)}s  ${text}`,
  )
}

console.log('\n· done. Now: node video/voice.mjs --keep')
