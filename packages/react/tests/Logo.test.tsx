import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CreatorLogo, Logo, ModelLogo } from '../src'
import { loadLogo } from '../src/load'

describe('Logo', () => {
  it('renders a monogram when the logo has not loaded', () => {
    const html = renderToString(<CreatorLogo id="anthropic" />)
    expect(html).toContain('aria-label="Anthropic"')
    expect(html).toContain('>A<')
  })

  it('renders a monogram for an unknown id', () => {
    expect(renderToString(<ModelLogo model="mystery-1" />)).toContain('>M<')
  })

  it('renders the image after it has loaded', async () => {
    const src = await loadLogo('icons/claude')
    expect(src).toMatch(/^data:image\/(jpeg|png|svg\+xml|webp);base64,/)
    const html = renderToString(<Logo logo="icons/claude" name="Claude" size={32} />)
    expect(html).toContain('<img')
    expect(html).toContain('width="32"')
  })

  it('loads nothing for an unknown reference', async () => {
    expect(await loadLogo('icons/does-not-exist')).toBeNull()
  })
})
