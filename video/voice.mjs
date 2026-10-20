#!/usr/bin/env node
/**
 * The voice-over.
 *
 * `voiceover.json` is the script: one line per scene, with the millisecond it starts (`at`) and the
 * scene's out point (`until`). This script reads each line aloud with macOS's synthesizer, checks
 * that the read ends before its scene does, lays the lines on one track at their cue, and muxes
 * that track under `jumi.mp4`.
 *
 * Run:  node video/voice.mjs                      → video/voiceover.wav + video/jumi-voiced.mp4
 *       node video/voice.mjs --voice Daniel       → another installed voice (`say -v '?'` lists them)
 *       node video/voice.mjs --rate 165           → slower
 *       node video/voice.mjs --dry                → synthesize and report the fit, write no video
 *
 * The synthesizer is a scratch read. To replace it with a recorded narrator or a neural voice,
 * drop one file per line into video/voice/<scene>.wav (the names this script writes) and run
 * with `--keep`: the files are used as they are, and only the fit check and the mix run.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
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
const voice = flag('voice', script.voice)
const rate = Number(flag('rate', script.rate))
const dry = args.includes('--dry')
const keep = args.includes('--keep')

const dir = path.join(here, 'voice')
const trimDir = path.join(dir, '.trimmed')
mkdirSync(trimDir, { recursive: true })

const video = path.join(here, 'jumi.mp4')
const track = path.join(here, 'voiceover.wav')
const music = path.join(here, 'music.wav')
const withMusic = !args.includes('--no-music') && existsSync(music)
const out = path.join(here, 'jumi-voiced.mp4')

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

/* ----------------------------------------------------------------------------------------------
 * 1. Read each line, and check it fits its scene
 * -------------------------------------------------------------------------------------------- */

console.log(
  keep
    ? `· fitting ${script.lines.length} recorded lines from video/voice/\n`
    : `· reading ${script.lines.length} lines with ${voice} at ${rate} wpm\n`,
)

const GUARD = 250 // ms a line must end before its scene cuts
let misfit = false
const lines = script.lines.map(line => {
  const file = path.join(dir, `${line.scene}.wav`)
  if (!(keep && existsSync(file))) {
    const aiff = file.replace(/\.wav$/, '.aiff')
    execFileSync('say', [
      '-v',
      voice,
      '-r',
      String(rate),
      '-o',
      aiff,
      line.say ?? line.text,
    ])
    execFileSync('ffmpeg', [
      '-y',
      '-v',
      'error',
      '-i',
      aiff,
      '-ar',
      '48000',
      '-ac',
      '1',
      file,
    ])
    execFileSync('rm', [aiff])
  }
  // Synthesizers pad a read with silence at both ends. Trim it to a short breath, so what has to
  // fit the scene is the speech, and the cue lands on the first word rather than on the padding.
  const trimmed = path.join(trimDir, path.basename(file))
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    file,
    '-af',
    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,' +
      'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse',
    trimmed,
  ])
  const length = Math.round(seconds(trimmed) * 1000)
  const end = line.at + length
  const room = line.until - GUARD - end
  const fits = room >= 0
  if (!fits) misfit = true
  console.log(
    `  ${line.scene}  ${String(line.at).padStart(5)}ms → ${String(end).padStart(5)}ms` +
      `  ${(length / 1000).toFixed(2)}s  ${fits ? `fits, ${(room / 1000).toFixed(2)}s to spare` : `OVER by ${(-room / 1000).toFixed(2)}s`}`,
  )
  return { ...line, file: trimmed, length }
})

if (misfit) {
  console.error(
    '\n✗ a line runs past its scene. Shorten it in voiceover.json, or lower --rate.',
  )
  process.exit(1)
}
if (dry) process.exit(0)

/* ----------------------------------------------------------------------------------------------
 * 2. One track, then the mux
 * -------------------------------------------------------------------------------------------- */

const total = seconds(video)
const inputs = lines.flatMap(line => ['-i', line.file])
// Recorded or generated lines may arrive at any sample rate, so each is brought to 48 kHz first.
const delayed = lines
  .map(
    (line, i) =>
      `[${i}]aresample=48000,aformat=channel_layouts=mono,adelay=${line.at}|${line.at}[d${i}]`,
  )
  .join(';')
const mixed = lines.map((_, i) => `[d${i}]`).join('')
const filter =
  `${delayed};${mixed}amix=inputs=${lines.length}:normalize=0:dropout_transition=0,` +
  `apad=whole_dur=${total},loudnorm=I=-18:TP=-1.5:LRA=9[a]`

console.log('\n· mixing the track')
execFileSync('ffmpeg', [
  '-y',
  '-v',
  'error',
  ...inputs,
  '-filter_complex',
  filter,
  '-map',
  '[a]',
  '-ar',
  '48000',
  track,
])

// The bed sits under the voice and ducks while she speaks: a sidechain compressor keyed from the
// narration pulls the music down on each line and lets it back up in the gaps.
const bed = withMusic
  ? [
      '-i',
      music,
      '-filter_complex',
      '[2:a]volume=-7dB[m];[m][1:a]sidechaincompress=threshold=0.06:ratio=3:attack=30:release=250:makeup=1[duck];' +
        '[duck][1:a]amix=inputs=2:normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]',
      '-map',
      '0:v',
      '-map',
      '[a]',
    ]
  : ['-map', '0:v', '-map', '1:a']

console.log(
  withMusic
    ? '· muxing voice and music under the picture'
    : '· muxing it under the picture',
)
const result = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-v',
    'error',
    '-i',
    video,
    '-i',
    track,
    ...bed,
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    out,
  ],
  { stdio: 'inherit' },
)
if (result.status !== 0) process.exit(result.status ?? 1)

console.log(`· wrote ${path.relative(path.join(here, '..'), out)}`)
