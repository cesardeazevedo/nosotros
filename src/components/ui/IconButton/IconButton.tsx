import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { state } from '@/themes/state.stylex'
import type { UserAuthoredStyles } from '@stylexjs/stylex/lib/StyleXTypes'
import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import type { Props as ButtonProps } from '../Button/Button'
import { Button } from '../Button/Button'
import { buttonTokens } from '../Button/Button.stylex'
import { rippleTokens } from '../Ripple/Ripple.stylex'
import type { SxProps } from '../types'
import { iconButtonTokens } from './IconButton.stylex'

type IconButtonVariants = 'standard' | 'filled' | 'filledTonal' | 'outlined'

type IconButtonSize = 'sm' | 'md'

export interface Props extends Omit<ButtonProps, 'variant'> {
  sx?: SxProps
  variant?: IconButtonVariants
  toggle?: boolean
  selected?: boolean
  size?: IconButtonSize
  selectedIcon?: React.ReactNode
  'aria-label'?: React.AriaAttributes['aria-label']
  'aria-label-selected'?: React.AriaAttributes['aria-label']
}

export const IconButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {
    sx,
    icon,
    size = 'md',
    variant = 'standard',
    selectedIcon,
    selected,
    toggle,
    'aria-label': ariaLabel,
    'aria-label-selected': ariaLabelSelected,
    ...rest
  } = props

  return (
    <Button
      icon={selected ? selectedIcon || icon : icon}
      aria-label={toggle && selected ? ariaLabelSelected ?? ariaLabel : ariaLabel}
      sx={[
        styles.root,
        sizes[size],
        variants[variant],
        toggle ? (selected ? styles.selected : styles.toggle) : null,
        sx,
      ]}
      variant={variant === 'standard' ? undefined : variant}
      ref={ref}
      {...rest}
    />
  )
})

const variants = css.create({
  standard: {
    [buttonTokens.labelTextColor]: palette.onSurfaceVariant,
    [iconButtonTokens.toggleIconColorSelected]: palette.primary,
    [iconButtonTokens.toggleContainerColorSelected]: palette.surfaceContainer,
  },
  filled: {
    [buttonTokens.containerColor]: palette.primary,
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.containerOpacity$disabled]: state.containerOpacity$disabled,
    [iconButtonTokens.toggleContainerColor]: palette.surfaceContainerHighest,
    [iconButtonTokens.toggleContainerColorSelected]: palette.primary,
    [iconButtonTokens.toggleIconColor]: palette.primary,
    [iconButtonTokens.toggleIconColorSelected]: palette.onPrimary,
    [rippleTokens.color$hover]: palette.onPrimary,
  },
  filledTonal: {
    [buttonTokens.containerColor]: palette.secondaryContainer,
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.containerOpacity$disabled]: state.containerOpacity$disabled,
    [iconButtonTokens.toggleContainerColor]: palette.surfaceContainerHighest,
    [iconButtonTokens.toggleContainerColorSelected]: palette.secondaryContainer,
  },
  outlined: {
    [iconButtonTokens.toggleContainerColorSelected]: palette.inverseSurface,
    [iconButtonTokens.toggleIconColor]: palette.onSurfaceVariant,
    [iconButtonTokens.toggleIconColorSelected]: palette.inverseOnSurface,
  },
} as Record<IconButtonVariants, UserAuthoredStyles>)

const sizes = css.create({
  sm: {
    width: 28,
    height: 28,
  },
  md: {
    width: 36,
    height: 36,
  },
})

const styles = css.create({
  root: {
    flexShrink: 0,
    [buttonTokens.containerHeight]: 28,
    [buttonTokens.containerMinWidth]: 28,
    [buttonTokens.leadingSpace]: '0px',
    [buttonTokens.trailingSpace]: '0px',
    [buttonTokens.containerElevation]: elevation.shadows0,
    [buttonTokens.containerShape]: shape.full,
  },
  toggle: {
    [buttonTokens.containerColor]: iconButtonTokens.toggleContainerColor,
    [buttonTokens.labelTextColor]: iconButtonTokens.toggleIconColor,
    [rippleTokens.color$hover]: palette.primary,
  },
  selected: {
    [buttonTokens.containerColor]: iconButtonTokens.toggleContainerColorSelected,
    [buttonTokens.labelTextColor]: iconButtonTokens.toggleIconColorSelected,
  },
})
