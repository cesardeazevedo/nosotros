import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useSetSettings, useSettings } from '@/hooks/useSettings'
import { useMobile } from '@/hooks/useMobile'
import { IconMenu2 } from '@tabler/icons-react'

export const FeedsPaneToggleButton = () => {
  const isMobile = useMobile()
  const { feedsPaneCollapsed } = useSettings()
  const setSettings = useSetSettings()

  if (isMobile) {
    return null
  }

  return (
    <IconButton
      aria-label='Toggle feeds column'
      selected={!feedsPaneCollapsed}
      onClick={() => setSettings({ feedsPaneCollapsed: !feedsPaneCollapsed })}>
      <IconMenu2 size={22} strokeWidth='1.8' />
    </IconButton>
  )
}
