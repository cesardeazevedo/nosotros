import { Badge } from '@/components/ui/Badge/Badge'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import type { FeedState } from '@/hooks/state/useFeed'
import { memo, type ReactNode } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
  onChange?: (tab: 'notes' | 'replies' | undefined) => void
  children?: ReactNode
}

export const FeedReplyTabs = memo(function FeedReplyTabs(props: Props) {
  const { feed, onChange } = props
  return (
    <Stack justify='flex-start' align='center' sx={styles.root}>
      <Tabs anchor={feed.replies ? 'replies' : 'notes'} onChange={(e) => onChange?.(e as 'notes' | 'replies')}>
        <Tab
          sx={styles.tab}
          anchor='notes'
          label='Notes'
          badge={feed.bufferTotal && <Badge dot={!feed.replies} variant='secondary' value={feed.bufferTotal} />}
        />
        <Tab
          sx={styles.tab}
          anchor='replies'
          label='Threads'
          badge={
            feed.bufferTotalReplies && <Badge dot={feed.replies} variant='secondary' value={feed.bufferTotalReplies} />
          }
        />
      </Tabs>
    </Stack>
  )
})

const styles = css.create({
  root: {
    height: 64,
  },
  tab: {
    height: 48,
  },
})
