import { CREATORS, HARNESSES, LOGO_LOADERS, PROVIDERS } from './generated/catalog'
import { MODEL_LOGO_RULES } from './generated/rules'

export type Creator = { id: string; name: string; aliases: string[]; logo: string | null }
export type Provider = { id: string; name: string; type: string; logo: string | null }
export type Harness = { id: string; name: string; logo: string | null }

const normalize = (value: string): string => value.trim().toLowerCase()

const creatorById = new Map<string, Creator>()
const creatorByKey = new Map<string, Creator>()
for (const [id, entry] of Object.entries(CREATORS)) {
  const creator: Creator = { id, ...entry }
  creatorById.set(id, creator)
  creatorByKey.set(id, creator)
  for (const alias of entry.aliases) creatorByKey.set(alias, creator)
}

/** The creator for an id or an alias, in any letter case. For example, `meta-llama` gives `meta`. */
export function getCreator(idOrAlias: string): Creator | undefined {
  const key = normalize(idOrAlias)
  return creatorByKey.get(key) ?? [...creatorById.values()].find((c) => normalize(c.name) === key)
}

export function getProvider(id: string): Provider | undefined {
  const entry = PROVIDERS[normalize(id)]
  return entry && { id: normalize(id), ...entry }
}

export function getHarness(id: string): Harness | undefined {
  const entry = HARNESSES[normalize(id)]
  return entry && { id: normalize(id), ...entry }
}

/** Every creator, provider and harness of the catalog. */
export const listCreators = (): Creator[] => [...creatorById.values()]
export const listProviders = (): Provider[] => Object.entries(PROVIDERS).map(([id, v]) => ({ id, ...v }))
export const listHarnesses = (): Harness[] => Object.entries(HARNESSES).map(([id, v]) => ({ id, ...v }))

/** The logo reference, `<namespace>/<id>`, that `Logo` takes. Null when the catalog has no such file. */
export const hasLogo = (ref: string): boolean => ref in LOGO_LOADERS

/** The first word of a model name: `deepseek` in `deepseek-v4-flash-0731`. */
function family(name: string): string | null {
  const word = /^[a-z]+/.exec(name.trim().toLowerCase())?.[0]
  return word ? (MODEL_LOGO_RULES.familyAliases[word] ?? word) : null
}

/**
 * The logo reference for a model name, or null when nothing is known.
 *
 * It tries the exact name, then the family (the first word of the name), then
 * the creator. A model with a creator and no logo of its own gets the Hugging
 * Face logo, because the creator ids are the organizations that publish the
 * weights there. A name with a vendor prefix, such as `google/gemini-3`, is
 * read without the prefix, and the prefix is the creator when none is given.
 * A model with no creator and no known family gets null.
 */
export function modelLogoRef(model: string, creator?: string | null): string | null {
  const full = model.trim().toLowerCase()
  const slash = full.indexOf('/')
  const name = slash === -1 ? full : full.slice(slash + 1)
  const key = creator?.trim().toLowerCase() || (slash === -1 ? undefined : full.slice(0, slash))
  const fam = family(name)
  const creatorLogo = key ? getCreator(key)?.logo : undefined
  const candidates = [
    MODEL_LOGO_RULES.exact[name] && `icons/${MODEL_LOGO_RULES.exact[name]}`,
    fam && MODEL_LOGO_RULES.families[fam] && `icons/${MODEL_LOGO_RULES.families[fam]}`,
    creatorLogo,
    key && `icons/${key}`,
    key && `icons/${MODEL_LOGO_RULES.fallback}`,
  ]
  return candidates.find((ref): ref is string => typeof ref === 'string' && hasLogo(ref)) ?? null
}
