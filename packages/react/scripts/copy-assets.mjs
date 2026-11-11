// Copies the image files of the catalog into assets/, so the package ships them.
import { cpSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '../assets')
rmSync(out, { recursive: true, force: true })
cpSync(join(here, '../../../logos'), out, {
  recursive: true,
  filter: (src) => !src.endsWith('index.json'),
})
