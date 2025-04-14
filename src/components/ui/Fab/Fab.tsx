import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { state } from '@/themes/state.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import type { Props as ButtonProps } from '../Button/Button'
import { Button } from '../Button/Button'
import { buttonTokens } from '../Button/Button.stylex'
import { rippleTokens } from '../Ripple/Ripple.stylex'
import { Text } from '../Text/Text'

type Variants = 'surface' | 'primary' | 'secondary' | 'tertiary' | 'branded'

type Props = Omit<ButtonProps, 'variant' | 'trailingIcon'> & {
  size?: 'sm' | 'md' | 'lg'
  variant?: Variants
  label?: React.ReactNode
  flat?: boolean
}

export const Fab = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { variant = 'branded', children, label, icon, size = 'md', flat, fullWidth, ...rest } = props
  const extended = !!label
  return (
    <Button
      variant={'elevated'}
      icon={icon || children}
      {...rest}
      sx={[
        styles.root,
        flat && styles.flat,
        extended ? sizes.md : sizes[size],
        extended && styles.root$extended,
        variants[variant],
        fullWidth && styles.fullWidth,
        rest.sx,
      ]}
      ref={ref}>
      {label && (
        <Text variant='label' size='lg'>
          {label}
        </Text>
      )}
    </Button>
  )
})

const variants = css.create({
  surface: {
    [buttonTokens.containerColor]: palette.surfaceContainerHigh,
    [buttonTokens.labelTextColor]: palette.primary,
    [rippleTokens.color$hover]: palette.primary,
  },
  primary: {
    [buttonTokens.containerColor]: palette.primaryContainer,
    [buttonTokens.labelTextColor]: palette.onPrimaryContainer,
    [rippleTokens.color$hover]: palette.onPrimaryContainer,
    [rippleTokens.opacity$hover]: state.opacity$hover,
  },
  secondary: {
    [buttonTokens.containerColor]: palette.secondaryContainer,
    [buttonTokens.labelTextColor]: palette.onSecondaryContainer,
    [rippleTokens.color$hover]: palette.onSecondaryContainer,
    [rippleTokens.opacity$hover]: state.opacity$hover,
  },
  tertiary: {
    [buttonTokens.containerColor]: palette.tertiaryContainer,
    [buttonTokens.labelTextColor]: palette.onTertiaryContainer,
    [rippleTokens.color$hover]: palette.onTertiaryContainer,
    [rippleTokens.opacity$hover]: state.opacity$hover,
  },
  branded: {
    [buttonTokens.containerColor]: palette.surfaceContainerHigh,
    [buttonTokens.labelTextColor]: palette.primary,
    [rippleTokens.color$hover]: palette.primary,
    [rippleTokens.opacity$hover]: state.opacity$hover,
  },
})

const sizes = css.create({
  sm: {
    width: 40,
    height: 40,
    [buttonTokens.containerShape]: shape.lg,
  },
  md: {
    width: 56,
    height: 56,
    [buttonTokens.containerShape]: shape.lg,
  },
  lg: {
    width: 96,
    height: 96,
    [buttonTokens.containerShape]: shape.lg,
  },
})

const styles = css.create({
  root: {
    [buttonTokens.leadingSpace]: 0,
    [buttonTokens.trailingSpace]: 0,
    [buttonTokens.containerMinWidth]: '40px',
    [buttonTokens.containerElevation]: elevation.shadows3,
    [buttonTokens.labelTextWeight]: typeScale.labelWeight$md,
    [rippleTokens.opacity$hover]: state.opacity$hover,
  },
  root$extended: {
    width: 'auto',
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding2,
  },
  flat: {
    [buttonTokens.containerElevation]: elevation.shadows0,
  },
  fullWidth: {
    width: '100%',
  },
})
