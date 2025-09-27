import { RelayFavoritesList } from '@/components/modules/RelayFavorites/RelayFavoritesList'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { useMobile } from '@/hooks/useMobile'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { useContext } from 'react'
import { SidebarContext } from './SidebarContext'
import { SidebarSubheader } from './SidebarSubheader'

export const SidebarRelayFavorites = () => {
  const isMobile = useMobile()
  const open = useSettings().sidebarRelaysCollapsed
  const toggle = useToggleSettings()
  const context = useContext(SidebarContext)
  return (
    <Expandable
      expanded={!open}
      onChange={() => toggle('sidebarRelaysCollapsed')}
      trigger={(triggerProps) => <SidebarSubheader {...triggerProps} label='Relay Feeds' />}>
      <RelayFavoritesList limit={isMobile ? 6 : 8} allowDeckLink={false} onSelect={() => context.setPane(false)} />
    </Expandable>
  )
}
