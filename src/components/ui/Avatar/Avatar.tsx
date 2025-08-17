import { palette } from '@/themes/palette.stylex'
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
  src?: string
  srcSet?: string
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  referrerPolicy?: HTMLImageElement['referrerPolicy']
  children?: React.ReactNode
}

const useLoaded = (p: Pick<Props, 'src' | 'srcSet' | 'referrerPolicy'>) => {
  const { src, srcSet, referrerPolicy } = p
  const [loaded, setLoaded] = useState<false | 'loaded' | 'error'>(false)

  useEffect(() => {
    if (!src && !srcSet) {
      setLoaded(false)
      return
    }
    setLoaded(false)
    let active = true
    const image = new Image()
    image.onload = () => {
      if (active) {
        setLoaded('loaded')
      }
    }
    image.onerror = () => {
      if (active) {
        setLoaded('error')
      }
    }
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
  }, [src, srcSet, referrerPolicy])

  return loaded
}

export const Avatar = (props: Props) => {
  const { variant = 'rounded', size = 'md', src, srcSet, referrerPolicy, children, sx } = props
  const loaded = useLoaded({ src, srcSet, referrerPolicy })
  const hasImage = !!src || !!srcSet
  const okImage = hasImage && loaded !== 'error'
  const style = [sizes[size], variants[variant], styles.square]
  if (okImage) {
    return (
      <html.img
        loading='lazy'
        decoding='async'
        fetchPriority='low'
        style={[...style, styles.img, sx]}
        src={src}
        srcSet={srcSet}
      />
    )
  }
  if (children) {
    return <html.div style={[...style, styles.fallback]}>{children}</html.div>
  }
  return <html.div style={[...style, styles.empty]} />
}

const variants = css.create({
  rounded: { [avatarTokens.containerShape]: shape.full },
  squared: { [avatarTokens.containerShape]: shape.md },
} as Record<AvatarVariant, UserAuthoredStyles>)

const sizes = css.create({
  xxs: {
    [avatarTokens.containerSize]: '16px',
    [avatarTokens.labelTextSize]: typeScale.bodySize$sm,
  },
  xs: {
    [avatarTokens.containerSize]: '24px',
    [avatarTokens.labelTextSize]: typeScale.bodySize$sm,
  },
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
  square: {
    inlineSize: avatarTokens.containerSize,
    blockSize: avatarTokens.containerSize,
    minInlineSize: avatarTokens.containerSize,
    minBlockSize: avatarTokens.containerSize,
    maxInlineSize: avatarTokens.containerSize,
    maxBlockSize: avatarTokens.containerSize,
    borderRadius: avatarTokens.containerShape,
    overflow: 'hidden',
    userSelect: 'none',
    backgroundColor: palette.surfaceContainerLowest,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  img: {
    blockSize: '100%',
    inlineSize: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    color: 'transparent',
    textIndent: 10000,
  },
  fallback: {
    fontSize: avatarTokens.labelTextSize,
    fontWeight: typeFace.bold,
    color: 'black',
    backgroundColor: 'white',
    textTransform: 'uppercase',
  },
  empty: {
    backgroundColor: palette.surfaceContainerLowest,
  },
})
