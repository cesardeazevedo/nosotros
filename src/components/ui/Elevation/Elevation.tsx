import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { elevation } from '@/themes/elevation.stylex'
import { css, html } from 'react-strict-dom'
import type { SxProps } from '../types'
import { elevationTokens } from './Elevation.stylex'

export type ElevationLevel = 0 | 1 | 2 | 3 | 4

type Props = {
  sx?: SxProps
  elevation?: ElevationLevel
}

export function Elevation(props: Props) {
  const { sx, elevation } = props
  return <html.div style={[styles.root, !!elevation && styles[`level${elevation}`], sx]} />
}

const styles = css.create({
  root: {
    position: 'absolute',
    display: 'flex',
    pointerEvents: 'none',
    transitionProperty: 'box-shadow',
    transitionDuration: duration.short4,
    transitionTimingFunction: easing.emphasized,
    borderRadius: 'inherit',
    boxShadow: elevationTokens.boxShadow,
    inset: 0,
  },
  level0: { boxShadow: elevation.shadows0 },
  level1: { boxShadow: elevation.shadows1 },
  level2: { boxShadow: elevation.shadows2 },
  level3: { boxShadow: elevation.shadows3 },
  level4: { boxShadow: elevation.shadows4 },
})
