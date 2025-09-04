import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import type { UserAuthoredStyles } from '@stylexjs/stylex/lib/StyleXTypes'
import React from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictReactDOMButtonProps } from 'react-strict-dom/dist/types/StrictReactDOMButtonProps'
import { focusRing } from '../FocusRing/FocusRing.stylex'
import type { SxProps } from '../types'
import { buttonTokens } from './Button.stylex'

type ButtonVariant = 'elevated' | 'filled' | 'filledTonal' | 'outlined' | 'text' | 'danger'
type ButtonElement = 'button' | 'div'

export type Props = StrictReactDOMButtonProps & {
  as?: ButtonElement
  variant?: ButtonVariant | false
  fullWidth?: boolean
  sx?: SxProps
  ref?: React.Ref<HTMLButtonElement & HTMLDivElement>
}

export const Button = (props: Props) => {
  const { as = 'button', variant = 'text', disabled = false, fullWidth, sx, children, tabIndex, ref, ...rest } = props

  const Component = as === 'div' ? html.div : html.button
  return (
    <Component
      ref={ref}
      role='button'
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      disabled={disabled}
      style={[
        styles.root,
        focusRing.focusable,
        variants[variant || 'text'],
        variant === 'outlined' && styles.outlinedBorder,
        fullWidth && styles.fullWidth,
        sx,
      ]}
      {...rest}>
      {children}
    </Component>
  )
}

const variants = css.create({
  text: {
    [buttonTokens.labelTextColor]: palette.primary,
    [buttonTokens.labelTextColor$hover]: palette.primary,
    [buttonTokens.labelTextColor$pressed]: palette.primary,
    [buttonTokens.labelTextColor$focus]: palette.primary,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
    [buttonTokens.labelTextOpacity$disabled]: 0.38,
    [buttonTokens.containerColor]: 'transparent',
    [buttonTokens.containerColor$hover]: palette.surfaceContainerHigh,
    [buttonTokens.containerColor$pressed]: palette.surfaceContainerHighest,
    [buttonTokens.containerColor$disabled]: 'transparent',
    [buttonTokens.containerElevation]: elevation.shadows0,
    [buttonTokens.outlineColor]: 'transparent',
    [buttonTokens.outlineColor$disabled]: palette.outlineVariant,
  },
  elevated: {
    [buttonTokens.labelTextColor]: palette.onSurface,
    [buttonTokens.labelTextColor$hover]: 'red',
    [buttonTokens.labelTextColor$pressed]: palette.onSurface,
    [buttonTokens.labelTextColor$focus]: palette.onSurface,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
    [buttonTokens.labelTextOpacity$disabled]: 0.38,
    [buttonTokens.containerColor]: palette.surfaceContainerLow,
    [buttonTokens.containerColor$hover]: 'blue',
    [buttonTokens.containerColor$pressed]: palette.surfaceContainerHigh,
    [buttonTokens.containerColor$disabled]: palette.surfaceContainerHigh,
    [buttonTokens.containerElevation]: {
      default: elevation.shadows1,
      ':hover': elevation.shadows2,
      ':active': elevation.shadows1,
      ':disabled': elevation.shadows0,
    },
    [buttonTokens.outlineColor]: 'transparent',
    [buttonTokens.outlineColor$disabled]: palette.outlineVariant,
  },
  filled: {
    [buttonTokens.containerColor]: palette.primary,
    [buttonTokens.containerColor$hover]: palette.primaryFixedDim,
    [buttonTokens.containerColor$pressed]: palette.primary,
    [buttonTokens.containerColor$disabled]: palette.surfaceContainerHigh,
    [buttonTokens.labelTextColor]: palette.onPrimary,
    [buttonTokens.labelTextColor$hover]: palette.onPrimary,
    [buttonTokens.labelTextColor$pressed]: palette.onPrimary,
    [buttonTokens.labelTextColor$focus]: palette.onPrimary,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
    [buttonTokens.labelTextOpacity$disabled]: 0.38,
    [buttonTokens.containerElevation]: {
      default: elevation.shadows0,
      ':hover': elevation.shadows1,
      ':active': elevation.shadows0,
      ':disabled': elevation.shadows0,
    },
    [buttonTokens.outlineColor]: 'transparent',
    [buttonTokens.outlineColor$disabled]: palette.outlineVariant,
  },
  filledTonal: {
    [buttonTokens.labelTextColor]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$hover]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$pressed]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$focus]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
    [buttonTokens.labelTextOpacity$disabled]: 0.38,
    [buttonTokens.containerColor]: palette.surfaceContainer,
    [buttonTokens.containerColor$hover]: palette.surfaceContainerHigh,
    [buttonTokens.containerColor$pressed]: palette.surfaceContainerHighest,
    [buttonTokens.containerColor$disabled]: palette.surfaceContainerHigh,
    [buttonTokens.containerElevation]: elevation.shadows0,
    [buttonTokens.outlineColor]: 'transparent',
    [buttonTokens.outlineColor$disabled]: palette.outlineVariant,
  },
  outlined: {
    [buttonTokens.labelTextColor]: palette.primary,
    [buttonTokens.labelTextColor$hover]: palette.primary,
    [buttonTokens.labelTextColor$pressed]: palette.primary,
    [buttonTokens.labelTextColor$focus]: palette.primary,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
    [buttonTokens.labelTextOpacity$disabled]: 0.38,
    [buttonTokens.containerColor]: 'transparent',
    [buttonTokens.containerColor$hover]: palette.surfaceContainerHigh,
    [buttonTokens.containerColor$pressed]: palette.surfaceContainerHighest,
    [buttonTokens.containerColor$disabled]: 'transparent',
    [buttonTokens.containerElevation]: elevation.shadows0,
    [buttonTokens.outlineColor]: palette.outline,
    [buttonTokens.outlineColor$disabled]: palette.outlineVariant,
  },
  danger: {
    [buttonTokens.labelTextColor]: palette.onErrorContainer,
    [buttonTokens.labelTextColor$hover]: palette.onError,
    [buttonTokens.labelTextColor$pressed]: palette.onError,
    [buttonTokens.labelTextColor$focus]: palette.onError,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
    [buttonTokens.labelTextOpacity$disabled]: 0.38,
    [buttonTokens.containerColor]: palette.errorContainer,
    [buttonTokens.containerColor$hover]: palette.error,
    [buttonTokens.containerColor$pressed]: palette.errorContainer,
    [buttonTokens.containerColor$disabled]: palette.surfaceContainerHigh,
    [buttonTokens.containerElevation]: elevation.shadows0,
    [buttonTokens.outlineColor]: 'transparent',
    [buttonTokens.outlineColor$disabled]: palette.outlineVariant,
  },
} as Record<ButtonVariant, UserAuthoredStyles>)

