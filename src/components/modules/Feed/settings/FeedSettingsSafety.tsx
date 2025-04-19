import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconBlur } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  feed: FeedStore
}

export const FeedSettingsSafety = observer(function FeedSettingsSafety(props: Props) {
  const { feed } = props
  return (
    <Stack horizontal={false} gap={0.5}>
      <Text variant='label' size='lg' sx={styles.label}>
        Safety
      </Text>
      <Stack gap={0.5} wrap>
        <Chip
          selected={feed.blured}
          variant='filter'
          icon={<IconBlur {...iconProps} />}
          label='Blur Images'
          onClick={() => feed.toggle('blured')}
        />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  label: {
    marginLeft: spacing.margin1,
  },
})
