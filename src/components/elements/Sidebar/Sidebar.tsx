import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { memo, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { Stats } from '../Footer/Stats'
import { SidebarHeader } from './SidebarHeader'
import { SidebarMenu } from './SidebarMenu'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const Sidebar = memo(function Sidebar(props: Props) {
  return (
    <html.aside ref={props.ref} style={[styles.sidebar, props.sx]}>
      <Stack horizontal={false}>
        <SidebarHeader />
        <SidebarMenu />
        <Stats />
      </Stack>
    </html.aside>
  )
})

const styles = css.create({
  sidebar: {
    zIndex: 50,
    width: 315,
    top: 0,
    bottom: 0,
    position: 'fixed',
    overflowY: 'auto',
    backgroundColor: palette.surfaceContainerLowest,
    borderRight: '1px solid',
    borderRightColor: palette.outlineVariant,
  },
})
