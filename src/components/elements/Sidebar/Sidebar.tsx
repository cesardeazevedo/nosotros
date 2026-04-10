import type { SxProps } from '@/components/ui/types'
import { useSettings } from '@/hooks/useSettings'
import { spacing } from '@/themes/spacing.stylex'
import { memo, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { Stats } from '../Footer/Stats'
import { SidebarHeader } from './SidebarHeader'
import { SidebarMenu } from './SidebarMenu'
import { ProfilePopover } from '../Navigation/ProfilePopover'
import { Stack } from '@/components/ui/Stack/Stack'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const Sidebar = memo(function Sidebar(props: Props) {
  const { sidebarCollapsed } = useSettings()
  return (
    <html.aside ref={props.ref} style={[styles.sidebar, sidebarCollapsed && styles.sidebar$collapsed, props.sx]}>
      <SidebarHeader />
      <SidebarMenu />
      <Stack gap={2} horizontal={false} sx={styles.footer}>
        <ProfilePopover />
        {!sidebarCollapsed && <Stats />}
      </Stack>
    </html.aside>
  )
})

const styles = css.create({
  sidebar: {
    // bottom: 0,
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: spacing.padding2,
    overflow: 'hidden',
  },
  sidebar$collapsed: {},
  footer: {
    padding: spacing.padding2,
    overflow: 'hidden',
    maxHeight: 160,
    transitionProperty: 'opacity, max-height',
    transitionDuration: '180ms',
    position: 'absolute',
    bottom: 24,
  }
})
