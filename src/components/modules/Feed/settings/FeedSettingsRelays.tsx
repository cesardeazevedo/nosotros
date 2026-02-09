import { RelayInputChip } from '@/components/elements/Relays/RelayInputChip'
import { RelaySelectPopover } from '@/components/elements/Relays/RelaySelectPopover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
  name?: string
}

export const FeedSettingsRelays = memo(function FeedSettingsRelays(props: Props) {
  const { feed, name } = props
  return (
    <Stack horizontal={false} gap={0.5}>
      <Text variant='label' size='lg' sx={styles.label}>
        {name || 'Relays'}
      </Text>
      <Stack gap={0.5} wrap>
        {feed.options.ctx.relays?.map((relay) => (
          <RelayInputChip key={relay} url={relay} onDelete={() => feed.removeRelay(relay)} />
        ))}
        <RelaySelectPopover label={`Add ${name || 'relay'}`} onSubmit={(relay) => feed.addRelay(relay)} />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  label: {
    marginLeft: spacing.margin1,
  },
})
