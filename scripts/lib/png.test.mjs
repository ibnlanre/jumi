import { deflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'

import { decodePng, samplePixel } from './png.mjs'

/**
 * Build a PNG by hand, so the decoder is checked against the format rather than against itself.
 *
 * The filters are applied here in the forward direction, which is the inverse of what the decoder
 * does — a decoder that simply echoed its input could not pass this, and a filter implementation that
 * was subtly wrong in one direction would not cancel out.
 */
function encode({ colorType = 6, filter = 0, height, pixels, width }) {
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType]
  const stride = width * channels
  const raw = Buffer.alloc((stride + 1) * height)

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = filter

    for (let x = 0; x < stride; x += 1) {
      const value = pixels[y * stride + x]
      const a = x >= channels ? pixels[y * stride + x - channels] : 0
      const b = y > 0 ? pixels[(y - 1) * stride + x] : 0
      const c = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0

      const predictors = {
        0: () => 0,
        1: () => a,
        2: () => b,
        3: () => (a + b) >> 1,
        4: () => {
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)

          return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
        },
      }

      raw[y * (stride + 1) + 1 + x] = (value - predictors[filter]()) & 0xff
    }
  }

  const chunk = (type, data) => {
    const head = Buffer.alloc(8)

    head.writeUInt32BE(data.length, 0)
    head.write(type, 4, 'latin1')

    // The CRC is not checked by the decoder, so it is written as zero rather than computed — this
    // builder exists to exercise the filters and the chunk walk, not to produce a spec-complete file.
    return Buffer.concat([head, data, Buffer.alloc(4)])
  }

  const ihdr = Buffer.alloc(13)

  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = colorType
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** Two rows of two RGB pixels, written as RGBA so the same values can be asserted either way. */
const RGBA = [
  10, 20, 30, 255, 40, 50, 60, 255,
  70, 80, 90, 255, 100, 110, 120, 255,
]

describe('decodePng', () => {
  it('reads RGBA pixels', () => {
    const { height, pixelsAt, width } = decodePng(encode({ colorType: 6, height: 2, pixels: RGBA, width: 2 }))

    expect([width, height]).toEqual([2, 2])
    expect(pixelsAt(0, 0)).toEqual([10, 20, 30, 255])
    expect(pixelsAt(1, 0)).toEqual([40, 50, 60, 255])
    expect(pixelsAt(1, 1)).toEqual([100, 110, 120, 255])
  })

  it('expands RGB to RGBA with an opaque alpha', () => {
    const rgb = [10, 20, 30, 40, 50, 60]

    expect(decodePng(encode({ colorType: 2, height: 1, pixels: rgb, width: 2 })).pixelsAt(1, 0))
      .toEqual([40, 50, 60, 255])
  })

  it('expands greyscale across the channels', () => {
    expect(decodePng(encode({ colorType: 0, height: 1, pixels: [7, 200], width: 2 })).pixelsAt(1, 0))
      .toEqual([200, 200, 200, 255])
  })

  it('reverses every filter type', () => {
    // One encoder, five filters, one expected result — which is the only way to know that the
    // unfilter step is not right for None and quietly wrong for Paeth.
    for (const filter of [0, 1, 2, 3, 4]) {
      const { pixelsAt } = decodePng(encode({ colorType: 6, filter, height: 2, pixels: RGBA, width: 2 }))

      expect([pixelsAt(0, 0), pixelsAt(1, 0), pixelsAt(0, 1), pixelsAt(1, 1)], `filter ${filter}`).toEqual([
        [10, 20, 30, 255], [40, 50, 60, 255], [70, 80, 90, 255], [100, 110, 120, 255],
      ])
    }
  })

  it('refuses something that is not a PNG', () => {
    expect(() => decodePng(Buffer.from('GIF89a'))).toThrow(/not a PNG/)
  })

  it('refuses a bit depth it does not implement', () => {
    const png = encode({ colorType: 6, height: 1, pixels: [0, 0, 0, 255], width: 1 })

    png[8 + 8 + 8] = 16

    expect(() => decodePng(png)).toThrow(/bit depth/)
  })
})

describe('samplePixel', () => {
  it('averages a block', () => {
    // A 2×2 of 10 and 100 per channel: the average of all four is 55, and a point sample would have
    // returned whichever corner it hit.
    const pixels = [10, 10, 10, 255, 100, 100, 100, 255, 100, 100, 100, 255, 10, 10, 10, 255]
    const png = encode({ colorType: 6, height: 2, pixels, width: 2 })

    expect(samplePixel(png, 0, 0, 0)).toEqual([10, 10, 10, 255])
    expect(samplePixel(png, 1, 1, 0)).toEqual([10, 10, 10, 255])
    expect(samplePixel(png, 0, 0, 1)).toEqual([55, 55, 55, 255])
  })

  it('clamps a block that runs off the image instead of reading past it', () => {
    // Unclamped this returned `NaN`, and a `NaN` comparison is false — so an out-of-bounds sample
    // would have read as "the thing being looked for is absent" rather than as a broken measurement.
    const pixels = [10, 10, 10, 255, 100, 100, 100, 255, 100, 100, 100, 255, 10, 10, 10, 255]
    const png = encode({ colorType: 6, height: 2, pixels, width: 2 })

    expect(samplePixel(png, 0, 0, 2)).toEqual([55, 55, 55, 255])
  })

  it('says so when the point is outside the image', () => {
    const png = encode({ colorType: 6, height: 1, pixels: [0, 0, 0, 255], width: 1 })

    expect(() => samplePixel(png, 4, 4)).toThrow(/outside/)
  })
})
