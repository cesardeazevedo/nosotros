import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { IconPlayerPlay } from '@tabler/icons-react'

export const SettingsContent = () => {
  const settings = useSettings()
  const toggle = useToggleSettings()
  return (
    <Stack horizontal={false} gap={1}>
      <MenuItem
        label='Auto Play'
        supportingText='Auto play videos on feed'
        htmlFor='autoplay'
        leadingIcon={<IconPlayerPlay />}
        trailing={<Switch id='autoplay' checked={settings.autoPlay} onChange={() => toggle('autoPlay')} />}
      />
    </Stack>
  )
}
