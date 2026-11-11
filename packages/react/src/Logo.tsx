import type { CSSProperties, ImgHTMLAttributes } from 'react'

import { useLogoSrc } from './hooks/useLogoSrc'
import { getCreator, getHarness, getProvider, modelLogoRef } from './resolve'

export type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> & {
  /** The logo reference, `<namespace>/<id>`: `icons/claude`, `providers/bedrock`, `harnesses/claudecode`. */
  logo: string | null | undefined
  /** The name to show as the alt text, and for the monogram when there is no logo. */
  name: string
  /** The side of the square, in pixels. Default 24. */
  size?: number
  /** Corner radius in pixels. Default: a fifth of `size`. */
  radius?: number
}

/** A stable hue from a name, so a monogram keeps its colour. */
function hue(name: string): number {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

/**
 * A logo. While it loads, and when the catalog has none, it shows a monogram of
 * the name, so the layout does not move and no broken image shows.
 */
export function Logo({ logo, name, size = 24, radius, style, ...rest }: LogoProps) {
  const src = useLogoSrc(logo)
  const box: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius ?? Math.round(size / 5),
    flexShrink: 0,
  }
  if (src) {
    return <img {...rest} src={src} alt={name} width={size} height={size} style={{ ...box, objectFit: 'cover', ...style }} />
  }
  return (
    <span
      role="img"
      aria-label={name}
      style={{
        ...box,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `hsl(${hue(name)} 40% 88%)`,
        color: `hsl(${hue(name)} 40% 28%)`,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 600,
        fontSize: Math.round(size * 0.5),
        lineHeight: 1,
        userSelect: 'none',
        ...style,
      }}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

type Props = Omit<LogoProps, 'logo' | 'name'>

/** The logo of a model creator. Takes an id or an alias, such as `meta-llama`. */
export function CreatorLogo({ id, ...props }: Props & { id: string }) {
  const creator = getCreator(id)
  return <Logo {...props} logo={creator?.logo} name={creator?.name ?? id} />
}

/** The logo of a provider: a cloud platform, a model maker's API or an inference cloud. */
export function ProviderLogo({ id, ...props }: Props & { id: string }) {
  const provider = getProvider(id)
  return <Logo {...props} logo={provider?.logo} name={provider?.name ?? id} />
}

/** The logo of a harness: a coding agent, an SDK, a framework or a gateway. */
export function HarnessLogo({ id, ...props }: Props & { id: string }) {
  const harness = getHarness(id)
  return <Logo {...props} logo={harness?.logo} name={harness?.name ?? id} />
}

/**
 * The logo of a model, by name. It uses the logo of the model family, then of
 * the creator. See `modelLogoRef`.
 */
export function ModelLogo({ model, creator, ...props }: Props & { model: string; creator?: string | null }) {
  return <Logo {...props} logo={modelLogoRef(model, creator)} name={model} />
}
