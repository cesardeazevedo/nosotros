import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { IconBolt, IconHeart, IconMessageCircle, IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'

export const SettingsContent = observer(function SettingsContent() {
  const settings = useGlobalNostrSettings()
  return (
    <>
      <MenuItem
        label='Reactions'
        htmlFor='reactions'
        leadingIcon={<IconHeart />}
        trailing={
          <Switch
            id='reactions'
            checked={settings.scroll.reactions}
            onChange={() => settings.scroll.toggle('reactions')}
          />
        }
      />
      <MenuItem
        label='Replies'
        htmlFor='replies'
        leadingIcon={<IconMessageCircle />}
        trailing={
          <Switch id='replies' checked={settings.scroll.replies} onChange={() => settings.scroll.toggle('replies')} />
        }
      />
      <MenuItem
        label='Zaps'
        htmlFor='zaps'
        leadingIcon={<IconBolt strokeWidth='1.8' />}
        trailing={<Switch id='zaps' checked={settings.scroll.zaps} onChange={() => settings.scroll.toggle('zaps')} />}
      />
      <MenuItem
        label='Reposts'
        htmlFor='reposts'
        leadingIcon={<IconShare3 />}
        trailing={
          <Switch id='reposts' checked={settings.scroll.reposts} onChange={() => settings.scroll.toggle('reposts')} />
        }
      />
    </>
  )
})
