import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import type { UserAuthoredStyles } from '@stylexjs/stylex/lib/StyleXTypes'
import React from 'react'
import { css } from 'react-strict-dom'
import type { Props as ButtonProps } from '../Button/Button'
import { Button } from '../Button/Button'
import { buttonTokens } from '../Button/Button.stylex'
import type { SxProps } from '../types'
import { iconButtonTokens } from './IconButton.stylex'

type IconButtonVariant = 'standard' | 'filled' | 'filledTonal' | 'outlined'
type IconButtonSize = 'sm' | 'md'

export interface Props extends Omit<ButtonProps, 'variant'> {
  sx?: SxProps
  icon?: React.ReactNode
  variant?: IconButtonVariant
  toggle?: boolean
  selected?: boolean
  size?: IconButtonSize
  selectedIcon?: React.ReactNode
  'aria-label'?: React.AriaAttributes['aria-label']
  'aria-label-selected'?: React.AriaAttributes['aria-label']
  ref?: React.Ref<HTMLButtonElement & HTMLDivElement>
}

export const IconButton = (props: Props) => {
  const {
    sx,
    icon = props.children,
    size = 'md',
    variant = 'standard',
    selectedIcon,
    selected,
    toggle,
    'aria-label': ariaLabel,
    'aria-label-selected': ariaLabelSelected,
    ref,
    ...rest
  } = props

  return (
    <Button
      ref={ref}
      aria-label={toggle && selected ? (ariaLabelSelected ?? ariaLabel) : ariaLabel}
      sx={[
        styles.root,
        sizes[size],
        variants[variant],
        toggle ? (selected ? styles.selected : styles.toggle) : null,
        sx,
      ]}
      variant={variant === 'standard' ? undefined : (variant as ButtonProps['variant'])}
      {...rest}>
      {selected ? (selectedIcon ?? icon) : icon}
    </Button>
  )
}

const variants = css.create({
  standard: {
    [buttonTokens.labelTextColor]: palette.onSurfaceVariant,
  },
  filled: {
    [buttonTokens.containerColor]: palette.primary,
    [buttonTokens.containerColor$hover]: palette.primary,
    [buttonTokens.containerColor$pressed]: palette.primary,
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.labelTextColor]: palette.onPrimary,
    [buttonTokens.labelTextColor$hover]: palette.onPrimary,
    [buttonTokens.labelTextColor$pressed]: palette.onPrimary,
    [buttonTokens.labelTextColor$focus]: palette.onPrimary,
    [buttonTokens.containerElevation]: {
      default: elevation.shadows0,
      ':hover': elevation.shadows1,
      ':active': elevation.shadows0,
    },
  },
  filledTonal: {
    [buttonTokens.labelTextColor]: palette.onSecondaryContainer,
    [buttonTokens.containerColor]: palette.surfaceContainer,
    [buttonTokens.containerColor$hover]: palette.surfaceContainer,
    [buttonTokens.containerColor$pressed]: palette.surfaceContainer,
    [buttonTokens.containerColor$disabled]: palette.onSurface,
    [buttonTokens.containerElevation]: elevation.shadows0,
  },
  outlined: {
    [buttonTokens.labelTextColor]: palette.onSurfaceVariant,
    [buttonTokens.containerColor]: 'transparent',
    [buttonTokens.containerColor$hover]: palette.surfaceContainerHigh,
    [buttonTokens.containerColor$pressed]: palette.surfaceContainerHighest,
    [buttonTokens.containerElevation]: elevation.shadows0,
    [buttonTokens.outlineColor]: palette.outline,
  },
} as Record<IconButtonVariant, UserAuthoredStyles>)

const sizes = css.create({
  sm: {
    [buttonTokens.containerHeight]: '28px',
    [buttonTokens.containerMinWidth]: '28px',
  },
  md: {
    [buttonTokens.containerHeight]: '36px',
    [buttonTokens.containerMinWidth]: '36px',
  },
})

const styles = css.create({
  root: {
    flexShrink: 0,
    [buttonTokens.leadingSpace]: '0px',
    [buttonTokens.trailingSpace]: '0px',
    [buttonTokens.containerElevation]: elevation.shadows0,
    [buttonTokens.containerShape]: shape.full,
  },
  toggle: {
    [buttonTokens.containerColor]: iconButtonTokens.toggleContainerColor,
    [buttonTokens.labelTextColor]: iconButtonTokens.toggleIconColor,
  },
  selected: {
    [buttonTokens.containerColor]: iconButtonTokens.toggleContainerColorSelected,
    [buttonTokens.labelTextColor]: iconButtonTokens.toggleIconColorSelected,
  },
})
