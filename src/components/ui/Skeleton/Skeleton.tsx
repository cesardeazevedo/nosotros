import { shape } from '@/themes/shape.stylex'
import { useRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { SxProps } from '../types'
import { skeletonTokens } from './Skeleton.stylex'

type IRange = {
  min: number
  max: number
}

type Props = {
  sx?: SxProps
  children?: React.ReactNode
  loaded?: boolean
  variant?: 'rectangular' | 'circular' | 'overlay'
  animation?: 'pulse' | 'wave' | false
  length?: number | IRange
  hasError?: boolean
}

const random = (range: IRange, floating?: boolean): number => {
  const randomValue = Math.random() * (range.max - range.min) + range.min
  return floating ? randomValue : Math.floor(randomValue)
}

export const Skeleton = (props: Props) => {
  const {
    sx,
    children,
    loaded,
    variant = 'rectangular',
    animation: animationProp = 'pulse',
    length: lengthProp,
    hasError,
    ...other
  } = props

  //const animation = hasError ? undefined : animationProp
  const lengthRef = useRef(typeof lengthProp === 'object' ? random(lengthProp) : lengthProp)

  if (loaded) {
    return children
  }

  return (
    <html.div
      style={[
        variant === 'rectangular'
          ? lengthRef.current !== undefined
            ? staticStyles.length(lengthRef.current)
            : !children
              ? staticStyles.length()
              : undefined
          : undefined,
        styles.root,
        hasError && styles.root$error,
        styles[`root$${variant}`],
        !!animationProp && styles[`animation$${animationProp}`],
        sx,
      ]}
      {...other}>
      {children && <html.div style={styles.hidden}>{children}</html.div>}
    </html.div>
  )
}

const pulseKeyframe = css.keyframes({
  '0%': { opacity: skeletonTokens.animationMaxOpacity$pulse },
  '50%': { opacity: 0 },
  '100%': { opacity: skeletonTokens.animationMaxOpacity$pulse },
})

const waveKeyframe = css.keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '50%': { transform: 'translateX(100%)' },
  '100%': { transform: 'translateX(100%)' },
})

const staticStyles = css.create({
  length: (length?: number) => ({
    width: length !== undefined ? `${length}ch` : '100%',
  }),
})

const styles = css.create({
  root: {
    display: 'block',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
    color: 'transparent',
    zIndex: skeletonTokens.zIndex,
    '::before': {
      content: '',
      display: 'block',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      //zIndex: skeletonTokens.zIndex,
      backgroundColor: skeletonTokens.containerColor,
    },
    '::after': {
      content: '',
      display: 'block',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      //zIndex: skeletonTokens.zIndex,
    },
  },
  root$error: {
    '::before': {
      backgroundColor: skeletonTokens.containerColor$error,
    },
  },
  root$rectangular: {
    height: 'auto',
    borderRadius: skeletonTokens.containerShape,
  },
  root$circular: {
    borderRadius: shape.full,
    flexGrow: 0,
    flexShrink: 0,
  },
  root$overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  hidden: {
    visibility: 'hidden',
  },
  animation$pulse: {
    '::after': {
      opacity: skeletonTokens.animationMaxOpacity$pulse,
      animationName: pulseKeyframe,
      animationDuration: skeletonTokens.animationDuration$pulse,
      animationDelay: skeletonTokens.animationDelay$pulse,
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
      backgroundColor: skeletonTokens.animationTargetColor,
    },
  },
  animation$wave: {
    '::after': {
      opacity: skeletonTokens.animationMaxOpacity$wave,
      animationName: waveKeyframe,
      animationDuration: skeletonTokens.animationDuration$wave,
      animationDelay: skeletonTokens.animationDelay$wave,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      background: `linear-gradient(90deg, transparent, ${skeletonTokens.animationTargetColor}, transparent)`,
      transform: 'translateX(-100%)',
      inset: 0,
    },
  },
})
