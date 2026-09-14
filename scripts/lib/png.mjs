/**
 * A minimal PNG reader, for sampling a rendered pixel in a browser check.
 *
 * Chromium hands a screenshot back as PNG and nothing else, and this repository has no image
 * dependency. Node's `zlib` is enough: a PNG is a header, a deflated scanline stream and a trailer,
 * and the only real work is reversing the per-scanline filters. That is what this does — no
 * interlacing, no palette, no 16-bit, which is all a screenshot ever uses.
 *
 * It exists because one question could not be answered from computed style: whether replacing the
 * UA's cross-fade on `::view-transition-old/new` lets the backdrop bleed through mid-transition.
 * That is a question about *painted* pixels, and arithmetic over `opacity` and `mix-blend-mode` would
 * be a model of the answer rather than the answer. See `engineering/research/view-transitions.md`.
 *
 * Falsified two ways rather than assumed correct:
 *
 *   · `png.test.mjs` builds its own PNGs — including one row per filter type — so the decoder is
 *     checked against an independent construction of the format, not against itself.
 *   · `samplePixel` is also exercised end-to-end against a real Chromium screenshot of a known
 *     solid colour, which is the case that matters here.
 */
import { inflateSync } from 'node:zlib'

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** Bytes per pixel for the colour types a screenshot uses. */
const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 }

/** The Paeth predictor, straight out of the spec. */
const paeth = (a, b, c) => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)

  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b

  return c
}

/**
 * Reverse the per-scanline filters, in place over the inflated stream, into one contiguous buffer.
 *
 * Filtering is defined *within* a scanline against the already-unfiltered bytes to its left, so this
 * cannot be vectorised or reordered: each byte needs its left neighbour reconstructed first.
 */
const unfilter = (raw, width, height, bytes) => {
  const stride = width * bytes
  const out = Buffer.alloc(stride * height)

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)]
    const from = y * (stride + 1) + 1
    const row = y * stride
    const up = row - stride

    for (let x = 0; x < stride; x += 1) {
      const value = raw[from + x]
      const a = x >= bytes ? out[row + x - bytes] : 0
      const b = y > 0 ? out[up + x] : 0
      const c = y > 0 && x >= bytes ? out[up + x - bytes] : 0

      let result

      switch (filter) {
        case 0:
          result = value
          break
        case 1:
          result = value + a
          break
        case 2:
          result = value + b
          break
        case 3:
          result = value + ((a + b) >> 1)
          break
        case 4:
          result = value + paeth(a, b, c)
          break
        default:
          throw new Error(`unknown PNG filter ${filter} on row ${y}`)
      }

      out[row + x] = result & 0xff
    }
  }

  return out
}

/**
 * Decode a PNG into `{ height, pixels, width }`, where `pixels` is RGBA8 and `pixelsAt` reads one
 * pixel as `[r, g, b, a]`.
 */
export function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG')

  let at = 8
  let header = null
  const parts = []

  while (at < buffer.length) {
    const length = buffer.readUInt32BE(at)
    const type = buffer.toString('latin1', at + 4, at + 8)
    const data = buffer.subarray(at + 8, at + 8 + length)

    if (type === 'IHDR') {
      header = {
        bitDepth: data[8],
        colorType: data[9],
        height: data.readUInt32BE(4),
        interlace: data[12],
        width: data.readUInt32BE(0),
      }
    }

    if (type === 'IDAT') parts.push(data)
    if (type === 'IEND') break

    at += length + 12
  }

  if (!header) throw new Error('PNG has no IHDR')
  if (header.bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${header.bitDepth}`)
  if (header.interlace !== 0) throw new Error('interlaced PNG is not supported')

  const bytes = CHANNELS[header.colorType]

  if (!bytes) throw new Error(`unsupported PNG colour type ${header.colorType}`)

  const flat = unfilter(inflateSync(Buffer.concat(parts)), header.width, header.height, bytes)

  // Normalise every supported colour type to RGBA, so a caller never has to know which one it got.
  const pixels = Buffer.alloc(header.width * header.height * 4)

  for (let i = 0; i < header.width * header.height; i += 1) {
    const from = i * bytes

    if (bytes === 1) {
      pixels[i * 4] = flat[from]
      pixels[i * 4 + 1] = flat[from]
      pixels[i * 4 + 2] = flat[from]
      pixels[i * 4 + 3] = 255
    }
    else if (bytes === 2) {
      pixels[i * 4] = flat[from]
      pixels[i * 4 + 1] = flat[from]
      pixels[i * 4 + 2] = flat[from]
      pixels[i * 4 + 3] = flat[from + 1]
    }
    else {
      pixels[i * 4] = flat[from]
      pixels[i * 4 + 1] = flat[from + 1]
      pixels[i * 4 + 2] = flat[from + 2]
      pixels[i * 4 + 3] = bytes === 4 ? flat[from + 3] : 255
    }
  }

  return {
    height: header.height,
    pixelsAt: (x, y) => [...pixels.subarray((y * header.width + x) * 4, (y * header.width + x) * 4 + 4)],
    width: header.width,
  }
}

/**
 * The average colour in a square around a point.
 *
 * A single pixel is a sample of one device pixel; averaging a small block makes the reading robust to
 * antialiasing at an edge without hiding a bleed, which shifts a large area at once.
 *
 * The block is clamped to the image rather than allowed to run off it: reading outside would produce
 * `NaN` and a `NaN` comparison is false, so an out-of-bounds sample would have read as "the bleed did
 * not appear" instead of as an error. The divisor is the number of pixels actually read.
 */
export function samplePixel(buffer, x, y, radius = 0) {
  const { height, pixelsAt, width } = decodePng(buffer)
  const values = [0, 0, 0, 0]
  let count = 0

  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      const px = x + dx
      const py = y + dy

      if (px < 0 || py < 0 || px >= width || py >= height) continue

      const pixel = pixelsAt(px, py)

      for (let channel = 0; channel < 4; channel += 1) values[channel] += pixel[channel]
      count += 1
    }
  }

  if (!count) throw new Error(`sample (${x}, ${y}) is outside the ${width}×${height} image`)

  return values.map(value => Math.round(value / count))
}
