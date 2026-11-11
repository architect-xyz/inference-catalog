import { LOGO_LOADERS } from './generated/catalog'

const loaded = new Map<string, string>()
const pending = new Map<string, Promise<string | null>>()

/** The `data:` URI of a logo if it has loaded already. */
export const cachedLogo = (ref: string): string | undefined => loaded.get(ref)

/**
 * Loads a logo. The bytes are in a separate chunk for each logo, so a page
 * downloads only the logos it shows. Resolves to null for a reference that
 * the catalog does not have.
 */
export function loadLogo(ref: string): Promise<string | null> {
  const hit = loaded.get(ref)
  if (hit !== undefined) return Promise.resolve(hit)
  const loader = LOGO_LOADERS[ref]
  if (!loader) return Promise.resolve(null)
  let promise = pending.get(ref)
  if (!promise) {
    promise = loader().then(
      (module) => {
        loaded.set(ref, module.default)
        pending.delete(ref)
        return module.default
      },
      () => {
        pending.delete(ref)
        return null
      }
    )
    pending.set(ref, promise)
  }
  return promise
}
