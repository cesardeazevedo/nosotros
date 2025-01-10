import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt, IconHeart, IconMessageCircle, IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const SettingsContent = observer(function SettingsContent() {
  const settings = useGlobalNostrSettings()
  return (
    <>
      <Text sx={styles.description}>
        Reactions and zaps are loaded as you scroll through the feed, you can disable them to save bandwidth.
      </Text>
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

const styles = css.create({
  description: {
    paddingInline: spacing.padding2,
  },
})
