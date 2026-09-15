#!/usr/bin/env node
/**
 * Serve the *real* effects catalogue, optionally with the aggregate hoisted.
 *
 * This exists next to `spike-cdp-cost` for one reason. That harness registers its slots with
 * `animate-rotate-[{i}deg]`, so its activating selectors are **escaped arbitrary values averaging 57
 * characters**. The shipped catalogue averages **22** — plain effect names — giving 4,969 characters
 * of selector text against the synthetic corpus's 13,146.
 *
 * That difference decides a conclusion. Hand-timing the synthetic page gives 3.25 s with the real
 * selector text, 0.42 s with short synthetic addresses, and 0.23 s with a single selector — so the
 * frontend's cost tracks the *text*, and a synthetic timing overstates the shipped page by roughly
 * the ratio of those lengths. The only honest way to price the real page is to serve the real page.
 *
 * Usage:
 *   node scripts/spike-real-page.mjs --port=8793            # as built
 *   node scripts/spike-real-page.mjs --port=8794 --hoist    # aggregate hoisted
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

import { shallowOf } from './lib/aggregate.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const site = path.join(root, 'docs', 'dist')

const portArg = process.argv.find(argument => argument.startsWith('--port='))
const port = portArg ? Number(portArg.split('=')[1]) : 8793
const hoist = process.argv.includes('--hoist')

if (!existsSync(site)) {
  console.error(`no built site at ${site} — run \`pnpm docs:build\` first`)
  process.exit(1)
}

const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

/** The one stylesheet carrying the composition rule; everything else is served untouched. */
const hoistable = /effects\.[^/]*\.css$/

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1')
  const file = path.join(
    site,
    decodeURIComponent(url.pathname).replace(/\/$/, '/index.html'),
  )

  if (!file.startsWith(site) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end('not found')

    return
  }

  const type = TYPES[path.extname(file)] ?? 'application/octet-stream'

  if (!hoist || type !== 'text/css' || !hoistable.test(file)) {
    response.writeHead(200, { 'content-type': type })

    createReadStream(file).pipe(response)

    return
  }

  const css = readFileSync(file, 'utf8')
  const before = css.length
  const transformed = shallowOf(css, 'shorthand')

  console.log(
    `· hoisted ${path.basename(file)}: ${before} → ${transformed.length} bytes`,
  )
  response
    .writeHead(200, { 'cache-control': 'no-store', 'content-type': type })
    .end(transformed)
})

server.listen(port, '127.0.0.1', () => {
  console.log(
    `\n${hoist ? 'hoisted' : 'as built'} — http://127.0.0.1:${port}/effects/`,
  )
  console.log(
    'Select an effect element in the Elements panel and time the Styles pane.',
  )
  console.log('Ctrl-C to stop.\n')
})
