import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import React from 'react'
import { css } from 'react-strict-dom'
import type { Props as ButtonProps } from '../Button/Button'
import { Button } from '../Button/Button'
import { buttonTokens } from '../Button/Button.stylex'
import { Text } from '../Text/Text'

type Variants = 'primary' | 'secondary' | 'tertiary'

type Props = Omit<ButtonProps, 'variant' | 'trailingIcon'> & {
  size?: 'sm' | 'md' | 'lg'
  variant?: Variants
  label?: React.ReactNode
  flat?: boolean
}

export const Fab = (props: Props) => {
  const { variant = 'primary', children, label, size = 'md', flat, fullWidth, sx, ...rest } = props
  const extended = !!label
  return (
    <Button
      variant='elevated'
      sx={[
        styles.root,
        extended ? sizes.extended : sizes[size],
        variants[variant],
        flat && styles.flat,
        fullWidth && styles.fullWidth,
        sx,
      ]}
      {...rest}>
      {children}
      {label && (
        <Text variant='label' size='lg' sx={styles.label}>
          {label}
        </Text>
      )}
    </Button>
  )
}

const variants = css.create({
  primary: {
    [buttonTokens.containerColor]: palette.primaryContainer,
    [buttonTokens.containerColor$hover]: palette.primaryFixedDim,
    [buttonTokens.containerColor$pressed]: palette.primaryContainer,
    [buttonTokens.containerColor$disabled]: palette.surfaceContainerHigh,

    [buttonTokens.labelTextColor]: palette.onPrimaryContainer,
    [buttonTokens.labelTextColor$hover]: palette.onPrimaryContainer,
    [buttonTokens.labelTextColor$pressed]: palette.onPrimaryContainer,
    [buttonTokens.labelTextColor$focus]: palette.onPrimaryContainer,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
  },
  secondary: {
    [buttonTokens.containerColor]: palette.secondaryContainer,
    [buttonTokens.containerColor$hover]: palette.secondaryContainer,
    [buttonTokens.containerColor$pressed]: palette.secondaryContainer,
    [buttonTokens.containerColor$disabled]: palette.surfaceContainerHigh,

    [buttonTokens.labelTextColor]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$hover]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$pressed]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$focus]: palette.onSecondaryContainer,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
  },
  tertiary: {
    [buttonTokens.containerColor]: palette.tertiaryContainer,
    [buttonTokens.containerColor$hover]: palette.tertiaryContainer,
    [buttonTokens.containerColor$pressed]: palette.tertiaryContainer,
    [buttonTokens.containerColor$disabled]: palette.surfaceContainerHigh,

    [buttonTokens.labelTextColor]: palette.onTertiaryContainer,
    [buttonTokens.labelTextColor$hover]: palette.onTertiaryContainer,
    [buttonTokens.labelTextColor$pressed]: palette.onTertiaryContainer,
    [buttonTokens.labelTextColor$focus]: palette.onTertiaryContainer,
    [buttonTokens.labelTextColor$disabled]: palette.onSurface,
  },
})

const sizes = css.create({
  sm: {
    [buttonTokens.containerHeight]: 40,
    [buttonTokens.containerMinWidth]: 40,
    [buttonTokens.containerShape]: shape.lg,
  },
  md: {
    [buttonTokens.containerHeight]: 56,
    [buttonTokens.containerMinWidth]: 56,
    [buttonTokens.containerShape]: shape.lg,
  },
  lg: {
    [buttonTokens.containerHeight]: 96,
    [buttonTokens.containerMinWidth]: 96,
    [buttonTokens.containerShape]: shape.lg,
  },
  extended: {
    [buttonTokens.containerHeight]: 56,
    [buttonTokens.containerMinWidth]: 80,
    [buttonTokens.containerShape]: shape.lg,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding2,
  },
})

const styles = css.create({
  root: {
    [buttonTokens.leadingSpace]: 0,
    [buttonTokens.trailingSpace]: 0,
    [buttonTokens.labelTextWeight]: typeScale.labelWeight$md,
    [buttonTokens.containerElevation]: {
      default: elevation.shadows3,
      ':hover': elevation.shadows4, // visual feedback via elevation bump
      ':active': elevation.shadows2,
      ':disabled': elevation.shadows0,
    },
  },
  flat: {
    [buttonTokens.containerElevation]: elevation.shadows0,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    marginInlineStart: spacing.padding1,
    whiteSpace: 'nowrap',
  },
})
