import { elevation } from '@/themes/elevation.stylex'
import { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import type { StrictReactDOMProps } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { ButtonBase } from '../ButtonBase/ButtonBase'
import { Elevation } from '../Elevation/Elevation'
import { elevationTokens } from '../Elevation/Elevation.stylex'
import type { Props as PaperProps } from '../Paper/Paper'
import { Paper } from '../Paper/Paper'
import type { SxProps } from '../types'
import { cardTokens } from './Card.stylex'

type CardVariant = 'elevated' | 'filled' | 'outlined'

type Props = PaperProps & {
  sx?: SxProps
  variant?: CardVariant
  children: React.ReactNode
  disabled?: boolean
  onClick?: StrictReactDOMProps['onClick']
}

export const Card = forwardRef<HTMLButtonElement, Props>(function Card(props, ref) {
  const { sx, variant = 'filled', children, disabled = false, onClick, ...rest } = props

  const elevation = variant === 'elevated'
  const actionable = !disabled && !!onClick

  return (
    <Paper outlined={variant === 'outlined'} {...rest} sx={[styles.root, !actionable && sx]}>
      {actionable && (
        <ButtonBase
          sx={[styles.actionable, variants[variant], sx]}
          onClick={actionable ? onClick : undefined}
          ref={ref}>
          {elevation && <Elevation sx={styles.elevation} />}
          {children}
        </ButtonBase>
      )}
      {!actionable && children}
    </Paper>
  )
})

const variants = css.create({
  filled: {},
  outlined: {},
  elevated: {
    [cardTokens.containerElevation]: {
      default: elevation.shadows2,
      ':is([data-focused])': elevation.shadows0,
      ':is([data-hovered])': elevation.shadows4,
      ':is([data-pressed])': elevation.shadows1,
    },
  },
})

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: cardTokens.containerShape,
    width: '100%',
  },
  actionable: {
    overflow: 'hidden',
  },
  elevation: {
    [elevationTokens.boxShadow]: cardTokens.containerElevation,
  },
})
