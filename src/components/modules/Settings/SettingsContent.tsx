import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { IconPlayerPlay } from '@tabler/icons-react'

export const SettingsContent = () => {
  const settings = useGlobalSettings()
  return (
    <Stack horizontal={false} gap={1}>
      <MenuItem
        label='Auto Play'
        supportingText='Auto play videos on feed'
        htmlFor='autoplay'
        leadingIcon={<IconPlayerPlay />}
        trailing={<Switch id='autoplay' checked={settings.autoPlay} onChange={() => settings.toggle('autoPlay')} />}
      />
    </Stack>
  )
}
