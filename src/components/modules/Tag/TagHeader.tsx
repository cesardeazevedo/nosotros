import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
  tags?: string[]
}

export const TagHeader = memo(function TagHeader(props: Props) {
  const { feed } = props
  const tags = feed.filter['#t'] || props.tags
  return (
    <Stack gap={0.5} sx={styles.root} justify='flex-start'>
      {tags?.slice(0, 4).map((tag) => <Chip key={tag} label={`#${tag}`} />)}
    </Stack>
  )
})

const styles = css.create({
  root: {
    maxWidth: 380,
    overflowX: 'auto',
  },
})
