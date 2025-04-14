import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { observer } from 'mobx-react-lite'
import type { RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { Stats } from '../Footer/Stats'
import { SidebarHeader } from './SidebarHeader'
import { SidebarMenu } from './SidebarMenu'
import { SidebarMenuWelcome } from './SidebarMenuWelcome'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const Sidebar = observer(function Sidebar(props: Props) {
  const isLogged = !!useCurrentPubkey()
  return (
    <html.aside ref={props.ref} style={[styles.sidebar, props.sx]}>
      <Stack horizontal={false}>
        <SidebarHeader />
        {isLogged && <SidebarMenu />}
        {!isLogged && <SidebarMenuWelcome />}
        <Stats />
      </Stack>
    </html.aside>
  )
})

const styles = css.create({
  sidebar: {
    zIndex: 10,
    width: 315,
    position: 'relative',
    overflowY: 'auto',
    backgroundColor: palette.surfaceContainerLowest,
    borderRight: '1px solid',
    borderRightColor: palette.outlineVariant,
  },
})
