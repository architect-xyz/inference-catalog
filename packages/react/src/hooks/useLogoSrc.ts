import { useEffect, useState } from 'react'

import { cachedLogo, loadLogo } from '../load'

/** The `data:` URI of a logo, or null until it has loaded or when there is none. */
export function useLogoSrc(ref: string | null | undefined): string | null {
  const [loaded, setLoaded] = useState<{ ref: string; src: string } | null>(null)
  useEffect(() => {
    if (!ref || cachedLogo(ref) !== undefined) return
    let live = true
    void loadLogo(ref).then((src) => {
      if (live && src) setLoaded({ ref, src })
    })
    return () => {
      live = false
    }
  }, [ref])
  if (!ref) return null
  return cachedLogo(ref) ?? (loaded?.ref === ref ? loaded.src : null)
}
