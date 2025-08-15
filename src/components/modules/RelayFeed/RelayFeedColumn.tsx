import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { RelayHeader } from '@/components/elements/Relays/RelayHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { palette } from '@/themes/palette.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { FeedHeader } from '../Feed/FeedHeader'
import { FeedReplyTabs } from '../Feed/FeedReplyTabs'

type Props = {
  module: FeedModule
}

export const RelayFeedColumn = memo(function RelayFeedColumn(props: Props) {
  const feed = useFeedState(props.module)
  const url = props.module.ctx.relays![0]

  return (
    <DeckColumnFeed
      wrapper={(children) => (
        <>
          <RelayHeader url={url} />
          <Divider />
          <Stack justify='flex-start' sx={styles.sticky}>
            <FeedReplyTabs feed={feed} onChange={(tab) => feed.setReplies(tab === 'replies')} />
          </Stack>
          <Divider />
          <EditorProvider initialOpen={false} />
          <Divider />
          {children}
        </>
      )}
      header={<FeedHeader feed={feed} />}
      feed={feed}
    />
  )
})

const styles = css.create({
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: palette.surfaceContainerLowest,
  },
})
