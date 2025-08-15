import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import type { MediaFeedState } from '@/hooks/state/useMediaFeed'
import { IconLayoutGrid, IconLayoutRows } from '@tabler/icons-react'
import { memo } from 'react'

type Props = {
  feed: MediaFeedState
}

export const MediaFeedLayoutButtons = memo(function MediaFeedLayoutButtons(props: Props) {
  const { feed } = props
  return (
    <Stack align='flex-end' gap={0.5}>
      <Chip
        selected={feed.layout === 'row'}
        onClick={() => feed.setLayout('row')}
        icon={<IconLayoutRows size={18} strokeWidth='1.5' />}
        label='Row'
      />
      <Chip
        icon={<IconLayoutGrid size={18} strokeWidth='1.5' />}
        selected={feed.layout === 'grid'}
        onClick={() => feed.setLayout('grid')}
        label='Grid'
      />
    </Stack>
  )
})
