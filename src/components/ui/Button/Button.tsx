import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { state } from '@/themes/state.stylex'
import type { UserAuthoredStyles } from '@stylexjs/stylex/lib/StyleXTypes'
import React, { forwardRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { Props as ButtonBaseProps } from '../ButtonBase/ButtonBase'
import { ButtonBase } from '../ButtonBase/ButtonBase'
import { Elevation } from '../Elevation/Elevation'
import { elevationTokens } from '../Elevation/Elevation.stylex'
import { rippleTokens } from '../Ripple/Ripple.stylex'
import { buttonTokens } from './Button.stylex'

type ButtonVariant = 'elevated' | 'filled' | 'filledTonal' | 'outlined' | 'text' | 'danger'

export interface Props extends ButtonBaseProps {
  variant?: ButtonVariant | false
  icon?: React.ReactNode
  trailingIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(props, ref) {
  const { variant = 'text', children, icon, trailingIcon, disabled = false, sx, fullWidth, ...rest } = props
  const outlined = variant === 'outlined'
  const elevation = variant === 'elevated'
  return (
    <ButtonBase
      ref={ref}
      sx={[styles.root, variant && variants[variant], fullWidth && styles.fullWidth, sx]}
      disabled={disabled}
      outlined={outlined}
      {...rest}>
      {elevation && <Elevation sx={styles.elevation} />}
      {icon && <html.div style={[styles.icon, disabled && styles.label$disabled]}>{icon}</html.div>}
      {children && <html.span style={[styles.label, disabled && styles.label$disabled]}>{children}</html.span>}
      {trailingIcon && <html.div style={[styles.icon, disabled && styles.label$disabled]}>{trailingIcon}</html.div>}
    </ButtonBase>
  )
})

const variants = css.create({
  text: {
    [buttonTokens.labelTextColor]: palette.primary,
  },
  elevated: {
    [buttonTokens.labelTextColor]: palette.onSurface,
    [buttonTokens.containerColor]: palette.surfaceContainerLow,
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.containerOpacity$disabled]: state.containerOpacity$disabled,
    [buttonTokens.containerElevation]: {
      default: elevation.shadows2,
      ':is([data-focused])': elevation.shadows0,
      ':is([data-hovered])': elevation.shadows4,
      ':is([data-pressed])': elevation.shadows1,
    },
  },
  filled: {
    [rippleTokens.color$hover]: palette.onPrimary,
    [buttonTokens.containerColor]: palette.primary,
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.containerOpacity$disabled]: state.containerOpacity$disabled,
    [buttonTokens.labelTextColor]: palette.onPrimary,
    [buttonTokens.containerElevation]: {
      default: elevation.shadows0,
      ':is([data-focused])': elevation.shadows0,
      ':is([data-hovered])': elevation.shadows2,
      ':is([data-pressed])': elevation.shadows0,
    },
  },
  filledTonal: {
    [rippleTokens.color$hover]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor]: palette.onSecondaryContainer,
    [buttonTokens.containerColor]: palette.surfaceContainer,
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.containerOpacity$disabled]: state.containerOpacity$disabled,
    [buttonTokens.containerElevation]: {
      default: elevation.shadows0,
      ':is([data-focused])': elevation.shadows0,
      ':is([data-hovered])': elevation.shadows2,
      ':is([data-pressed])': elevation.shadows0,
    },
  },
  outlined: {
    [buttonTokens.labelTextColor]: palette.primary,
  },
  danger: {
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.containerOpacity$disabled]: state.containerOpacity$disabled,
    [buttonTokens.labelTextColor]: palette.onErrorContainer,
    [buttonTokens.containerColor]: palette.errorContainer,
  },
} as Record<ButtonVariant, UserAuthoredStyles>)

const styles = css.create({
  root: {
    alignContent: 'center',
    borderRadius: buttonTokens.containerShape,
    cursor: 'pointer',
    display: 'inline-flex',
    outline: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    justifyItems: 'center',
    position: 'relative',
    fontFamily: buttonTokens.labelTextFont,
    fontSize: buttonTokens.labelTextSize,
    fontWeight: buttonTokens.labelTextWeight,
    lineHeight: buttonTokens.labelTextLineHeight,
    letterSpacing: buttonTokens.labelTextLetterSpacing,
    gap: spacing.padding1,
    paddingInlineStart: buttonTokens.leadingSpace,
    paddingInlineEnd: buttonTokens.leadingSpace,
    minHeight: buttonTokens.containerHeight,
    // minWidth: buttonTokens.containerMinWidth,
  },
  elevation: {
    [elevationTokens.boxShadow]: buttonTokens.containerElevation,
  },
  label: {
    position: 'relative',
    color: {
      default: buttonTokens.labelTextColor,
      ':is([data-focused])': buttonTokens.labelTextColor$focus,
      ':is([data-hovered])': buttonTokens.labelTextColor$hover,
      ':is([data-pressed])': buttonTokens.labelTextColor$pressed,
    },
  },
  label$disabled: {
    color: buttonTokens.labelTextColor$disabled,
    opacity: buttonTokens.labelTextOpacity$disabled,
  },
  icon: {
    position: 'relative',
    display: 'inline-flex',
    color: buttonTokens.labelTextColor,
  },
  iconDisabled: {},
  fullWidth: {
    display: 'flex',
    width: '100%',
  },
})
