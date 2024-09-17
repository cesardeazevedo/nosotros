import { css, html } from 'react-strict-dom'
import type { ElevationLevel } from '../Elevation/Elevation'
import { Elevation } from '../Elevation/Elevation'
import { Stack } from '../Stack/Stack'
import { shape } from '@/themes/shape.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { SxProps } from '../types'

type Props = {
  sx?: SxProps
  elevation?: ElevationLevel
  children?: React.ReactNode
}

export const MenuList = (props: Props) => {
  const { elevation = 2 } = props
  return (
    <html.div style={[styles.root, props.sx]}>
      <Elevation elevation={elevation} />
      <Stack gap={1} horizontal={false}>
        {props.children}
      </Stack>
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    borderRadius: shape.xs,
    backgroundColor: palette.surfaceContainerLow,
    borderStyle: 'unset',
    flexGrow: 1,
    color: 'inherit',
    userSelect: 'none',
    height: 'inherit',
    width: '100%',
    outline: 'none',
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
  },
})
