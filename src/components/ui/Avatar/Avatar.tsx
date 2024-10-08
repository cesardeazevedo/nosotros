import { shape } from '@/themes/shape.stylex'
import { typeFace } from '@/themes/typeFace.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import type { UserAuthoredStyles } from '@stylexjs/stylex/lib/StyleXTypes'
import React, { useEffect, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { SxProps } from '../types'
import { avatarTokens } from './Avatar.stylex'

type AvatarVariant = 'rounded' | 'squared'

export type Props = {
  sx?: SxProps
  variant?: AvatarVariant
  alt?: string
  src?: string
  srcSet?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  crossOrigin?: null | ('anonymous' | 'use-credentials')
  referrerPolicy?:
    | null
    | (
        | 'no-referrer'
        | 'no-referrer-when-downgrade'
        | 'origin'
        | 'origin-when-cross-origin'
        | 'same-origin'
        | 'strict-origin'
        | 'strict-origin-when-cross-origin'
        | 'unsafe-url'
      )
  children?: React.ReactNode
  fallbackRandomColor?: string
}

function useLoaded({ crossOrigin, referrerPolicy, src, srcSet }: Props) {
  const [loaded, setLoaded] = useState<false | 'loaded' | 'error'>(false)

  useEffect(() => {
    if (!src && !srcSet) {
      return undefined
    }

    setLoaded(false)

    let active = true
    const image = new Image()
    image.onload = () => {
      if (!active) {
        return
      }
      setLoaded('loaded')
    }
    image.onerror = () => {
      if (!active) {
        return
      }
      setLoaded('error')
    }
    image.crossOrigin = crossOrigin || null
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy
    }
    if (src) {
      image.src = src
    }
    if (srcSet) {
      image.srcset = srcSet
    }

    return () => {
      active = false
    }
  }, [crossOrigin, referrerPolicy, src, srcSet])

  return loaded
}

export function Avatar(props: Props) {
  const { variant = 'rounded', size = 'md', alt, src, srcSet, crossOrigin, referrerPolicy, children, sx } = props
  const loaded = useLoaded({ src, srcSet, crossOrigin, referrerPolicy })
  const hasImage = !!src || !!srcSet
  const hasImageNotFailing = hasImage && loaded !== 'error'
  return (
    <html.div style={[sizes[size], styles.root, variants[variant], sx]}>
      {hasImageNotFailing ? (
        <html.img
          style={styles.img}
          src={src}
          srcSet={srcSet}
          crossOrigin={crossOrigin}
          referrerPolicy={referrerPolicy}
        />
      ) : children ? (
        <html.div style={styles.content}>{children}</html.div>
      ) : hasImage && !!alt ? (
        <html.div style={styles.content}>{alt[0]}</html.div>
      ) : null}
    </html.div>
  )
}

const variants = css.create({
  rounded: { [avatarTokens.containerShape]: shape.full },
  squared: { [avatarTokens.containerShape]: shape.md },
} as Record<AvatarVariant, UserAuthoredStyles>)

const sizes = css.create({
  sm: {
    [avatarTokens.containerSize]: '32px',
    [avatarTokens.labelTextSize]: typeScale.bodySize$sm,
  },
  md: {
    [avatarTokens.containerSize]: '40px',
    [avatarTokens.labelTextSize]: typeScale.bodySize$md,
  },
  lg: {
    [avatarTokens.containerSize]: '60px',
    [avatarTokens.labelTextSize]: typeScale.bodySize$lg,
  },
  xl: {
    [avatarTokens.containerSize]: '90px',
    [avatarTokens.labelTextSize]: typeScale.bodySize$lg,
  },
})

const styles = css.create({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: avatarTokens.containerSize,
    height: avatarTokens.containerSize,
    borderRadius: avatarTokens.containerShape,
    overflow: 'hidden',
    userSelect: 'none',
    backgroundColor: avatarTokens.containerColor,
    color: avatarTokens.labelTextColor,
    textTransform: 'uppercase',
    flexShrink: 0,
    flexGrow: 0,
  },
  img: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    objectFit: 'cover',
    color: 'transparent',
    textIndent: 10000,
  },
  content: {
    width: '70%',
    height: '70%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: avatarTokens.labelTextSize,
    fontWeight: typeFace.bold,
  },
})
