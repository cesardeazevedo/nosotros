import { RelayFavoritesList } from '@/components/modules/RelayFavorites/RelayFavoritesList'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { SidebarSubheader } from './SidebarSubheader'

export const SidebarRelayFavorites = () => {
  const open = useSettings().sidebarRelaysCollapsed
  const toggle = useToggleSettings()
  return (
    <Expandable
      expanded={!open}
      onChange={() => toggle('sidebarRelaysCollapsed')}
      trigger={(triggerProps) => <SidebarSubheader {...triggerProps} label='Relay Feeds' />}>
      <RelayFavoritesList limit={8} allowDeckLink={false} />
    </Expandable>
  )
}
