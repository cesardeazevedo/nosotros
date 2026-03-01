import type { ColorPalette } from '@/themes/palette.stylex'
import { palette } from '@/themes/palette.stylex'
import type { ShapeKey } from '@/themes/shape.stylex'
import { shape } from '@/themes/shape.stylex'
import type { UserAuthoredStyles } from '@stylexjs/stylex/lib/StyleXTypes'
import React, { forwardRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import type { ElevationLevel } from '../Elevation/Elevation'
import { Elevation } from '../Elevation/Elevation'
import type { ContainerTextColors } from '../helpers/getContainerText'
import { getContainerTextColor } from '../helpers/getContainerText'
import type { SxProps } from '../types'

type PaperSurfaces = keyof Pick<
  ColorPalette,
  | 'surface'
  | 'primaryContainer'
  | 'secondaryContainer'
  | 'tertiaryContainer'
  | 'errorContainer'
  | 'surfaceContainerLowest'
  | 'surfaceContainerLow'
  | 'surfaceContainer'
  | 'surfaceContainerHigh'
  | 'surfaceContainerHighest'
  | 'inverseSurface'
  | 'inversePrimary'
>

export type Props = {
  sx?: SxProps
  shape?: ShapeKey
  outlined?: boolean
  surface?: PaperSurfaces
  elevation?: ElevationLevel
  children: React.ReactNode
  onClick?: (e: StrictClickEvent) => void
}

export const Paper = forwardRef<HTMLDivElement, Props>(function Paper(props, ref) {
  const { children, surface, shape = 'xl', elevation, outlined = false, onClick } = props
  const text = getContainerTextColor(surface)
  return (
    <html.div
      style={[styles.root, outlined && styles.root$outlined, surface && surfaces[surface], shapes[shape], textColors[text], props.sx]}
      ref={ref}
      onClick={onClick}>
      {!!elevation && <Elevation elevation={elevation} />}
      {children}
    </html.div>
  )
})

const textColors = css.create({
  onSurface: { color: palette.onSurface },
  onPrimary: { color: palette.onPrimary },
  onPrimaryContainer: { color: palette.onPrimaryContainer },
  onSecondary: { color: palette.onSecondary },
  onSecondaryContainer: { color: palette.onSecondaryContainer },
  onTertiary: { color: palette.onTertiary },
  onTertiaryContainer: { color: palette.onTertiaryContainer },
  inverseOnSurface: { color: palette.inverseOnSurface },
  onError: { color: palette.onError },
  onErrorContainer: { color: palette.onErrorContainer },
} as Record<ContainerTextColors, UserAuthoredStyles>)

const surfaces = css.create({
  surface: { backgroundColor: palette.surface },
  primaryContainer: { backgroundColor: palette.primaryContainer },
  secondaryContainer: { backgroundColor: palette.secondaryContainer },
  tertiaryContainer: { backgroundColor: palette.tertiaryContainer },
  errorContainer: { backgroundColor: palette.errorContainer },
  surfaceContainerLowest: { backgroundColor: palette.surfaceContainerLowest },
  surfaceContainerLow: { backgroundColor: palette.surfaceContainerLow },
  surfaceContainer: { backgroundColor: palette.surfaceContainer },
  surfaceContainerHigh: { backgroundColor: palette.surfaceContainerHigh },
  surfaceContainerHighest: { backgroundColor: palette.surfaceContainerHighest },
  inverseSurface: { backgroundColor: palette.inverseSurface },
  inversePrimary: { backgroundColor: palette.inversePrimary },
} as Record<PaperSurfaces, UserAuthoredStyles>)

const shapes = css.create({
  none: { borderRadius: shape.none },
  xs: { borderRadius: shape.xs },
  sm: { borderRadius: shape.sm },
  md: { borderRadius: shape.md },
  lg: { borderRadius: shape.lg },
  xl: { borderRadius: shape.xl },
  full: { borderRadius: shape.full },
})

const styles = css.create({
  root: {
    position: 'relative',
    color: palette.onSurface,
    zIndex: 0,
    flexGrow: 1,
  },
  root$outlined: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },
})
