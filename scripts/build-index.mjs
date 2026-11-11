// Writes logos/index.json: every logo with its file, type and size.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { ROOT, readLogos } from './lib.mjs'

const logos = readLogos()
const index = Object.fromEntries(
  logos.map(({ ref, file, mime, bytes }) => [ref, { file, type: mime, bytes }])
)
writeFileSync(join(ROOT, 'logos/index.json'), JSON.stringify(index, null, 2) + '\n')
console.log(`logos/index.json: ${logos.length} logos`)
