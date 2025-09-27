import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { FeedHeader } from '../Feed/FeedHeader'
import { FeedReplyTabs } from '../Feed/FeedReplyTabs'
import { Stack } from '@/components/ui/Stack/Stack'
import { css } from 'react-strict-dom'
import { palette } from '@/themes/palette.stylex'
import { Divider } from '@/components/ui/Divider/Divider'

type Props = {
  module: FeedModule
}

export const ListColumn = (props: Props) => {
  const feed = useFeedState(props.module)
  return (
    <DeckColumnFeed
      feed={feed}
      wrapper={(children) => (
        <>
          <Stack justify='flex-start' sx={styles.sticky}>
            <FeedReplyTabs feed={feed} onChange={(tab) => feed.setReplies(tab === 'replies')} />
          </Stack>
          <Divider />
          {children}
        </>
      )}
      header={<FeedHeader feed={feed} />}
    />
  )
}

const styles = css.create({
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: palette.surfaceContainerLowest,
  },
})
