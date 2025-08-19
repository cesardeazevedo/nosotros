import { RelayFavoritesList } from '@/components/modules/RelayFavorites/RelayFavoritesList'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { SidebarSubheader } from './SidebarSubheader'
import { useContext } from 'react'
import { SidebarContext } from './SidebarContext'

export const SidebarRelayFavorites = () => {
  const open = useSettings().sidebarRelaysCollapsed
  const toggle = useToggleSettings()
  const context = useContext(SidebarContext)
  return (
    <Expandable
      expanded={!open}
      onChange={() => toggle('sidebarRelaysCollapsed')}
      trigger={(triggerProps) => <SidebarSubheader {...triggerProps} label='Relay Feeds' />}>
      <RelayFavoritesList limit={8} allowDeckLink={false} onSelect={() => context.setPane(false)} />
    </Expandable>
  )
}
