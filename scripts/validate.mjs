// Checks every entity against its schema, and every cross reference.
import Ajv from 'ajv/dist/2020.js'
import { join } from 'node:path'

import { ROOT, fileSlug, readEntities, readJson, readLogos } from './lib.mjs'

const ajv = new Ajv({ allErrors: true, strict: false })
ajv.addSchema(readJson(join(ROOT, 'schemas/logo.schema.json')), 'logo.schema.json')
const schemas = Object.fromEntries(
  ['creator', 'provider', 'harness', 'model'].map((kind) => [
    kind,
    ajv.compile(readJson(join(ROOT, `schemas/${kind}.schema.json`))),
  ])
)

const problems = []
const fail = (file, message) => problems.push(`${file.replace(ROOT + '/', '')}: ${message}`)

const logoRefs = new Set(readLogos().map((l) => l.ref))
const kinds = { creators: ['creator', 1], providers: ['provider', 1], harnesses: ['harness', 1], models: ['model', 2] }
const loaded = {}
for (const [dir, [kind, depth]] of Object.entries(kinds)) {
  loaded[dir] = readEntities(dir, depth)
  for (const { file, name, value } of loaded[dir]) {
    const check = schemas[kind]
    if (!check(value)) fail(file, ajv.errorsText(check.errors))
    if (value.logo && !logoRefs.has(value.logo)) fail(file, `logo ${value.logo} has no file`)
    const expected = kind === 'model' ? fileSlug(value.name ?? '') : value.id
    if (name !== expected) fail(file, `file name should be ${expected}.json`)
  }
}

const creatorIds = new Map()
for (const { file, value } of loaded.creators) {
  for (const key of [value.id, ...value.aliases]) {
    if (creatorIds.has(key)) fail(file, `id or alias ${key} is also used by ${creatorIds.get(key)}`)
    creatorIds.set(key, value.id)
  }
}
const modelIds = new Set()
for (const { file, value } of loaded.models) {
  if (!loaded.creators.some((c) => c.value.id === value.creator)) fail(file, `creator ${value.creator} is not in creators/`)
  if (value.id !== `${value.creator}/${value.name}`) fail(file, 'id should be <creator>/<name>')
  if (modelIds.has(value.id)) fail(file, `duplicate id ${value.id}`)
  modelIds.add(value.id)
}

if (problems.length) {
  console.error(problems.slice(0, 50).join('\n'))
  if (problems.length > 50) console.error(`... and ${problems.length - 50} more`)
  process.exit(1)
}
console.log(
  `ok: ${Object.entries(loaded).map(([k, v]) => `${v.length} ${k}`).join(', ')}, ${logoRefs.size} logos`
)
