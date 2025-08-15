import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useSettings } from '@/hooks/useSettings'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const SettingsScrollLoader = memo(function SettingsScrollLoader() {
  const settings = useSettings()
  return (
    <Stack horizontal={false} gap={1}>
      <Text sx={styles.description} size='md'>
        Reactions and zaps are loaded as you scroll through the feed, you can disable them to save bandwidth.
      </Text>
      {/* <MenuItem */}
      {/*   label='Reactions' */}
      {/*   htmlFor='reactions' */}
      {/*   leadingIcon={<IconHeart />} */}
      {/*   trailing={ */}
      {/*     <Switch */}
      {/*       id='reactions' */}
      {/*       checked={settings.scroll.reactions} */}
      {/*       onChange={() => settings.scroll.toggle('reactions')} */}
      {/*     /> */}
      {/*   } */}
      {/* /> */}
      {/* <MenuItem */}
      {/*   label='Replies' */}
      {/*   htmlFor='replies' */}
      {/*   leadingIcon={<IconMessageCircle />} */}
      {/*   trailing={ */}
      {/*     <Switch id='replies' checked={settings.scroll.replies} onChange={() => settings.scroll.toggle('replies')} /> */}
      {/*   } */}
      {/* /> */}
      {/* <MenuItem */}
      {/*   label='Zaps' */}
      {/*   htmlFor='zaps' */}
      {/*   leadingIcon={<IconBolt strokeWidth='1.8' />} */}
      {/*   trailing={<Switch id='zaps' checked={settings.scroll.zaps} onChange={() => settings.scroll.toggle('zaps')} />} */}
      {/* /> */}
      {/* <MenuItem */}
      {/*   label='Reposts' */}
      {/*   htmlFor='reposts' */}
      {/*   leadingIcon={<IconShare3 />} */}
      {/*   trailing={ */}
      {/*     <Switch id='reposts' checked={settings.scroll.reposts} onChange={() => settings.scroll.toggle('reposts')} /> */}
      {/*   } */}
      {/* /> */}
    </Stack>
  )
})

const styles = css.create({
  description: {
    paddingInline: spacing.padding2,
    maxWidth: 400,
  },
})
