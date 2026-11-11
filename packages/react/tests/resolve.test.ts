import { describe, expect, it } from 'vitest'

import { MODEL_LOGO_RULES } from '../src/generated/rules'
import { getCreator, getHarness, getProvider, hasLogo, listCreators, listHarnesses, listProviders, logoUrl, modelLogoRef, modelLogoUrl } from '../src/resolve'

describe('catalog lookups', () => {
  it('finds a creator by alias and letter case', () => {
    expect(getCreator('meta-llama')?.id).toBe('meta')
    expect(getCreator('OpenAI')?.name).toBe('OpenAI')
    expect(getCreator('nobody')).toBeUndefined()
  })

  it('finds a provider and a harness', () => {
    expect(getProvider('bedrock')?.name).toBe('Amazon Bedrock')
    expect(getHarness('claude-code')?.name).toBe('Claude Code')
  })

  it('points every logo reference at a real file', () => {
    for (const entry of [...listCreators(), ...listProviders(), ...listHarnesses()]) {
      if (entry.logo) expect(hasLogo(entry.logo), `${entry.id} -> ${entry.logo}`).toBe(true)
    }
  })

  it('points every model rule at a real file', () => {
    const ids = [...Object.values(MODEL_LOGO_RULES.exact), ...Object.values(MODEL_LOGO_RULES.families), MODEL_LOGO_RULES.fallback]
    for (const id of ids) expect(hasLogo(`icons/${id}`), id).toBe(true)
  })
})

describe('modelLogoRef', () => {
  it('prefers the exact name, then the family, then the creator', () => {
    expect(modelLogoRef('gpt-4-turbo')).toBe('icons/gpt-4')
    expect(modelLogoRef('claude-opus-4.6', 'anthropic')).toBe('icons/claude')
    expect(modelLogoRef('some-new-model', 'mistralai')).toBe(getCreator('mistralai')?.logo)
  })

  it('reads a vendor prefix as the creator', () => {
    expect(modelLogoRef('google/gemini-3.1-flash-image')).toBe('icons/gemini')
    expect(modelLogoRef('unknownmodel', 'x-ai')).toBe(getCreator('x-ai')?.logo)
  })

  it('falls back to Hugging Face for a creator with no logo, and to null with no creator', () => {
    expect(modelLogoRef('mystery-1', 'nobody-labs')).toBe('icons/huggingface')
    expect(modelLogoRef('mystery-1')).toBeNull()
  })

  it('joins hy and hunyuan', () => {
    expect(modelLogoRef('hy-3')).toBe(modelLogoRef('hunyuan-3'))
  })
})

describe('logoUrl', () => {
  it('gives the file under the base, with its extension', () => {
    expect(logoUrl('icons/claude')).toBe('/assets/catalog/icons/claude.jpg')
    expect(logoUrl('icons/openai', '/x/')).toBe('/x/icons/openai.svg')
    expect(logoUrl('icons/nope')).toBeNull()
    expect(logoUrl(null)).toBeNull()
  })

  it('gives the URL for a model name', () => {
    expect(modelLogoUrl('claude-opus-4.6', 'anthropic')).toBe(logoUrl(modelLogoRef('claude-opus-4.6', 'anthropic')))
  })
})