const styles = css.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    gap: 8,
    minWidth: buttonTokens.containerMinWidth,
    height: buttonTokens.containerHeight,
    paddingInlineStart: buttonTokens.leadingSpace,
    paddingInlineEnd: buttonTokens.trailingSpace,
    border: 0,
    borderRadius: buttonTokens.containerShape,
    fontFamily: buttonTokens.labelTextFont,
    fontSize: buttonTokens.labelTextSize,
    lineHeight: buttonTokens.labelTextLineHeight,
    fontWeight: buttonTokens.labelTextWeight,
    letterSpacing: buttonTokens.labelTextLetterSpacing,
    backgroundColor: {
      default: buttonTokens.containerColor,
      ':hover': buttonTokens.containerColor$hover,
      ':active': buttonTokens.containerColor$pressed,
      ':disabled': buttonTokens.containerColor$disabled,
    },
    color: {
      default: buttonTokens.labelTextColor,
      ':hover': buttonTokens.labelTextColor$hover,
      ':active': buttonTokens.labelTextColor$pressed,
      ':focus-visible': buttonTokens.labelTextColor$focus,
      ':disabled': buttonTokens.labelTextColor$disabled,
    },
    opacity: {
      default: 1,
      ':disabled': 0.58,
    },
    boxShadow: {
      default: buttonTokens.containerElevation,
      ':hover': buttonTokens.containerElevation,
      ':active': buttonTokens.containerElevation,
      ':disabled': elevation.shadows0,
    },
    transitionProperty: 'transform, background-color, box-shadow, color, outline-color, outline-offset, outline-width',
    transitionDuration: duration.short3,
    transitionTimingFunction: easing.emphasized,
    transform: 'scale(1)',
    ':active': {
      transform: 'scale(0.94)',
    },
    cursor: {
      default: 'pointer',
      ':disabled': 'default',
    },
    pointerEvents: {
      default: 'inherit',
      ':disabled': 'none',
    },
    borderStyle: 'solid',
    borderColor: {
      default: buttonTokens.outlineColor,
      ':disabled': buttonTokens.outlineColor$disabled,
    },
  },
  outlinedBorder: {
    borderWidth: 1,
  },
  fullWidth: {
    display: 'flex',
    width: '100%',
  },
})
