import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..')
export const NAMESPACES = ['icons', 'providers', 'harnesses']
const IMAGE = new Set(['.jpg', '.png', '.svg', '.webp'])
const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' }

export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

/** The file name that holds a model or an entity: lowercase, and only `a-z0-9._-`. */
export const fileSlug = (name) => name.toLowerCase().replace(/[^a-z0-9._-]+/g, '_')

/** Every `*.json` under `dir` (one level, or two for models), with its parsed value. */
export function readEntities(dir, depth = 1) {
  const out = []
  const walk = (path, left) => {
    for (const entry of readdirSync(path).sort()) {
      const full = join(path, entry)
      if (statSync(full).isDirectory()) {
        if (left > 1) walk(full, left - 1)
      } else if (entry.endsWith('.json')) out.push({ file: full, name: basename(entry, '.json'), value: readJson(full) })
    }
  }
  walk(join(ROOT, dir), depth)
  return out
}

/** Every logo file, as `{ ref, file, ext, mime, bytes }`, sorted by `ref`. */
export function readLogos() {
  const logos = []
  for (const ns of NAMESPACES) {
    const dir = join(ROOT, 'logos', ns)
    for (const entry of readdirSync(dir).sort()) {
      const ext = extname(entry).toLowerCase()
      if (!IMAGE.has(ext)) continue
      logos.push({
        ref: `${ns}/${basename(entry, extname(entry))}`,
        file: `logos/${ns}/${entry}`,
        ext: ext.slice(1),
        mime: MIME[ext],
        bytes: statSync(join(dir, entry)).size,
      })
    }
  }
  const seen = new Set()
  for (const { ref } of logos) {
    if (seen.has(ref)) throw new Error(`two logo files for ${ref}`)
    seen.add(ref)
  }
  return logos
}
