import { readdirSync } from 'node:fs'
import { defineConfig } from 'tsup'

// Each logo is its own entry, so a consumer can import one logo, and the loader
// map in the index still splits them into lazy chunks.
const logos = Object.fromEntries(
  ['icons', 'providers', 'harnesses'].flatMap((ns) =>
    readdirSync(`src/generated/logos/${ns}`).map((f) => [`logos/${ns}/${f.replace(/\.ts$/, '')}`, `src/generated/logos/${ns}/${f}`])
  )
)

export default defineConfig({
  entry: { index: 'src/index.ts', ...logos },
  format: ['esm'],
  splitting: true,
  dts: { entry: { index: 'src/index.ts' } },
  clean: true,
  external: ['react'],
})
